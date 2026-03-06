const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  time: { type: String, default: '' },
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['hotel', 'flight', 'food', 'sightseeing', 'culture', 'shopping', 'adventure', 'transport', 'other'],
    default: 'other',
  },
  location: { type: String, default: '' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  notes: { type: String, default: '' },
  bookingRef: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const flightSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date },
  airline: { type: String, default: '' },
  flightNumber: { type: String, default: '' },
  price: { type: Number, default: 0 },
  bookingRef: { type: String, default: '' },
  class: { type: String, enum: ['economy', 'business', 'first'], default: 'economy' },
});

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  price: { type: Number, default: 0 },
  address: { type: String, default: '' },
  bookingRef: { type: String, default: '' },
  roomType: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5 },
});

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: 100,
    },
    destination: { type: String, required: true, trim: true },
    coverImage: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    activities: [activitySchema],
    flights: [flightSchema],
    hotels: [hotelSchema],
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'cancelled'],
      default: 'planning',
    },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isShared: { type: Boolean, default: false },
    shareCode: { type: String, unique: true, sparse: true },
    budget: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    notes: { type: String, default: '' },
    tags: [{ type: String }],
    weatherCache: { type: mongoose.Schema.Types.Mixed },
    aiOptimized: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-generate share code
tripSchema.methods.generateShareCode = function () {
  this.shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  this.isShared = true;
};

module.exports = mongoose.model('Trip', tripSchema);
