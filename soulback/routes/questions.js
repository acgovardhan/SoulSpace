// routes/questions.js
// Questions are already seeded in your MongoDB.
// Your DB structure: { _id, category, question, options:[{label,value}], isReverse }
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Use your existing collection — define a minimal model
// (If you already have a Question model, import that instead)
const questionSchema = new mongoose.Schema({
  category:  String,            // "gad7" | "phq9" | "pss10" | "dat"
  question:  String,
  options:   [{ label: String, value: Number }],
  isReverse: { type: Boolean, default: false },
  section:   String,            // for DAT: "Verbal Reasoning" etc.
  answer:    String,            // for DAT: correct answer letter
}, { collection: 'questions' }); // use YOUR existing collection name

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

// GET /api/questions/:category
// e.g. GET /api/questions/gad7
router.get('/:category', async (req, res) => {
  try {
    const questions = await Question.find({ category: req.params.category })
      .select('-__v')
      .lean();
    return res.json(questions);
  } catch (err) {
    console.error('Fetch questions error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
