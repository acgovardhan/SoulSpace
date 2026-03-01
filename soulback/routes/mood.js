// routes/mood.js
const express = require('express');
const router = express.Router();
const MoodLog = require('../models/MoodLog');
const authMiddleware = require('../middleware/auth');

// GET /api/mood/:userId  — fetch mood history
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const logs = await MoodLog.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    return res.json(logs);
  } catch (err) {
    console.error('Fetch mood error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/mood  — log a mood entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, mood, phase, note } = req.body;

    if (String(userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const entry = await MoodLog.create({ userId, mood, phase, note });
    return res.status(201).json(entry);
  } catch (err) {
    console.error('Save mood error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
