// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// helper to create token
const createToken = (user) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  // include id and username in payload
  return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn });
};

// POST /api/auth/register
// Minimal server-side handling: assumes client validated inputs
router.post('/register', async (req, res) => {
  try {
    const { username, gender, age, password } = req.body;

    // Create hashed password
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const user = new User({ username, gender, age, password: hashed });

    await user.save();

    const token = createToken(user);

    return res.status(201).json({
      message: 'User registered',
      user: { id: user._id, username: user.username, gender: user.gender, age: user.age },
      token
    });
  } catch (err) {
  console.error('Register error:', err);
  // Handle duplicate username more nicely
  if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
  return res.status(409).json({ error: 'username already exists' });
  }
  return res.status(500).json({ error: 'Server error' });
  }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = createToken(user);

    return res.json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, gender: user.gender, age: user.age },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' })
  }
});
module.exports = router;