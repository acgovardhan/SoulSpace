// routes/testResults.js
const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const authMiddleware = require('../middleware/auth');

// POST /api/test-results  — save a result
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, testType, score, percentage, label, answers } = req.body;

    // Extra safety: only allow saving own results
    if (String(userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await TestResult.create({ userId, testType, score, percentage, label, answers });
    return res.status(201).json(result);
  } catch (err) {
    console.error('Save test result error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/test-results/:userId  — get all results for a user
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const results = await TestResult.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    return res.json(results);
  } catch (err) {
    console.error('Fetch test results error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
