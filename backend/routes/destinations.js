const express = require('express');
const axios = require('axios');
const Destination = require('../models/Destination');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/destinations – search / filter
router.get('/', async (req, res, next) => {
  try {
    const { q, category, continent, limit = 20, page = 1 } = req.query;
    const filter = {};

    if (q) {
      filter.$text = { $search: q };
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (continent) {
      filter.continent = continent;
    }

    const destinations = await Destination.find(filter)
      .sort({ popularityScore: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/trending
router.get('/trending', async (req, res, next) => {
  try {
    const destinations = await Destination.find({ isTrending: true })
      .sort({ popularityScore: -1 })
      .limit(10);

    res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/hidden-gems
router.get('/hidden-gems', async (req, res, next) => {
  try {
    const destinations = await Destination.find({ isHiddenGem: true })
      .sort({ rating: -1 })
      .limit(10);

    res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    res.json({ success: true, destination });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/:id/weather
router.get('/:id/weather', protect, async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const { lat, lng } = destination.coordinates;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'No coordinates for this destination' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'Weather service not configured' });
    }

    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&cnt=7`,
    );

    const weather = {
      current: {
        temp: Math.round(data.list[0].main.temp),
        description: data.list[0].weather[0].description,
        icon: data.list[0].weather[0].icon,
        humidity: data.list[0].main.humidity,
        windSpeed: Math.round(data.list[0].wind.speed),
      },
      forecast: data.list.slice(0, 7).map((item) => ({
        date: item.dt_txt,
        temp: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      })),
    };

    res.json({ success: true, weather });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
