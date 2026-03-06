const express = require('express');
const OpenAI = require('openai');
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');

const router = express.Router();

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// All AI routes require authentication
router.use(protect);

// POST /api/ai/optimize-trip
router.post('/optimize-trip', async (req, res, next) => {
  try {
    const { tripId } = req.body;

    const trip = await Trip.findOne({
      _id: tripId,
      $or: [{ userId: req.user._id }, { collaborators: req.user._id }],
    });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ success: false, message: 'AI service not configured' });
    }

    const activitiesSummary = trip.activities
      .map((a) => `Day ${a.day} ${a.time}: ${a.title} at ${a.location}`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert travel planner. Analyze the provided itinerary and suggest an optimized ordering that minimizes travel time and groups nearby attractions. Return a JSON array of activity objects with the same structure but reordered days/times. Be concise.',
        },
        {
          role: 'user',
          content: `Trip: ${trip.title} in ${trip.destination}\n\nCurrent itinerary:\n${activitiesSummary}\n\nProvide an optimized itinerary as JSON.`,
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const optimized = JSON.parse(completion.choices[0].message.content);

    res.json({
      success: true,
      optimizedActivities: optimized.activities || optimized,
      reasoning: optimized.reasoning || 'Activities reordered for minimal travel time.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/recommendations
router.post('/recommendations', async (req, res, next) => {
  try {
    const { interests, budget, duration, departureFrom } = req.body;

    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ success: false, message: 'AI service not configured' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a personalized travel recommendation engine. Return a JSON object with a "destinations" array of 5 recommended destinations, each with: name, country, description, estimatedCost, bestFor, emoji.',
        },
        {
          role: 'user',
          content: `Interests: ${interests?.join(', ')}\nBudget: ${budget} USD\nTrip duration: ${duration} days\nDeparting from: ${departureFrom}`,
        },
      ],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ success: false, message: 'AI service not configured' });
    }

    const messages = [
      {
        role: 'system',
        content:
          'You are AtlasAI, a helpful and enthusiastic travel assistant for the AtlasTrip app. Help users plan trips, find destinations, get travel tips, and answer questions about countries, visas, packing, and more. Keep responses concise and friendly.',
      },
      ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content;
    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
