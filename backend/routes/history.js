const express = require('express');
const { supabase } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/history – user's travel history
router.get('/', async (req, res, next) => {
  try {
    const { data: history, error } = await supabase
      .from('travel_history')
      .select('*, trips(title, cover_image_url)')
      .eq('user_id', req.user.id)
      .order('visited_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, message: error.message });

    // Compute statistics
    const countries = [...new Set(history.map((h) => h.country_code).filter(Boolean))];
    const cities = [...new Set(history.map((h) => h.city).filter(Boolean))];
    const totalMiles = history.reduce((sum, h) => sum + (h.miles_flown || 0), 0);
    const continents = [...new Set(history.map((h) => h.continent).filter(Boolean))];

    res.json({
      success: true,
      history,
      stats: {
        countriesVisited: countries.length,
        citiesVisited: cities.length,
        totalMilesFlown: Math.round(totalMiles),
        continentsVisited: continents.length,
        tripsCompleted: [...new Set(history.map((h) => h.trip_id).filter(Boolean))].length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/history – add entry
router.post('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('travel_history')
      .insert({ ...req.body, user_id: req.user.id })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, entry: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/history/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('travel_history')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
