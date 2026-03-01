import React, { useState } from "react";

const careData = {
  sleep: {
    title: "Sleep",
    icon: "😴",
    color: "#e8f0fe",
    accent: "#7b61ff",
    overview:
      "Good sleep is the foundation of mental health. Here are evidence-based techniques and resources to help you sleep better.",
    methods: [
      {
        type: "Micro Course",
        title: "Sleep Hygiene Fundamentals",
        desc: "A quick 5-lesson course on building a healthy sleep routine.",
        icon: "📚",
        link: "https://www.coursera.org/learn/sleep",
      },
      {
        type: "Tutorial",
        title: "Progressive Muscle Relaxation",
        desc: "Step-by-step guide to relax your body before sleep.",
        icon: "📖",
        link: "https://www.youtube.com/results?search_query=progressive+muscle+relaxation+for+sleep+tutorial",
      },
      {
        type: "Podcast",
        title: "Sleep With Me Podcast",
        desc: "Soothing storytelling designed to bore you to sleep.",
        icon: "🎙",
        link: "https://open.spotify.com/show/06eWzBeYMbBgMpSMPLrEjV",
      },
      {
        type: "Exercise",
        title: "4-7-8 Breathing for Sleep",
        desc: "Inhale 4s, hold 7s, exhale 8s. Activates your rest response.",
        icon: "🫁",
        link: "https://www.youtube.com/results?search_query=4-7-8+breathing+exercise+for+sleep",
      },
    ],
    tips: [
      "Maintain a consistent sleep schedule, even on weekends.",
      "Avoid screens 1 hour before bed.",
      "Keep your bedroom cool, dark, and quiet.",
      "Limit caffeine after 2 PM.",
      "Avoid large meals close to bedtime.",
    ],
  },
  anxiety: {
    title: "Anxiety",
    icon: "😰",
    color: "#f4d7d3",
    accent: "#c58f89",
    overview:
      "Anxiety is common and manageable. These tools and techniques can help you calm your nervous system and regain control.",
    methods: [
      {
        type: "Micro Course",
        title: "Understanding Anxiety",
        desc: "Learn the science of anxiety and how to reframe anxious thoughts.",
        icon: "📚",
        link: "https://www.futurelearn.com/courses/anxiety",
      },
      {
        type: "Tutorial",
        title: "Grounding Techniques (5-4-3-2-1)",
        desc: "Use your senses to ground yourself when anxiety spikes.",
        icon: "📖",
        link: "https://www.youtube.com/results?search_query=5-4-3-2-1+grounding+technique+anxiety+tutorial",
      },
      {
        type: "Motivation",
        title: "You Are Not Your Anxiety",
        desc: "Daily affirmations and motivational insights for anxious minds.",
        icon: "💪",
        link: "https://www.youtube.com/results?search_query=anxiety+affirmations+motivation+daily",
      },
      {
        type: "Exercise",
        title: "Box Breathing",
        desc: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Used by Navy SEALs.",
        icon: "🫁",
        link: "https://www.youtube.com/results?search_query=box+breathing+exercise+anxiety+relief",
      },
    ],
    tips: [
      "Practice mindfulness for 10 minutes daily.",
      "Challenge anxious thoughts with evidence-based thinking.",
      "Limit news consumption if it increases worry.",
      "Exercise regularly – it naturally reduces anxiety hormones.",
      "Talk about your feelings with someone you trust.",
    ],
  },
  stress: {
    title: "Stress",
    icon: "😤",
    color: "#fef3e2",
    accent: "#e08c3a",
    overview:
      "Stress is your body's response to challenge. With the right tools, you can learn to manage it effectively.",
    methods: [
      {
        type: "Micro Course",
        title: "Stress Management 101",
        desc: "Identify your stress triggers and build a personalized coping plan.",
        icon: "📚",
        link: "https://www.edx.org/learn/stress-management",
      },
      {
        type: "Tutorial",
        title: "Time Blocking for Stress Reduction",
        desc: "Organize your day to reduce overwhelm and decision fatigue.",
        icon: "📖",
        link: "https://www.youtube.com/results?search_query=time+blocking+tutorial+stress+management+productivity",
      },
      {
        type: "Podcast",
        title: "10% Happier – Dan Harris",
        desc: "Practical mindfulness and stress management for skeptics.",
        icon: "🎙",
        link: "https://open.spotify.com/show/1CfW319UkBcy0AIJIYmZ3T",
      },
      {
        type: "Exercise",
        title: "5-Minute Body Scan Meditation",
        desc: "Release physical tension stored from stress with this guided scan.",
        icon: "🧘",
        link: "https://www.youtube.com/results?search_query=5+minute+body+scan+meditation+stress+relief",
      },
    ],
    tips: [
      "Break large tasks into smaller, manageable steps.",
      "Say no to commitments that overwhelm you.",
      "Take short breaks every 90 minutes of work.",
      "Spend time in nature – it lowers cortisol.",
      "Journaling helps process stressful events.",
    ],
  },
  lowMood: {
    title: "Low Mood",
    icon: "😔",
    color: "#e9f7ef",
    accent: "#4caf80",
    overview:
      "Low mood is different from depression but worth addressing. Small steps can make a big difference.",
    methods: [
      {
        type: "Micro Course",
        title: "Behavioural Activation",
        desc: "Schedule activities that bring pleasure and a sense of achievement.",
        icon: "📚",
        link: "https://www.coursera.org/learn/positive-psychology",
      },
      {
        type: "Tutorial",
        title: "Gratitude Practice Guide",
        desc: "How to build a gratitude habit that lifts your mood over time.",
        icon: "📖",
        link: "https://www.youtube.com/results?search_query=gratitude+practice+guide+tutorial+low+mood",
      },
      {
        type: "Motivation",
        title: "Small Steps, Big Change",
        desc: "Daily micro-challenges to get you moving and feeling better.",
        icon: "💪",
        link: "https://www.youtube.com/results?search_query=overcoming+low+mood+motivation+daily+habits",
      },
      {
        type: "Exercise",
        title: "10-Minute Walk + Intention Setting",
        desc: "Movement + intention is a powerful mood booster.",
        icon: "🚶",
        link: "https://www.youtube.com/results?search_query=10+minute+walking+meditation+intention+mood+boost",
      },
    ],
    tips: [
      "Reach out to a friend or family member today.",
      "Sunlight exposure in the morning boosts serotonin.",
      "Physical exercise is as effective as antidepressants for mild-moderate low mood.",
      "Limit alcohol – it's a depressant.",
      "Eat regular, nutritious meals.",
    ],
  },
};

const MentalHealthCare = ({ user }) => {
  const [active, setActive] = useState(null);

  const tabs = [
    { id: "sleep",   label: "Sleep",    icon: "😴" },
    { id: "anxiety", label: "Anxiety",  icon: "😰" },
    { id: "stress",  label: "Stress",   icon: "😤" },
    { id: "lowMood", label: "Low Mood", icon: "😔" },
  ];

  const data = active ? careData[active] : null;

  return (
    <div className="care-container">
      <div className="care-header">
        <h2>Mental Health Care</h2>
        <p>
          Select a topic to explore personalised resources, micro-courses,
          exercises, and science-backed tips.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="care-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`care-tab ${active === tab.id ? "active" : ""}`}
            style={
              active === tab.id
                ? { background: careData[tab.id].accent, color: "white", borderColor: careData[tab.id].accent }
                : {}
            }
            onClick={() => setActive(active === tab.id ? null : tab.id)}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Topic Panel */}
      {data && (
        <div className="care-panel" style={{ borderColor: data.accent, background: data.color }}>
          <h3 style={{ color: data.accent }}>{data.icon} {data.title}</h3>
          <p className="care-overview">{data.overview}</p>

          <div className="care-methods-grid">
            {data.methods.map((m, i) => (
              <div key={i} className="care-method-card">
                <div className="care-method-top">
                  <span className="care-method-icon">{m.icon}</span>
                  <span className="care-method-type" style={{ color: data.accent }}>
                    {m.type}
                  </span>
                </div>
                <h4>{m.title}</h4>
                <p>{m.desc}</p>
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="care-method-btn"
                  style={{
                    color: data.accent,
                    borderColor: data.accent,
                    display: "inline-block",
                    textDecoration: "none",
                  }}
                >
                  View →
                </a>
              </div>
            ))}
          </div>

          <div className="care-tips">
            <h4 style={{ color: data.accent }}>💡 Quick Tips</h4>
            <ul>
              {data.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Overview cards when nothing is selected */}
      {!active && (
        <div className="care-overview-grid">
          {tabs.map((tab) => {
            const d = careData[tab.id];
            return (
              <div
                key={tab.id}
                className="care-overview-card"
                style={{ background: d.color, borderColor: d.accent }}
                onClick={() => setActive(tab.id)}
              >
                <div className="care-overview-icon">{tab.icon}</div>
                <h3 style={{ color: d.accent }}>{tab.label}</h3>
                <p>{d.overview.substring(0, 80)}…</p>
                <button
                  className="care-method-btn"
                  style={{ color: d.accent, borderColor: d.accent }}
                >
                  Explore →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentalHealthCare;
