const express = require('express');
const { supabase } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All hotel routes require authentication
router.use(protect);

// GET /api/hotels – list user's saved hotels
router.get('/', async (req, res, next) => {
  try {
    const { trip_id } = req.query;
    let query = supabase
      .from('hotels')
      .select('*')
      .eq('user_id', req.user.id)
      .order('check_in', { ascending: true });

    if (trip_id) query = query.eq('trip_id', trip_id);

    const { data: hotels, error } = await query;
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, hotels });
  } catch (err) {
    next(err);
  }
});

// POST /api/hotels – save a hotel
router.post('/', async (req, res, next) => {
  try {
    const { data: hotel, error } = await supabase
      .from('hotels')
      .insert({ ...req.body, user_id: req.user.id })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, hotel });
  } catch (err) {
    next(err);
  }
});

// PUT /api/hotels/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { data: hotel, error } = await supabase
      .from('hotels')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, hotel });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/hotels/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Hotel removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
