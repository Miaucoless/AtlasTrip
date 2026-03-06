const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All trip routes require authentication
router.use(protect);

// GET /api/trips – list user's trips (owned + collaborated)
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get owned trips
    let ownedQuery = supabase
      .from('trips')
      .select('*')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) ownedQuery = ownedQuery.eq('status', status);

    const { data: ownedTrips, error: ownedError } = await ownedQuery;
    if (ownedError) return res.status(500).json({ success: false, message: ownedError.message });

    // Get collaborated trip IDs
    const { data: collabRows } = await supabase
      .from('trip_collaborators')
      .select('trip_id')
      .eq('user_id', req.user.id)
      .eq('status', 'accepted');

    let collabTrips = [];
    if (collabRows?.length) {
      const collabIds = collabRows.map((r) => r.trip_id);
      let collabQ = supabase
        .from('trips')
        .select('*')
        .in('id', collabIds)
        .order('updated_at', { ascending: false });
      if (status) collabQ = collabQ.eq('status', status);
      const { data: ct } = await collabQ;
      collabTrips = ct || [];
    }

    // Merge and de-duplicate
    const seen = new Set();
    const trips = [...(ownedTrips || []), ...collabTrips].filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });

    res.json({ success: true, trips });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips – create trip
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { data: trip, error } = await supabase
        .from('trips')
        .insert({ ...req.body, user_id: req.user.id })
        .select()
        .single();

      if (error) return res.status(400).json({ success: false, message: error.message });

      res.status(201).json({ success: true, trip });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/trips/shared/:shareToken – public shared trip (no auth required)
router.get('/shared/:shareToken', async (req, res, next) => {
  try {
    const { data: trip, error } = await supabase
      .from('trips')
      .select('*, trip_itineraries(*)')
      .eq('share_token', req.params.shareToken)
      .in('visibility', ['shared', 'public'])
      .single();

    if (error || !trip) {
      return res.status(404).json({ success: false, message: 'Shared trip not found' });
    }
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { data: trip, error } = await supabase
      .from('trips')
      .select('*, trip_itineraries(*), trip_collaborators(*, profiles(id, full_name, avatar_url))')
      .eq('id', req.params.id)
      .single();

    if (error || !trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Check access
    const isOwner = trip.user_id === req.user.id;
    const isCollab = trip.trip_collaborators?.some(
      (c) => c.user_id === req.user.id && c.status === 'accepted',
    );
    const isPublic = trip.visibility === 'public';

    if (!isOwner && !isCollab && !isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trips/:id
router.put('/:id', async (req, res, next) => {
  try {
    // Verify ownership or editor role
    const { data: existing } = await supabase
      .from('trips')
      .select('id, user_id')
      .eq('id', req.params.id)
      .single();

    if (!existing) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (existing.user_id !== req.user.id) {
      const { data: collab } = await supabase
        .from('trip_collaborators')
        .select('role')
        .eq('trip_id', req.params.id)
        .eq('user_id', req.user.id)
        .eq('status', 'accepted')
        .single();

      if (!collab || collab.role !== 'editor') {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const { data: trip, error } = await supabase
      .from('trips')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    req.io?.to(`trip:${trip.id}`).emit('tripUpdated', trip);
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/trips/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) return res.status(404).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:id/itinerary – get all itinerary items
router.get('/:id/itinerary', async (req, res, next) => {
  try {
    const { data: items, error } = await supabase
      .from('trip_itineraries')
      .select('*')
      .eq('trip_id', req.params.id)
      .order('day_number', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips/:id/itinerary – add itinerary item
router.post('/:id/itinerary', async (req, res, next) => {
  try {
    const { data: item, error } = await supabase
      .from('trip_itineraries')
      .insert({ ...req.body, trip_id: req.params.id })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    req.io?.to(`trip:${req.params.id}`).emit('tripUpdated', { type: 'item_added', item });
    res.status(201).json({ success: true, item });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trips/:id/itinerary/:itemId – update itinerary item
router.put('/:id/itinerary/:itemId', async (req, res, next) => {
  try {
    const { data: item, error } = await supabase
      .from('trip_itineraries')
      .update(req.body)
      .eq('id', req.params.itemId)
      .eq('trip_id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    req.io?.to(`trip:${req.params.id}`).emit('tripUpdated', { type: 'item_updated', item });
    res.json({ success: true, item });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/trips/:id/itinerary/:itemId
router.delete('/:id/itinerary/:itemId', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('trip_itineraries')
      .delete()
      .eq('id', req.params.itemId)
      .eq('trip_id', req.params.id);

    if (error) return res.status(400).json({ success: false, message: error.message });

    req.io?.to(`trip:${req.params.id}`).emit('tripUpdated', { type: 'item_deleted', itemId: req.params.itemId });
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trips/:id/itinerary/reorder – bulk reorder
router.put('/:id/itinerary/reorder', async (req, res, next) => {
  try {
    const { items } = req.body; // [{ id, sort_order, day_number }]
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'items array required' });
    }

    const updates = items.map(({ id, sort_order, day_number }) =>
      supabase
        .from('trip_itineraries')
        .update({ sort_order, day_number })
        .eq('id', id)
        .eq('trip_id', req.params.id),
    );

    await Promise.all(updates);
    req.io?.to(`trip:${req.params.id}`).emit('tripUpdated', { type: 'reordered', items });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips/:id/share – make trip shareable
router.post('/:id/share', async (req, res, next) => {
  try {
    const { data: trip, error } = await supabase
      .from('trips')
      .update({ visibility: 'shared' })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id, share_token')
      .single();

    if (error || !trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    res.json({
      success: true,
      shareToken: trip.share_token,
      shareUrl: `atlastrip://trips/shared/${trip.share_token}`,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:id/collaborators
router.get('/:id/collaborators', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('trip_collaborators')
      .select('*, profiles(id, full_name, avatar_url, username)')
      .eq('trip_id', req.params.id);

    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, collaborators: data });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips/:id/collaborators – invite collaborator
router.post('/:id/collaborators', async (req, res, next) => {
  try {
    const { email, role = 'viewer' } = req.body;

    // Verify trip ownership
    const { data: trip } = await supabase
      .from('trips')
      .select('id')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (!trip) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Find user by email via profiles
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', email)
      .single();

    // If not found by username, try auth.users (admin only)
    let targetUserId = targetUser?.id;
    if (!targetUserId) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { data: collab, error } = await supabase
      .from('trip_collaborators')
      .insert({
        trip_id: req.params.id,
        user_id: targetUserId,
        role,
        invited_by: req.user.id,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    req.io?.to(`trip:${req.params.id}`).emit('collaboratorAdded', collab);
    res.status(201).json({ success: true, collaborator: collab });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trips/:id/collaborators/:userId – update role / accept invitation
router.put('/:id/collaborators/:userId', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.status === 'accepted') updates.accepted_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('trip_collaborators')
      .update(updates)
      .eq('trip_id', req.params.id)
      .eq('user_id', req.params.userId)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, collaborator: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:id/comments
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('trip_comments')
      .select('*, profiles(id, full_name, avatar_url)')
      .eq('trip_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, comments: data });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips/:id/comments
router.post('/:id/comments', async (req, res, next) => {
  try {
    const { data: comment, error } = await supabase
      .from('trip_comments')
      .insert({
        trip_id: req.params.id,
        user_id: req.user.id,
        content: req.body.content,
        item_id: req.body.item_id || null,
        parent_id: req.body.parent_id || null,
      })
      .select('*, profiles(id, full_name, avatar_url)')
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    req.io?.to(`trip:${req.params.id}`).emit('newComment', comment);
    res.status(201).json({ success: true, comment });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips/:id/votes
router.post('/:id/votes', async (req, res, next) => {
  try {
    const { item_id, vote } = req.body;

    const { data, error } = await supabase
      .from('activity_votes')
      .upsert({
        trip_id: req.params.id,
        item_id,
        user_id: req.user.id,
        vote,
      }, { onConflict: 'item_id,user_id' })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    req.io?.to(`trip:${req.params.id}`).emit('voteUpdated', data);
    res.json({ success: true, vote: data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

