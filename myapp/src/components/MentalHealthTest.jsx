import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

const fallbackTests = {
  phq9: {
    title: "PHQ-9 – Depression Screening",
    instruction: "Over the last 2 weeks, how often have you been bothered by the following problems?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    optionValues: [0, 1, 2, 3],
    questions: [
      { text: "Little interest or pleasure in doing things", isReverse: false },
      { text: "Feeling down, depressed, or hopeless", isReverse: false },
      { text: "Trouble falling or staying asleep, or sleeping too much", isReverse: false },
      { text: "Feeling tired or having little energy", isReverse: false },
      { text: "Poor appetite or overeating", isReverse: false },
      { text: "Feeling bad about yourself – or that you are a failure", isReverse: false },
      { text: "Trouble concentrating on things", isReverse: false },
      { text: "Moving or speaking so slowly that other people could have noticed", isReverse: false },
      { text: "Thoughts that you would be better off dead or of hurting yourself", isReverse: false },
    ],
    scoring: [
      { max: 4, label: "Minimal depression", color: "#4caf80", advice: "You're doing well! Keep maintaining healthy habits." },
      { max: 9, label: "Mild depression", color: "#ffc107", advice: "Consider self-care strategies and monitoring your mood." },
      { max: 14, label: "Moderate depression", color: "#ff9800", advice: "Talking to a counsellor or therapist could be very helpful." },
      { max: 19, label: "Moderately severe depression", color: "#f44336", advice: "We strongly recommend speaking with a mental health professional." },
      { max: 27, label: "Severe depression", color: "#b71c1c", advice: "Please reach out to a mental health professional as soon as possible." },
    ],
  },
  gad7: {
    title: "GAD-7 – Anxiety Screening",
    instruction: "Over the last 2 weeks, how often have you been bothered by the following problems?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    optionValues: [0, 1, 2, 3],
    questions: [
      { text: "Feeling nervous, anxious, or on edge", isReverse: false },
      { text: "Not being able to stop or control worrying", isReverse: false },
      { text: "Worrying too much about different things", isReverse: false },
      { text: "Trouble relaxing", isReverse: false },
      { text: "Being so restless that it is hard to sit still", isReverse: false },
      { text: "Becoming easily annoyed or irritable", isReverse: false },
      { text: "Feeling afraid as if something awful might happen", isReverse: false },
    ],
    scoring: [
      { max: 4, label: "Minimal anxiety", color: "#4caf80", advice: "Great! Continue with your current self-care routine." },
      { max: 9, label: "Mild anxiety", color: "#ffc107", advice: "Try relaxation techniques like deep breathing or meditation." },
      { max: 14, label: "Moderate anxiety", color: "#ff9800", advice: "Consider speaking with a counsellor." },
      { max: 21, label: "Severe anxiety", color: "#f44336", advice: "Please consult a mental health professional soon." },
    ],
  },
  pss10: {
    title: "PSS-10 – Perceived Stress Scale",
    instruction: "In the last month, how often have you felt or thought the following?",
    options: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    optionValues: [0, 1, 2, 3, 4],
    questions: [
      { text: "Been upset because of something that happened unexpectedly?", isReverse: false },
      { text: "Felt that you were unable to control the important things in your life?", isReverse: false },
      { text: "Felt nervous and stressed?", isReverse: false },
      { text: "Felt confident about your ability to handle your personal problems?", isReverse: true },
      { text: "Felt that things were going your way?", isReverse: true },
      { text: "Found that you could not cope with all the things that you had to do?", isReverse: false },
      { text: "Been able to control irritations in your life?", isReverse: true },
      { text: "Felt that you were on top of things?", isReverse: true },
      { text: "Been angered because of things that were outside of your control?", isReverse: false },
      { text: "Felt difficulties were piling up so high that you could not overcome them?", isReverse: false },
    ],
    scoring: [
      { max: 13, label: "Low perceived stress", color: "#4caf80", advice: "You're managing stress well. Keep it up!" },
      { max: 26, label: "Moderate perceived stress", color: "#ffc107", advice: "Try stress-reduction techniques and regular self-care." },
      { max: 40, label: "High perceived stress", color: "#f44336", advice: "Consider speaking with a counsellor or therapist." },
    ],
  },
};

const MentalHealthTest = ({ testId, onBack, user }) => {
  const [testData, setTestData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const fb = fallbackTests[testId];
      try {
        const res = await api.get(`/api/questions/${testId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            // DB questions: { question, options:[{label,value}], isReverse }
            setTestData(fb);
            setQuestions(
              data.map((q) => ({
                text: q.question,
                isReverse: q.isReverse || false,
              }))
            );
            setLoading(false);
            return;
          }
        }
      } catch {}
      setTestData(fb);
      setQuestions(fb.questions);
      setLoading(false);
    };
    load();
  }, [testId]);

  if (loading) return <div className="test-page"><div className="loading-spinner">Loading…</div></div>;

  const test = testData;
  const totalQuestions = questions.length;
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / totalQuestions) * 100);

  const handleAnswer = (qIdx, val) => setAnswers((p) => ({ ...p, [qIdx]: val }));

  const handleSubmit = () => {
    if (answered < totalQuestions) return;
    let total = 0;
    const maxVal = test.optionValues[test.optionValues.length - 1];
    questions.forEach((q, i) => {
      const raw = answers[i];
      total += q.isReverse ? maxVal - raw : raw;
    });
    setScore(total);
    const found = test.scoring.find((s) => total <= s.max);
    setResult(found || test.scoring[test.scoring.length - 1]);
    setSubmitted(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post("/api/test-results", {
        userId: user?.id,
        testType: testId,
        score,
        label: result?.label,
        answers,
      });
      if (res.ok) setSaved(true);
    } catch {}
    setSaving(false);
  };

  if (submitted && result) {
    return (
      <div className="test-result-page">
        <button className="btn-muted back-btn" onClick={onBack}>← Back to Tests</button>
        <div className="result-card">
          <div className="result-score-ring" style={{ borderColor: result.color }}>
            <span className="result-score-num" style={{ color: result.color }}>{score}</span>
          </div>
          <h2 style={{ color: result.color }}>{result.label}</h2>
          <p className="result-advice">{result.advice}</p>
          <div className="result-breakdown">
            <h4>Score Breakdown</h4>
            {test.scoring.map((s, i) => (
              <div key={i} className="result-bar-row">
                <span className="result-bar-label">{s.label}</span>
                <div className="result-bar-track">
                  <div className="result-bar-fill" style={{
                    width: `${(s.max / test.scoring[test.scoring.length - 1].max) * 100}%`,
                    background: s.color, opacity: result.label === s.label ? 1 : 0.3,
                  }} />
                </div>
                <span className="result-bar-max">≤{s.max}</span>
              </div>
            ))}
          </div>
          <div className="result-actions">
            {!saved ? (
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "💾 Save Result"}
              </button>
            ) : <span className="result-saved">✅ Result saved!</span>}
            <button className="btn-muted" onClick={onBack}>Take Another Test</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-page">
      <button className="btn-muted back-btn" onClick={onBack}>← Back</button>
      <div className="test-page-header">
        <h2>{test.title}</h2>
        <p>{test.instruction}</p>
        <div className="test-progress-bar">
          <div className="test-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="test-progress-label">{answered} / {totalQuestions} answered</span>
      </div>
      <div className="test-questions">
        {questions.map((q, i) => (
          <div key={i} className="test-question-card">
            <p className="test-q-text"><span className="test-q-num">{i + 1}.</span> {q.text}</p>
            <div className="test-options">
              {test.options.map((opt, j) => (
                <label key={j} className={`test-option ${answers[i] === test.optionValues[j] ? "selected" : ""}`}>
                  <input type="radio" name={`q${i}`} value={test.optionValues[j]}
                    checked={answers[i] === test.optionValues[j]}
                    onChange={() => handleAnswer(i, test.optionValues[j])} />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="test-submit-row">
        <button className="btn-primary" onClick={handleSubmit}
          disabled={answered < totalQuestions} style={{ opacity: answered < totalQuestions ? 0.5 : 1 }}>
          Submit & See Results →
        </button>
        {answered < totalQuestions && (
          <span className="test-incomplete-hint">Please answer all {totalQuestions} questions</span>
        )}
      </div>
    </div>
  );
};

export default MentalHealthTest;
