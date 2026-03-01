// models/MoodLog.js
const mongoose = require('mongoose');

const moodLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: {
    emoji: String,
    label: String,
    value: Number,
    color: String,
  },
  phase: { type: String },            // menstrual cycle phase, optional
  note:  { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MoodLog', moodLogSchema);
