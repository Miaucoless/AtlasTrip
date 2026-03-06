const express = require('express');
const axios = require('axios');
const { supabase } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/destinations – search / filter
router.get('/', async (req, res, next) => {
  try {
    const { q, category, continent, limit = 20, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('destinations')
      .select('*')
      .order('rating', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (q) {
      query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,country.ilike.%${q}%`);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (continent) {
      query = query.eq('continent', continent);
    }

    const { data: destinations, error } = await query;
    if (error) return res.status(500).json({ success: false, message: error.message });

    res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/trending
router.get('/trending', async (req, res, next) => {
  try {
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_trending', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/hidden-gems
router.get('/hidden-gems', async (req, res, next) => {
  try {
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_hidden_gem', true)
      .order('rating', { ascending: false })
      .limit(10);

    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, destinations });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/cities – globe city markers
router.get('/cities', async (req, res, next) => {
  try {
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .order('population', { ascending: false })
      .limit(200);

    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, cities });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data: destination, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !destination) {
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
    const { data: destination, error } = await supabase
      .from('destinations')
      .select('latitude, longitude, name')
      .eq('id', req.params.id)
      .single();

    if (error || !destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const { latitude: lat, longitude: lng } = destination;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'No coordinates for this destination' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'Weather service not configured' });
    }

    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&cnt=40`,
    );

    const weather = {
      current: {
        temp: Math.round(data.list[0].main.temp),
        feels_like: Math.round(data.list[0].main.feels_like),
        description: data.list[0].weather[0].description,
        icon: data.list[0].weather[0].icon,
        humidity: data.list[0].main.humidity,
        windSpeed: Math.round(data.list[0].wind.speed),
      },
      forecast: data.list.slice(0, 7).map((item) => ({
        date: item.dt_txt,
        temp: Math.round(item.main.temp),
        temp_min: Math.round(item.main.temp_min),
        temp_max: Math.round(item.main.temp_max),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        pop: item.pop,
      })),
    };

    res.json({ success: true, weather });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/weather/coords?lat=&lon= – weather by coordinates
router.get('/weather/coords', protect, async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'lat and lon are required' });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'Weather service not configured' });
    }

    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
    );

    res.json({
      success: true,
      weather: {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        city: data.name,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

