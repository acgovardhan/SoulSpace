import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

const EMOJI_MOODS = [
  { emoji: "😄", label: "Great", value: 5, color: "#4caf80" },
  { emoji: "🙂", label: "Good", value: 4, color: "#8bc34a" },
  { emoji: "😐", label: "Okay", value: 3, color: "#ffc107" },
  { emoji: "😔", label: "Low", value: 2, color: "#ff9800" },
  { emoji: "😢", label: "Bad", value: 1, color: "#f44336" },
];

const CYCLE_PHASES = [
  { id: "menstrual", label: "Menstrual (Day 1–5)", icon: "🔴" },
  { id: "follicular", label: "Follicular (Day 6–13)", icon: "🌱" },
  { id: "ovulation", label: "Ovulation (Day 14)", icon: "🌟" },
  { id: "luteal", label: "Luteal (Day 15–28)", icon: "🌙" },
];

const MoodTracker = ({ user }) => {
  const [gender, setGender] = useState(user?.gender || null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState("log");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Pre-fill gender from user profile
  useEffect(() => {
    if (user?.gender) setGender(user.gender);
  }, [user]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await api.get(`/api/mood/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {}
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleSave = async () => {
    if (!selectedMood) return;
    setSaving(true);
    try {
      const res = await api.post("/api/mood", {
        userId: user?.id,
        mood: selectedMood,
        phase: selectedPhase,
        note,
      });
      if (res.ok) {
        setSaved(true);
        setSelectedMood(null);
        setSelectedPhase(null);
        setNote("");
        fetchHistory();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="mood-container">
      <div className="mood-header">
        <h2>Mood Tracker</h2>
        <p>Log how you feel each day and spot patterns over time.</p>
        <div className="mood-view-toggle">
          <button className={view === "log" ? "btn-primary" : "btn-muted"} onClick={() => setView("log")}>
            📝 Log Mood
          </button>
          <button className={view === "history" ? "btn-primary" : "btn-muted"} onClick={() => { setView("history"); fetchHistory(); }}>
            📊 History
          </button>
        </div>
      </div>

      {view === "log" && (
        <div className="mood-log-card">
          {!gender ? (
            <div className="mood-gender-select">
              <h3>Personalise your tracker</h3>
              <p>We'll show relevant options based on your selection.</p>
              <div className="mood-gender-btns">
                <button className="btn-soft" onClick={() => setGender("female")}>👩 Female</button>
                <button className="btn-muted" onClick={() => setGender("male")}>👨 Male</button>
                <button className="btn-outline" onClick={() => setGender("other")}>🧑 Prefer not to say</button>
              </div>
            </div>
          ) : (
            <>
              <h3>How are you feeling today?</h3>
              <p className="mood-date">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>

              <div className="mood-emoji-row">
                {EMOJI_MOODS.map((m) => (
                  <button key={m.value}
                    className={`mood-emoji-btn ${selectedMood?.value === m.value ? "mood-selected" : ""}`}
                    style={selectedMood?.value === m.value
                      ? { background: m.color + "22", borderColor: m.color, transform: "scale(1.15)" }
                      : {}}
                    onClick={() => setSelectedMood(m)} title={m.label}>
                    <span className="mood-emoji">{m.emoji}</span>
                    <span className="mood-label" style={{ color: m.color }}>{m.label}</span>
                  </button>
                ))}
              </div>

              {gender === "female" && (
                <div className="mood-cycle-section">
                  <h4>Cycle Phase (optional)</h4>
                  <div className="mood-cycle-row">
                    {CYCLE_PHASES.map((p) => (
                      <button key={p.id}
                        className={`mood-cycle-btn ${selectedPhase === p.id ? "mood-cycle-active" : ""}`}
                        onClick={() => setSelectedPhase(selectedPhase === p.id ? null : p.id)}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mood-note-section">
                <h4>Add a note (optional)</h4>
                <textarea className="mood-textarea" placeholder="What's on your mind today?"
                  value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              </div>

              <div className="mood-save-row">
                <button className="btn-primary" onClick={handleSave}
                  disabled={!selectedMood || saving} style={{ opacity: !selectedMood ? 0.5 : 1 }}>
                  {saving ? "Saving…" : "💾 Save Today's Mood"}
                </button>
                {saved && <span className="mood-saved-msg">✅ Mood logged!</span>}
                {user?.gender ? null : (
                  <button className="btn-muted" style={{ marginLeft: 8 }} onClick={() => setGender(null)}>
                    Change profile
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {view === "history" && (
        <div className="mood-history">
          {loadingHistory ? (
            <div className="loading-spinner">Loading history…</div>
          ) : history.length === 0 ? (
            <div className="mood-empty">
              <p>No mood logs yet. Start logging to see your history!</p>
              <button className="btn-primary" onClick={() => setView("log")}>Log Your First Mood</button>
            </div>
          ) : (
            <>
              <div className="mood-chart">
                <h4>Last 7 Entries</h4>
                <div className="mood-bar-chart">
                  {history.slice(-7).map((entry, i) => {
                    const mood = EMOJI_MOODS.find((m) => m.value === entry.mood?.value);
                    return (
                      <div key={i} className="mood-bar-col">
                        <div className="mood-bar" style={{
                          height: `${(entry.mood?.value / 5) * 80}px`,
                          background: mood?.color || "#ccc",
                        }} title={`${mood?.label} – ${new Date(entry.date).toLocaleDateString()}`} />
                        <span className="mood-bar-emoji">{mood?.emoji || "?"}</span>
                        <span className="mood-bar-date">
                          {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mood-list">
                {[...history].reverse().map((entry, i) => {
                  const mood = EMOJI_MOODS.find((m) => m.value === entry.mood?.value);
                  const phase = CYCLE_PHASES.find((p) => p.id === entry.phase);
                  return (
                    <div key={i} className="mood-list-item">
                      <span className="mood-list-emoji">{mood?.emoji || "😐"}</span>
                      <div className="mood-list-info">
                        <strong style={{ color: mood?.color }}>{mood?.label}</strong>
                        {phase && <span className="mood-list-phase"> · {phase.icon} {phase.label}</span>}
                        {entry.note && <p className="mood-list-note">{entry.note}</p>}
                      </div>
                      <span className="mood-list-date">
                        {new Date(entry.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
