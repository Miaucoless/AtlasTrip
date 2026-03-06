const express = require('express');
const { body, validationResult } = require('express-validator');
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All trip routes require authentication
router.use(protect);

// GET /api/trips – list user's trips
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const filter = {
      $or: [{ userId: req.user._id }, { collaborators: req.user._id }],
    };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

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
    body('destination').trim().notEmpty().withMessage('Destination is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const trip = await Trip.create({ ...req.body, userId: req.user._id });
      res.status(201).json({ success: true, trip });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/trips/shared/:shareCode – public shared trip
router.get('/shared/:shareCode', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ shareCode: req.params.shareCode, isShared: true });
    if (!trip) {
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
    const trip = await Trip.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { collaborators: req.user._id }],
    });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trips/:id
router.put('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    req.io?.to(`trip:${trip._id}`).emit('tripUpdated', trip);
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/trips/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    res.json({ success: true, message: 'Trip deleted' });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips/:id/activities
router.post('/:id/activities', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { collaborators: req.user._id }],
    });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    trip.activities.push(req.body);
    await trip.save();
    req.io?.to(`trip:${trip._id}`).emit('tripUpdated', trip);
    res.status(201).json({ success: true, trip });
  } catch (err) {
    next(err);
  }
});

// PUT /api/trips/:id/activities/:actId
router.put('/:id/activities/:actId', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { collaborators: req.user._id }],
    });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    const activity = trip.activities.id(req.params.actId);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });

    Object.assign(activity, req.body);
    await trip.save();
    req.io?.to(`trip:${trip._id}`).emit('tripUpdated', trip);
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/trips/:id/activities/:actId
router.delete('/:id/activities/:actId', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    trip.activities.pull({ _id: req.params.actId });
    await trip.save();
    res.json({ success: true, trip });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips/:id/share
router.post('/:id/share', async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (!trip.shareCode) {
      trip.generateShareCode();
      await trip.save();
    }

    res.json({ success: true, shareCode: trip.shareCode, shareUrl: `atlastrip://trips/shared/${trip.shareCode}` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
