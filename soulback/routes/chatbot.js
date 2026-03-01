// routes/chatbot.js
// Rule-based fallback now. When you add your AI API key later,
// replace the section marked "── AI INTEGRATION ──" below.
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const FALLBACK_RESPONSES = {
  anxi:   "I hear you — anxiety can feel really overwhelming. Let's slow things down together. Can you take a slow, deep breath with me? You're safe here. 💙",
  worry:  "I hear you — anxiety can feel really overwhelming. Let's slow things down together. Can you take a slow, deep breath with me? You're safe here. 💙",
  panic:  "I hear you — anxiety can feel really overwhelming. Let's slow things down together. Can you take a slow, deep breath with me? You're safe here. 💙",
  sleep:  "Sleep struggles are so exhausting, both physically and emotionally. Have you tried a gentle wind-down routine before bed? I'm here to explore what might help.",
  insomn: "Sleep struggles are so exhausting, both physically and emotionally. Have you tried a gentle wind-down routine before bed? I'm here to explore what might help.",
  tired:  "Sleep struggles are so exhausting, both physically and emotionally. Have you tried a gentle wind-down routine before bed? I'm here to explore what might help.",
  stress: "It sounds like you're carrying a lot right now. Would it help to talk about what's weighing on you most? Sometimes just naming it makes it feel lighter.",
  overwh: "It sounds like you're carrying a lot right now. Would it help to talk about what's weighing on you most? Sometimes just naming it makes it feel lighter.",
  sad:    "I'm really glad you reached out. Feeling low is so difficult, and your feelings are completely valid. You don't have to face this alone — I'm here.",
  depress:"I'm really glad you reached out. Feeling low is so difficult, and your feelings are completely valid. You don't have to face this alone — I'm here.",
  low:    "I'm really glad you reached out. Feeling low is so difficult, and your feelings are completely valid. You don't have to face this alone — I'm here.",
  unmotiv:"I'm really glad you reached out. Feeling low is so difficult, and your feelings are completely valid. You don't have to face this alone — I'm here.",
};

const CRISIS_KEYWORDS = ['hurt myself', 'end it', 'suicid', 'kill myself', 'want to die', 'no reason to live'];

const GENERIC_RESPONSES = [
  "Thank you for sharing that with me. I'm here, listening. Can you tell me a little more about what you're feeling?",
  "I really appreciate you opening up. Your feelings matter. What's been on your mind most lately?",
  "That sounds like it's been weighing on you. I'm here for you. Would you like to explore what might help?",
  "I'm glad you reached out. You don't have to carry this alone. What would feel most helpful right now?",
];

// POST /api/chatbot
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const lower = message.toLowerCase();

    // Crisis check first
    if (CRISIS_KEYWORDS.some(k => lower.includes(k))) {
      return res.json({
        reply: "I'm really concerned about you right now and I care deeply about your safety. Please reach out to a crisis helpline immediately — you can use the Emergency Support button in this app. You matter deeply. 💙"
      });
    }

    // ── AI INTEGRATION ──────────────────────────────────────────
    // When you're ready to add an AI model, replace this block:
    //
    // const { GoogleGenerativeAI } = require('@google/generative-ai');
    // const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    //
    // const systemPrompt = `You are a compassionate mental health support companion...`;
    // const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
    // const reply = result.response.text();
    // return res.json({ reply });
    //
    // ── END AI INTEGRATION ──────────────────────────────────────

    // Rule-based fallback
    let reply = null;
    for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
      if (lower.includes(keyword)) { reply = response; break; }
    }
    if (!reply) {
      reply = GENERIC_RESPONSES[Math.floor(Math.random() * GENERIC_RESPONSES.length)];
    }

    return res.json({ reply });
  } catch (err) {
    console.error('Chatbot error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
