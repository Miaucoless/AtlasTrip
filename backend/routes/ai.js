const express = require('express');
const OpenAI = require('openai');
const { supabase } = require('../config/db');
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

    const { data: trip } = await supabase
      .from('trips')
      .select('*, trip_itineraries(*)')
      .eq('id', tripId)
      .single();

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ success: false, message: 'AI service not configured' });
    }

    const items = trip.trip_itineraries || [];
    const activitiesSummary = items
      .map((a) => `Day ${a.day_number} ${a.start_time || ''}: ${a.name} at ${a.location || 'TBD'} (${a.type})`)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert travel planner. Analyze the provided itinerary and suggest an optimized ordering that minimizes travel time and groups nearby attractions. Also suggest 3 hidden gems for this destination. Return a JSON object with: "optimizedItems" (array with reordered items, same IDs), "reasoning" (string), "hiddenGems" (array of {name, description, type, estimatedCost}).',
        },
        {
          role: 'user',
          content: `Trip: ${trip.title} in ${trip.destination || 'multiple destinations'}\n\nCurrent itinerary:\n${activitiesSummary}\n\nOptimize this itinerary.`,
        },
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const optimized = JSON.parse(completion.choices[0].message.content);

    res.json({
      success: true,
      optimizedItems: optimized.optimizedItems || optimized.activities || [],
      hiddenGems: optimized.hiddenGems || [],
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
            'You are a personalized travel recommendation engine. Return a JSON object with a "destinations" array of 5 recommended destinations, each with: name, country, city, description, estimatedCost, bestFor, emoji, category, topAttractions (array of 3 strings), bestTimeToVisit.',
        },
        {
          role: 'user',
          content: `Interests: ${interests?.join(', ')}\nBudget: $${budget} USD\nTrip duration: ${duration} days\nDeparting from: ${departureFrom}`,
        },
      ],
      max_tokens: 1000,
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
    const { message, history = [], context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ success: false, message: 'AI service not configured' });
    }

    let systemPrompt =
      'You are AtlasAI, a helpful and enthusiastic travel assistant for the AtlasTrip app. Help users plan trips, find destinations, get travel tips, and answer questions about countries, visas, packing, culture, food, and more. Keep responses concise, friendly, and actionable.';

    if (context?.tripTitle) {
      systemPrompt += ` The user is currently planning a trip: ${context.tripTitle}.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10).map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 600,
    });

    const reply = completion.choices[0].message.content;
    res.json({ success: true, reply });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/trip-story – generate trip replay narrative
router.post('/trip-story', async (req, res, next) => {
  try {
    const { tripId } = req.body;

    const { data: trip } = await supabase
      .from('trips')
      .select('*, trip_itineraries(*)')
      .eq('id', tripId)
      .single();

    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const openai = getOpenAI();
    if (!openai) {
      return res.status(503).json({ success: false, message: 'AI service not configured' });
    }

    const highlights = (trip.trip_itineraries || [])
      .slice(0, 10)
      .map((i) => `${i.name} (${i.type}) on Day ${i.day_number}`)
      .join(', ');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a travel storyteller. Create an exciting, shareable 3-sentence trip story for a travel recap. Make it vivid and inspiring. Return JSON with: "title" (catchy trip title), "story" (3 sentence narrative), "hashtags" (array of 5 relevant hashtags).',
        },
        {
          role: 'user',
          content: `Trip: ${trip.title}\nDestination: ${trip.destination || 'multiple destinations'}\nDates: ${trip.start_date} to ${trip.end_date}\nHighlights: ${highlights}`,
        },
      ],
      max_tokens: 400,
      response_format: { type: 'json_object' },
    });

    const story = JSON.parse(completion.choices[0].message.content);
    res.json({ success: true, ...story });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/hidden-gems/:destination
router.get('/hidden-gems/:destination', async (req, res, next) => {
  try {
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
            'You are a local travel expert. Suggest 5 hidden gems (lesser-known places) for the given destination. Return JSON with "gems" array, each with: name, description, category (restaurant/attraction/neighborhood/experience), why_special, best_time.',
        },
        {
          role: 'user',
          content: `Hidden gems in ${req.params.destination}`,
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

module.exports = router;

