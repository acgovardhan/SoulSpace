import React, { useState } from "react";
import MentalHealthTest from "./MentalHealthTest";
import AptitudeTest from "./AptitudeTest";

const testCards = [
  {
    id: "phq9",
    label: "PHQ-9",
    title: "Depression Screening",
    desc: "Patient Health Questionnaire – 9 items. Screens for depressive disorder severity.",
    time: "~3 min",
    icon: "🧠",
    color: "#f4d7d3",
    accent: "#c58f89",
  },
  {
    id: "gad7",
    label: "GAD-7",
    title: "Anxiety Screening",
    desc: "Generalized Anxiety Disorder – 7 items. Measures anxiety symptom severity.",
    time: "~2 min",
    icon: "😰",
    color: "#e8f0fe",
    accent: "#7b61ff",
  },
  {
    id: "pss10",
    label: "PSS-10",
    title: "Stress Screening",
    desc: "Perceived Stress Scale – 10 items. Assesses how stressful you find your life.",
    time: "~3 min",
    icon: "😤",
    color: "#fef3e2",
    accent: "#e08c3a",
  },
  {
    id: "dat",
    label: "DAT",
    title: "Aptitude Test",
    desc: "Differential Aptitude Test – evaluates your cognitive and problem-solving skills.",
    time: "~15 min",
    icon: "📐",
    color: "#e9f7ef",
    accent: "#4caf80",
  },
];

const Tests = ({ user }) => {
  const [activeTest, setActiveTest] = useState(null);

  if (activeTest === "dat") {
    return <AptitudeTest onBack={() => setActiveTest(null)} user={user} />;
  }

  if (activeTest) {
    return (
      <MentalHealthTest
        testId={activeTest}
        onBack={() => setActiveTest(null)}
        user={user}
      />
    );
  }

  return (
    <div className="tests-container">
      <div className="tests-header">
        <h2>Tests & Assessments</h2>
        <p>
          Based on the UNICEF Mental Health Toolkit. All tests are confidential
          and designed to help you understand yourself better.
        </p>
      </div>

      <div className="tests-grid">
        {testCards.map((t) => (
          <div
            key={t.id}
            className="test-card"
            style={{ background: t.color }}
          >
            <div className="test-card-top">
              <span className="test-icon">{t.icon}</span>
              <span className="test-badge" style={{ color: t.accent }}>
                {t.label}
              </span>
            </div>
            <h3 style={{ color: t.accent }}>{t.title}</h3>
            <p>{t.desc}</p>
            <div className="test-meta">
              <span>⏱ {t.time}</span>
            </div>
            <button
              className="btn-primary test-start-btn"
              style={{ background: t.accent }}
              onClick={() => setActiveTest(t.id)}
            >
              Start Test →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tests;
