import React, { useState } from "react";

// ─── Question Banks ──────────────────────────────────────────────────────────

const tests = {
  phq9: {
    title: "PHQ-9 – Depression Screening",
    instruction:
      "Over the last 2 weeks, how often have you been bothered by the following problems?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    optionValues: [0, 1, 2, 3],
    questions: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself – or that you are a failure or have let yourself or your family down",
      "Trouble concentrating on things, such as reading the newspaper or watching television",
      "Moving or speaking so slowly that other people could have noticed? Or so fidgety/restless you moved more than usual",
      "Thoughts that you would be better off dead or of hurting yourself in some way",
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
    instruction:
      "Over the last 2 weeks, how often have you been bothered by the following problems?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    optionValues: [0, 1, 2, 3],
    questions: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid as if something awful might happen",
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
    instruction:
      "In the last month, how often have you felt or thought the following?",
    options: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    optionValues: [0, 1, 2, 3, 4],
    // Items 4,5,7,8 are reverse scored (marked with * in questions array as isReverse)
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

// ─── Component ───────────────────────────────────────────────────────────────

const MentalHealthTest = ({ testId, onBack, user }) => {
  const test = tests[testId];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const questions =
    testId === "pss10"
      ? test.questions
      : test.questions.map((q) => ({ text: q, isReverse: false }));

  const totalQuestions = questions.length;
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / totalQuestions) * 100);

  const handleAnswer = (qIdx, val) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: val }));
  };

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
      await fetch("/api/test-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id,
          testType: testId,
          score,
          label: result?.label,
          answers,
          date: new Date().toISOString(),
        }),
      });
      setSaved(true);
    } catch {
      // handle silently – user can retry
    }
    setSaving(false);
  };

  if (submitted && result) {
    return (
      <div className="test-result-page">
        <button className="btn-muted back-btn" onClick={onBack}>
          ← Back to Tests
        </button>
        <div className="result-card">
          <div className="result-score-ring" style={{ borderColor: result.color }}>
            <span className="result-score-num" style={{ color: result.color }}>
              {score}
            </span>
          </div>
          <h2 style={{ color: result.color }}>{result.label}</h2>
          <p className="result-advice">{result.advice}</p>

          <div className="result-breakdown">
            <h4>Score Breakdown</h4>
            {test.scoring.map((s, i) => (
              <div key={i} className="result-bar-row">
                <span className="result-bar-label">{s.label}</span>
                <div className="result-bar-track">
                  <div
                    className="result-bar-fill"
                    style={{
                      width: `${(s.max / test.scoring[test.scoring.length - 1].max) * 100}%`,
                      background: s.color,
                      opacity: result.label === s.label ? 1 : 0.3,
                    }}
                  />
                </div>
                <span className="result-bar-max">≤{s.max}</span>
              </div>
            ))}
          </div>

          <div className="result-actions">
            {!saved ? (
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "💾 Save Result"}
              </button>
            ) : (
              <span className="result-saved">✅ Result saved!</span>
            )}
            <button className="btn-muted" onClick={onBack}>
              Take Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="test-page">
      <button className="btn-muted back-btn" onClick={onBack}>
        ← Back
      </button>
      <div className="test-page-header">
        <h2>{test.title}</h2>
        <p>{test.instruction}</p>
        <div className="test-progress-bar">
          <div
            className="test-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="test-progress-label">
          {answered} / {totalQuestions} answered
        </span>
      </div>

      <div className="test-questions">
        {questions.map((q, i) => (
          <div key={i} className="test-question-card">
            <p className="test-q-text">
              <span className="test-q-num">{i + 1}.</span> {q.text}
            </p>
            <div className="test-options">
              {test.options.map((opt, j) => (
                <label
                  key={j}
                  className={`test-option ${answers[i] === test.optionValues[j] ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={test.optionValues[j]}
                    checked={answers[i] === test.optionValues[j]}
                    onChange={() => handleAnswer(i, test.optionValues[j])}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="test-submit-row">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={answered < totalQuestions}
          style={{ opacity: answered < totalQuestions ? 0.5 : 1 }}
        >
          Submit & See Results →
        </button>
        {answered < totalQuestions && (
          <span className="test-incomplete-hint">
            Please answer all {totalQuestions} questions
          </span>
        )}
      </div>
    </div>
  );
};

export default MentalHealthTest;
