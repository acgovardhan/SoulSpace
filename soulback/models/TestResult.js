// models/TestResult.js
const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testType: { type: String, enum: ['phq9', 'gad7', 'pss10', 'dat'], required: true },
  score: { type: Number },
  percentage: { type: Number },       // DAT only
  label: { type: String },            // e.g. "Mild anxiety"
  answers: { type: Object },          // raw answer map
}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);
