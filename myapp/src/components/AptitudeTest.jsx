import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

const FALLBACK_QUESTIONS = [
  { _id: "1", section: "Verbal Reasoning", question: "Choose the word that is most opposite in meaning to: TENACIOUS", options: ["A. Stubborn", "B. Yielding", "C. Brave", "D. Careless"], answer: "B" },
  { _id: "2", section: "Verbal Reasoning", question: "Complete the analogy: Book is to Library as Painting is to _____", options: ["A. Canvas", "B. Artist", "C. Gallery", "D. Brush"], answer: "C" },
  { _id: "3", section: "Numerical Reasoning", question: "If a train travels 240 km in 3 hours, how far will it travel in 5 hours?", options: ["A. 360 km", "B. 400 km", "C. 420 km", "D. 480 km"], answer: "B" },
  { _id: "4", section: "Numerical Reasoning", question: "What is the next number in the series: 2, 6, 12, 20, 30, ___?", options: ["A. 38", "B. 40", "C. 42", "D. 44"], answer: "C" },
  { _id: "5", section: "Abstract Reasoning", question: "In a pattern where shapes double each step: Circle → 2 Circles → 4 Circles, how many will be in step 5?", options: ["A. 8", "B. 16", "C. 32", "D. 64"], answer: "B" },
  { _id: "6", section: "Abstract Reasoning", question: "Which comes next if the rule is: +2, ×2, +2, ×2 starting from 1?", options: ["A. 6", "B. 10", "C. 12", "D. 8"], answer: "A" },
  { _id: "7", section: "Spatial Reasoning", question: "A cube has 6 faces. If you paint 3 adjacent faces red, how many remain unpainted?", options: ["A. 1", "B. 2", "C. 3", "D. 4"], answer: "C" },
  { _id: "8", section: "Mechanical Reasoning", question: "If Gear A (10 teeth) drives Gear B (20 teeth), and Gear A turns at 60 rpm, what is Gear B's speed?", options: ["A. 120 rpm", "B. 60 rpm", "C. 30 rpm", "D. 15 rpm"], answer: "C" },
  { _id: "9", section: "Language Usage", question: "Choose the grammatically correct sentence:", options: ["A. She don't know the answer.", "B. She doesn't knows the answer.", "C. She doesn't know the answer.", "D. She not know the answer."], answer: "C" },
  { _id: "10", section: "Language Usage", question: "Identify the error: 'The team are playing good today.'", options: ["A. 'team' should be 'teams'", "B. 'are' should be 'is'", "C. 'good' should be 'well'", "D. Both B and C"], answer: "D" },
];

const TIME_LIMIT = 15 * 60;

const AptitudeTest = ({ onBack, user }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [timerActive, setTimerActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fixed: correct route is /api/questions/dat, uses api helper for BASE_URL
        const res = await api.get("/api/questions/dat");
        if (res.ok) {
          const data = await res.json();
          setQuestions(data.length ? data : FALLBACK_QUESTIONS);
        } else {
          setQuestions(FALLBACK_QUESTIONS);
        }
      } catch {
        setQuestions(FALLBACK_QUESTIONS);
      }
      setLoading(false);
      setTimerActive(true);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!timerActive || submitted) return;
    if (timeLeft <= 0) { handleSubmit(true); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, submitted]);

  const handleAnswer = (qId, opt) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const handleSubmit = (auto = false) => {
    setTimerActive(false);
    setSubmitted(true);
  };

  const handleSave = async (score, pct) => {
    setSaving(true);
    try {
      // Fixed: uses api helper (adds BASE_URL + auth token), user.id not user._id
      const res = await api.post("/api/test-results", {
        userId: user?.id,
        testType: "dat",
        score,
        percentage: pct,
        answers,
      });
      if (res.ok) setSaved(true);
    } catch {}
    setSaving(false);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (loading) {
    return <div className="test-page"><div className="loading-spinner">Loading questions…</div></div>;
  }

  if (submitted) {
    const correct = questions.filter((q) => answers[q._id] === q.answer).length;
    const pct = Math.round((correct / questions.length) * 100);
    const grade =
      pct >= 80 ? { label: "Excellent", color: "#4caf80" } :
      pct >= 60 ? { label: "Good", color: "#ffc107" } :
      pct >= 40 ? { label: "Average", color: "#ff9800" } :
                  { label: "Needs Improvement", color: "#f44336" };

    const sections = [...new Set(questions.map((q) => q.section))];

    return (
      <div className="test-result-page">
        <button className="btn-muted back-btn" onClick={onBack}>← Back to Tests</button>
        <div className="result-card">
          <div className="result-score-ring" style={{ borderColor: grade.color }}>
            <span className="result-score-num" style={{ color: grade.color }}>{pct}%</span>
          </div>
          <h2 style={{ color: grade.color }}>{grade.label}</h2>
          <p className="result-advice">You got {correct} out of {questions.length} questions correct.</p>

          <div className="result-breakdown">
            <h4>Section Breakdown</h4>
            {sections.map((sec) => {
              const secQs = questions.filter((q) => q.section === sec);
              const secCorrect = secQs.filter((q) => answers[q._id] === q.answer).length;
              return (
                <div key={sec} className="result-bar-row">
                  <span className="result-bar-label">{sec}</span>
                  <div className="result-bar-track">
                    <div className="result-bar-fill" style={{ width: `${(secCorrect / secQs.length) * 100}%`, background: grade.color }} />
                  </div>
                  <span className="result-bar-max">{secCorrect}/{secQs.length}</span>
                </div>
              );
            })}
          </div>

          <div className="apt-review">
            <h4>Answer Review</h4>
            {questions.map((q, i) => {
              const isCorrect = answers[q._id] === q.answer;
              return (
                <div key={q._id} className={`apt-review-item ${isCorrect ? "correct" : "wrong"}`}>
                  <p className="apt-review-q">{i + 1}. {q.question}</p>
                  <p>
                    Your answer: <strong>{answers[q._id] || "Not answered"}</strong>
                    {!isCorrect && <span className="apt-correct-ans"> | Correct: <strong>{q.answer}</strong></span>}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="result-actions">
            {!saved ? (
              <button className="btn-primary" onClick={() => handleSave(correct, pct)} disabled={saving}>
                {saving ? "Saving…" : "💾 Save Result"}
              </button>
            ) : <span className="result-saved">✅ Saved!</span>}
            <button className="btn-muted" onClick={onBack}>Back to Tests</button>
          </div>
        </div>
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / questions.length) * 100);
  const sections = [...new Set(questions.map((q) => q.section))];

  return (
    <div className="test-page">
      <div className="apt-top-bar">
        <button className="btn-muted back-btn" onClick={onBack}>← Back</button>
        <div className="apt-timer" style={{ color: timeLeft < 120 ? "#f44336" : "#6b4f4f" }}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="test-page-header">
        <h2>DAT – Differential Aptitude Test</h2>
        <p>Answer all questions. You have 15 minutes.</p>
        <div className="test-progress-bar">
          <div className="test-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="test-progress-label">{answered} / {questions.length} answered</span>
      </div>

      {sections.map((sec) => (
        <div key={sec} className="apt-section">
          <h3 className="apt-section-title">{sec}</h3>
          {questions.filter((q) => q.section === sec).map((q) => {
            const globalIdx = questions.findIndex((gq) => gq._id === q._id);
            return (
              <div key={q._id} className="test-question-card">
                <p className="test-q-text">
                  <span className="test-q-num">{globalIdx + 1}.</span> {q.question}
                </p>
                <div className="test-options">
                  {q.options.map((opt) => {
                    const letter = opt.split(".")[0].trim();
                    return (
                      <label key={opt} className={`test-option ${answers[q._id] === letter ? "selected" : ""}`}>
                        <input type="radio" name={`q_${q._id}`} value={letter}
                          checked={answers[q._id] === letter}
                          onChange={() => handleAnswer(q._id, letter)} />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="test-submit-row">
        <button className="btn-primary" onClick={() => handleSubmit(false)}>Submit Test →</button>
        {answered < questions.length && (
          <span className="test-incomplete-hint">
            {questions.length - answered} questions unanswered – you can still submit
          </span>
        )}
      </div>
    </div>
  );
};

export default AptitudeTest;
