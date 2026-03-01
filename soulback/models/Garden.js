// models/Garden.js
const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const petSchema = new mongoose.Schema({
  id:          { type: String },      // "fish" | "chick" | "lizard" | "bunny" | "cat"
  fedToday:    { type: Boolean, default: false },
  missedDays:  { type: Number, default: 0 },
  age:         { type: Number, default: 0 },
  stage:       { type: Number, default: 0 },
  lastFedDate: { type: String },      // "YYYY-MM-DD"
}, { _id: false });

const gardenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Streak
  streakPoints:    { type: Number, default: 0 },
  currentStreak:   { type: Number, default: 0 },
  totalDays:       { type: Number, default: 0 },
  lastLoginDate:   { type: String },      // "YYYY-MM-DD"

  // Daily activity tracking
  completedToday:  { type: [String], default: [] },
  lastActivityDate:{ type: String },      // "YYYY-MM-DD"

  // Pet
  pet: { type: petSchema, default: null },

  // Journal
  journalEntries: { type: [journalEntrySchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Garden', gardenSchema);
