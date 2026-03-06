const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    continent: { type: String, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['beaches', 'mountains', 'cities', 'culture', 'adventure', 'islands', 'rural'],
      default: 'cities',
    },
    tags: [{ type: String }],
    images: [{ type: String }],
    coverImage: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    highlights: [{ type: String }],
    bestTimeToVisit: { type: String, default: '' },
    weather: {
      avgTemp: { type: Number },
      humidity: { type: Number },
      description: { type: String },
    },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'English' },
    avgCostPerDay: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
    isHiddenGem: { type: Boolean, default: false },
    popularityScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

destinationSchema.index({ name: 'text', country: 'text', tags: 'text' });
destinationSchema.index({ isTrending: 1 });
destinationSchema.index({ isHiddenGem: 1 });

module.exports = mongoose.model('Destination', destinationSchema);
