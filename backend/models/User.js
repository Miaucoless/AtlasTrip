const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name must be at most 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    profileImage: { type: String, default: '' },
    bio: { type: String, maxlength: 200, default: '' },
    savedTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
    favoriteDestinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    travelStats: {
      countriesVisited: { type: Number, default: 0 },
      citiesVisited: { type: Number, default: 0 },
      totalMiles: { type: Number, default: 0 },
      tripsCompleted: { type: Number, default: 0 },
    },
    preferences: {
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' },
      notifications: { type: Boolean, default: true },
      travelStyle: {
        type: String,
        enum: ['budget', 'mid-range', 'luxury'],
        default: 'mid-range',
      },
    },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Sanitize output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
