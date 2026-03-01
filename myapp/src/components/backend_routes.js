// ─── backend/routes/testResults.js ───────────────────────────────────────────
const express = require("express");
const router = express.Router();
const TestResult = require("../models/TestResult");

// Save a test result
router.post("/", async (req, res) => {
  try {
    const result = await TestResult.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get results for a user
router.get("/:userId", async (req, res) => {
  try {
    const results = await TestResult.find({ userId: req.params.userId }).sort({
      date: -1,
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

// ─── backend/models/TestResult.js ────────────────────────────────────────────
const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  testType: {
    type: String,
    enum: ["phq9", "gad7", "pss10", "dat"],
    required: true,
  },
  score: Number,
  percentage: Number,     // for DAT
  label: String,          // e.g. "Mild anxiety"
  answers: Object,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TestResult", testResultSchema);

// ─── backend/routes/mood.js ───────────────────────────────────────────────────
const express2 = require("express");
const router2 = express2.Router();
const Mood = require("../models/Mood");

// Get mood history
router2.get("/", async (req, res) => {
  try {
    const entries = await Mood.find({ userId: req.query.userId }).sort({
      date: 1,
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Log mood
router2.post("/", async (req, res) => {
  try {
    const entry = await Mood.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router2;

// ─── backend/models/Mood.js ───────────────────────────────────────────────────
const mongoose2 = require("mongoose");

const moodSchema = new mongoose2.Schema({
  userId: String,
  mood: {
    emoji: String,
    label: String,
    value: Number,
    color: String,
  },
  phase: String,   // menstrual cycle phase (optional)
  note: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose2.model("Mood", moodSchema);

// ─── backend/routes/chatbot.js ────────────────────────────────────────────────
// Uses OpenAI / your preferred LLM API
const express3 = require("express");
const router3 = express3.Router();
// const OpenAI = require("openai");  // npm install openai
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router3.post("/", async (req, res) => {
  const { message, history = [] } = req.body;

  const SYSTEM_PROMPT = `You are a compassionate, empathetic mental health support companion for the SoulSpace app.
Your core principles:
- Non-judgemental: Accept all feelings without criticism
- Empathetic: Reflect feelings back with warmth and genuine care
- UCPR (Unconditional Positive Regard): Value the person unconditionally
- Gentle and Warm: Use soft, kind language
- You are NOT a therapist. You provide emotional support and coping tools only.
- If someone expresses crisis or suicidal thoughts, gently refer them to emergency services.
- Keep responses concise (2-4 sentences), warm, and focused on the person.`;

  try {
    /* ── OpenAI Example ────────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });
    const reply = completion.choices[0].message.content;
    ─────────────────────────────────────────────────────────────────── */

    // ── Fallback rule-based response (replace with LLM) ──────────────
    const lowerMsg = message.toLowerCase();
    let reply;

    if (lowerMsg.includes("anxi") || lowerMsg.includes("worry") || lowerMsg.includes("panic")) {
      reply = "I hear you — anxiety can feel really overwhelming. Let's try to slow things down together. Can you take a slow, deep breath with me? You're safe here. 💙";
    } else if (lowerMsg.includes("sleep") || lowerMsg.includes("insomnia") || lowerMsg.includes("tired")) {
      reply = "Sleep struggles are so exhausting, both physically and emotionally. I'm sorry you're going through this. Have you tried winding down with a gentle routine before bed? I'm here to explore what might help you.";
    } else if (lowerMsg.includes("stress") || lowerMsg.includes("overwhelm") || lowerMsg.includes("pressure")) {
      reply = "It sounds like you're carrying a lot right now. That's really hard. Would it help to talk about what's weighing on you most? Sometimes just naming it can make it feel a little lighter.";
    } else if (lowerMsg.includes("sad") || lowerMsg.includes("depress") || lowerMsg.includes("low") || lowerMsg.includes("unmotivat")) {
      reply = "I'm really glad you reached out. Feeling low is so difficult, and your feelings are completely valid. You don't have to face this alone — I'm here. Would you like to share what's been going on?";
    } else if (lowerMsg.includes("crisis") || lowerMsg.includes("hurt myself") || lowerMsg.includes("end it") || lowerMsg.includes("suicid")) {
      reply = "I'm really concerned about you right now and I care about your safety. Please reach out to a crisis helpline immediately — you can use the Emergency Support button in this app. You matter deeply. 💙";
    } else {
      const responses = [
        "Thank you for sharing that with me. I'm here, listening. Can you tell me a little more about what you're feeling?",
        "I really appreciate you opening up. Your feelings matter. What's been on your mind most lately?",
        "That sounds like it's been weighing on you. I'm here for you. Would you like to explore what might help?",
        "I'm glad you reached out. You don't have to carry this alone. What would feel most helpful right now?",
      ];
      reply = responses[Math.floor(Math.random() * responses.length)];
    }

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: "Chatbot error" });
  }
});

module.exports = router3;

// ─── backend/routes/aptitudeQuestions.js ─────────────────────────────────────
const express4 = require("express");
const router4 = express4.Router();
const AptitudeQuestion = require("../models/AptitudeQuestion");

router4.get("/", async (req, res) => {
  try {
    const questions = await AptitudeQuestion.find({}).sort({ section: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router4;

// ─── backend/models/AptitudeQuestion.js ──────────────────────────────────────
// Schema matches what you'd store in MongoDB
const mongoose3 = require("mongoose");

const aptitudeSchema = new mongoose3.Schema({
  section: String,       // "Verbal Reasoning", "Numerical Reasoning", etc.
  question: String,
  options: [String],     // ["A. Option", "B. Option", ...]
  answer: String,        // "A", "B", "C", or "D"
});

module.exports = mongoose3.model("AptitudeQuestion", aptitudeSchema);

// ─── backend/server.js additions ─────────────────────────────────────────────
// Add these to your existing Express server:
/*
const testResultRoutes = require("./routes/testResults");
const moodRoutes = require("./routes/mood");
const chatbotRoutes = require("./routes/chatbot");
const aptitudeRoutes = require("./routes/aptitudeQuestions");

app.use("/api/test-results", testResultRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/aptitude-questions", aptitudeRoutes);
*/
