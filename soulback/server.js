// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const User = require('./models/User');

// New routes
const testResultRoutes = require('./routes/testResults');
const moodRoutes       = require('./routes/mood');
const gardenRoutes     = require('./routes/garden');
const questionRoutes   = require('./routes/questions');
const chatbotRoutes    = require('./routes/chatbot');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// ── Middleware ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/test-results', testResultRoutes);
app.use('/api/mood',         moodRoutes);
app.use('/api/garden',       gardenRoutes);
app.use('/api/questions',    questionRoutes);
app.use('/api/chatbot',      chatbotRoutes);

// ── Protected: get current user ────────────────────────────────
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── Health check ───────────────────────────────────────────────
app.get('/', (req, res) => res.send('SoulSpace API running ✅'));

// ── Central error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
