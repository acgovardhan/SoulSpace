// routes/garden.js
const express = require('express');
const router = express.Router();
const Garden = require('../models/Garden');
const authMiddleware = require('../middleware/auth');

const getToday = () => new Date().toISOString().split('T')[0];

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

// ── GET /api/garden/:userId ───────────────────────────────────
// Fetches garden and runs all daily login logic:
//   - streak increment / reset
//   - pet missed-day check
//   - completedToday reset for new day
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const today = getToday();
    const yesterday = getYesterday();

    // Find or create garden document
    let garden = await Garden.findOne({ userId: req.params.userId });
    if (!garden) {
      garden = new Garden({
        userId: req.params.userId,
        lastLoginDate: today,
        lastActivityDate: today,
        completedToday: ['login'],
        streakPoints: 1,
        currentStreak: 1,
        totalDays: 1,
      });
      await garden.save();
      return res.json(garden);
    }

    let changed = false;

    // ── Daily login logic ──────────────────────────────────────
    if (garden.lastLoginDate !== today) {
      if (garden.lastLoginDate === yesterday) {
        garden.currentStreak = (garden.currentStreak || 0) + 1;
      } else {
        garden.currentStreak = 1; // streak broken, reset
      }
      garden.totalDays = (garden.totalDays || 0) + 1;
      garden.lastLoginDate = today;
      garden.streakPoints = (garden.streakPoints || 0) + 1; // +1 for login
      changed = true;
    }

    // ── Reset completedToday for new day ───────────────────────
    if (garden.lastActivityDate !== today) {
      garden.completedToday = ['login'];
      garden.lastActivityDate = today;
      changed = true;
    }

    // ── Pet missed-day logic ───────────────────────────────────
    if (garden.pet && garden.pet.id) {
      const lastFed = garden.pet.lastFedDate;
      const fedToday = lastFed === today;

      // Reset fedToday flag for new day
      if (garden.pet.fedToday && !fedToday) {
        garden.pet.fedToday = false;
        changed = true;
      }

      // Check if a day was missed (last fed was neither today nor yesterday)
      if (lastFed && lastFed !== today && lastFed !== yesterday) {
        garden.pet.missedDays = (garden.pet.missedDays || 0) + 1;
        changed = true;
        if (garden.pet.missedDays >= 2) {
          garden.pet = null; // pet leaves after 2 missed days
        }
      }
    }

    if (changed) await garden.save();

    return res.json(garden);
  } catch (err) {
    console.error('Get garden error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /api/garden/:userId ───────────────────────────────────
// Generic update — frontend sends full garden patch
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    if (String(req.params.userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const allowed = ['streakPoints', 'completedToday', 'lastActivityDate', 'pet', 'journalEntries'];
    const update = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    });

    const garden = await Garden.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: update },
      { new: true, upsert: true }
    );
    return res.json(garden);
  } catch (err) {
    console.error('Update garden error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/garden/journal ──────────────────────────────────
// Add a single journal entry (prepends to array)
router.post('/journal', authMiddleware, async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (String(userId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!text || text.trim().length < 3) {
      return res.status(400).json({ error: 'Journal entry too short' });
    }

    const entry = { text: text.trim(), date: new Date() };

    const garden = await Garden.findOneAndUpdate(
      { userId },
      { $push: { journalEntries: { $each: [entry], $position: 0 } } },
      { new: true, upsert: true }
    );

    return res.status(201).json({ entry, garden });
  } catch (err) {
    console.error('Journal save error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
