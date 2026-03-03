// routes/reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const authMiddleware = require('../middleware/auth');

// ── Anonymous name generator ──────────────────────────────────
// Combines an adjective + animal to create a unique friendly name
// e.g. "Calm Sparrow", "Gentle River", "Brave Lotus"
const ADJECTIVES = [
  'Calm', 'Gentle', 'Brave', 'Quiet', 'Warm', 'Soft', 'Kind',
  'Bright', 'Clear', 'Deep', 'Free', 'Fresh', 'Still', 'Swift',
  'Tender', 'Wise', 'Bold', 'Serene', 'Peaceful', 'Hopeful',
];
const NOUNS = [
  'Sparrow', 'River', 'Lotus', 'Willow', 'Panda', 'Breeze', 'Cloud',
  'Fern', 'Harbor', 'Iris', 'Juniper', 'Maple', 'Moon', 'Ocean',
  'Pine', 'Robin', 'Stone', 'Stream', 'Tide', 'Violet',
];

const generateAnonName = () => {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
};

// ── GET /api/reviews ──────────────────────────────────────────
// Public — anyone can read reviews (no auth required)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .select('-userId')           // never expose userId to frontend
      .sort({ createdAt: -1 })
      .lean();
    return res.json(reviews);
  } catch (err) {
    console.error('Fetch reviews error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/reviews/mine ─────────────────────────────────────
// Get the logged-in user's own review (to pre-fill edit form)
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findOne({ userId: req.user.id }).lean();
    return res.json(review || null);
  } catch (err) {
    console.error('Fetch own review error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/reviews ─────────────────────────────────────────
// Create a review — one per user enforced by unique index
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { rating, text } = req.body;

    if (!rating || !text) {
      return res.status(400).json({ error: 'Rating and review text are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }
    if (text.trim().length < 10) {
      return res.status(400).json({ error: 'Review must be at least 10 characters.' });
    }

    // Check if user already has a review
    const existing = await Review.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(409).json({ error: 'You have already submitted a review. Use PUT to edit it.' });
    }

    const review = await Review.create({
      userId:   req.user.id,
      rating,
      text:     text.trim(),
      anonName: generateAnonName(),
    });

    // Return review without userId
    const { userId: _, ...safe } = review.toObject();
    return res.status(201).json(safe);
  } catch (err) {
    console.error('Create review error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You have already submitted a review.' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /api/reviews ──────────────────────────────────────────
// Edit own review — anonName stays the same
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { rating, text } = req.body;

    if (!rating || !text) {
      return res.status(400).json({ error: 'Rating and review text are required.' });
    }

    const review = await Review.findOneAndUpdate(
      { userId: req.user.id },
      { rating, text: text.trim() },
      { new: true }
    ).select('-userId');

    if (!review) {
      return res.status(404).json({ error: 'No review found to update. Submit one first.' });
    }

    return res.json(review);
  } catch (err) {
    console.error('Update review error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /api/reviews ───────────────────────────────────────
// Delete own review
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Review.findOneAndDelete({ userId: req.user.id });
    return res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error('Delete review error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/reviews/stats ────────────────────────────────────
// Aggregate stats: average rating, total count, distribution
router.get('/stats', async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating:    { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          dist: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (!stats.length) {
      return res.json({ avgRating: 0, totalReviews: 0, distribution: { 1:0,2:0,3:0,4:0,5:0 } });
    }

    const distribution = { 1:0, 2:0, 3:0, 4:0, 5:0 };
    stats[0].dist.forEach(r => { distribution[r] = (distribution[r] || 0) + 1; });

    return res.json({
      avgRating:    Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      distribution,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
