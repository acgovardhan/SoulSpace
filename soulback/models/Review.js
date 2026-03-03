// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  // unique: true enforces one review per user at the DB level
  rating:   { type: Number, required: true, min: 1, max: 5 },
  text:     { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
  // Fun anonymous display name generated once e.g. "Calm Sparrow", "Gentle River"
  anonName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
