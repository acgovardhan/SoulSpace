import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";

// ─── Constants ────────────────────────────────────────────────
const PETS = [
  { id: "fish", name: "Tiny Fish", emoji: "🐟", cost: 7, desc: "A calm little companion.", color: "#e8f0fe", accent: "#7b61ff", food: "fish flakes 🌊", stages: ["🥚","🐟","🐠"] },
  { id: "chick", name: "Baby Chick", emoji: "🐣", cost: 7, desc: "A fluffy chick that chirps with joy.", color: "#fef3e2", accent: "#e08c3a", food: "grain seeds 🌾", stages: ["🥚","🐣","🐔"] },
  { id: "lizard", name: "Gecko", emoji: "🦎", cost: 10, desc: "A quirky gecko with big eyes.", color: "#e9f7ef", accent: "#4caf80", food: "tiny insects 🦗", stages: ["🥚","🦎","🐊"] },
  { id: "bunny", name: "Mini Bunny", emoji: "🐰", cost: 10, desc: "A soft bunny that loves check-ins.", color: "#f4d7d3", accent: "#c58f89", food: "carrots 🥕", stages: ["🥚","🐰","🐇"] },
  { id: "cat", name: "Kitten", emoji: "🐱", cost: 14, desc: "An independent but loving cat.", color: "#f8efed", accent: "#b86f68", food: "cat treats 🎀", stages: ["🥚","🐱","🐈"] },
];

const DAILY_ACTIVITIES = [
  { id: "journal", label: "Journal Entry", icon: "📓", points: 5 },
  { id: "doodle",  label: "Doodle Session", icon: "🎨", points: 3 },
  { id: "game",    label: "Stress Game",    icon: "🎮", points: 3 },
  { id: "mood",    label: "Log Mood",       icon: "😊", points: 2 },
  { id: "login",   label: "Daily Login",    icon: "✅", points: 1 },
];

const getToday = () => new Date().toISOString().split("T")[0];

// ─── Doodle Canvas ────────────────────────────────────────────
const DoodleCanvas = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [color, setColor] = useState("#d29a94");
  const [size, setSize] = useState(6);
  const [done, setDone] = useState(false);
  const colors = ["#d29a94","#7b61ff","#4caf80","#e08c3a","#f44336","#333"];

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDraw = (e) => {
    drawing.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = "round";
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y); ctx.stroke();
  };
  const stopDraw = () => { drawing.current = false; };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="doodle-wrapper">
      <p className="doodle-prompt">✏️ Express yourself freely — draw anything that comes to mind!</p>
      <div className="doodle-toolbar">
        <div className="doodle-colors">
          {colors.map(c => (
            <button key={c} className={`doodle-color-btn ${color === c ? "active" : ""}`}
              style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>
        <div className="doodle-size">
          {[3,6,12,20].map(s => (
            <button key={s} className={`doodle-size-btn ${size === s ? "active" : ""}`} onClick={() => setSize(s)}>
              <span style={{ width: s, height: s, borderRadius: "50%", background: "#6b4f4f", display: "block" }} />
            </button>
          ))}
        </div>
        <button className="btn-muted doodle-clear" onClick={clearCanvas}>🗑 Clear</button>
      </div>
      <canvas ref={canvasRef} width={560} height={300} className="doodle-canvas"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      {!done ? (
        <button className="btn-primary doodle-done-btn" onClick={() => { setDone(true); onComplete(); }}>
          ✅ I'm done doodling (+3 pts)
        </button>
      ) : <p className="activity-done-msg">🎉 Beautiful! Points added.</p>}
    </div>
  );
};

// ─── Bubble Pop Game ──────────────────────────────────────────
const BubbleGame = ({ onComplete }) => {
  const [bubbles, setBubbles] = useState(() => generateBubbles());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [finished, setFinished] = useState(false);

  function generateBubbles() {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i, x: 8 + Math.random() * 78, y: 10 + Math.random() * 75,
      size: 40 + Math.random() * 30,
      color: ["#f4d7d3","#e8f0fe","#e9f7ef","#fef3e2","#f8efed"][Math.floor(Math.random() * 5)],
      popped: false,
    }));
  }

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { setFinished(true); onComplete(); clearInterval(t); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [finished]);

  useEffect(() => {
    if (bubbles.every(b => b.popped)) setTimeout(() => setBubbles(generateBubbles()), 300);
  }, [bubbles]);

  const pop = (id) => { setBubbles(p => p.map(b => b.id === id ? { ...b, popped: true } : b)); setScore(p => p + 1); };

  return (
    <div className="bubble-game">
      <div className="bubble-hud">
        <span>💥 Popped: <strong>{score}</strong></span>
        <span style={{ color: timeLeft <= 5 ? "#f44336" : "#6b4f4f" }}>⏱ {timeLeft}s</span>
      </div>
      <p className="bubble-instructions">Pop the bubbles to release stress! 🫧</p>
      <div className="bubble-arena">
        {bubbles.map(b => !b.popped && (
          <button key={b.id} className="bubble"
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.size, height: b.size, background: b.color }}
            onClick={() => pop(b.id)} />
        ))}
        {finished && (
          <div className="bubble-finish">
            <p>🎉 You popped {score} bubbles!</p>
            <p>Feeling a little lighter? 😊</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Pet Display ──────────────────────────────────────────────
const PetDisplay = ({ pet, petDef, onFeed }) => {
  const stage = Math.min(pet.stage || 0, petDef.stages.length - 1);
  const emoji = petDef.stages[stage];
  const happiness = Math.max(0, 100 - (pet.missedDays || 0) * 35);
  return (
    <div className="pet-display" style={{ background: petDef.color, borderColor: petDef.accent }}>
      <div className="pet-emoji-big">{emoji}</div>
      <h3 style={{ color: petDef.accent }}>{petDef.name}</h3>
      <p className="pet-age">Age: {pet.age || 0} days</p>
      <div className="pet-health-bar">
        <span style={{ color: petDef.accent }}>❤️ Happiness</span>
        <div className="pet-bar-track">
          <div className="pet-bar-fill" style={{ width: `${happiness}%`, background: petDef.accent }} />
        </div>
        <span>{happiness}%</span>
      </div>
      <p className="pet-stage-label">
        Stage {stage + 1} of {petDef.stages.length} ·{" "}
        {stage === petDef.stages.length - 1 ? "Fully grown! 🌟" : `${petDef.stages.length - 1 - stage} stage(s) to grow`}
      </p>
      {pet.fedToday ? (
        <p className="pet-fed-msg">✅ Fed today! Come back tomorrow 💛</p>
      ) : (
        <button className="btn-primary pet-feed-btn" style={{ background: petDef.accent }} onClick={onFeed}>
          🍽 Feed {petDef.food}
        </button>
      )}
      {(pet.missedDays || 0) >= 1 && (
        <p className="pet-warning">
          ⚠️ Missed {pet.missedDays} day{pet.missedDays > 1 ? "s" : ""}!
          {pet.missedDays >= 2 ? " Your pet left 💔" : " Feed today or your pet will leave!"}
        </p>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────
const GardenPage = ({ user }) => {
  const [garden, setGarden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hub");
  const [journalText, setJournalText] = useState("");
  const [shopMsg, setShopMsg] = useState("");
  const [feedMsg, setFeedMsg] = useState("");
  const [pointsAnim, setPointsAnim] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── Fetch garden state from DB ────────────────────────────
  const fetchGarden = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/api/garden/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setGarden(data);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchGarden(); }, [user]);

  // ── Save garden state to DB ───────────────────────────────
  const saveGarden = async (patch) => {
    if (!user?.id) return;
    const next = { ...garden, ...patch };
    setGarden(next);
    try {
      await api.put(`/api/garden/${user.id}`, next);
    } catch {}
  };

  const awardPoints = async (activityId, pts) => {
    if (!garden || garden.completedToday.includes(activityId)) return;
    const today = getToday();
    const patch = {
      streakPoints: (garden.streakPoints || 0) + pts,
      completedToday: [...garden.completedToday, activityId],
      lastActivityDate: today,
    };
    await saveGarden(patch);
    setPointsAnim(`+${pts} pts!`);
    setTimeout(() => setPointsAnim(null), 2000);
  };

  const handleJournalSubmit = async () => {
    if (!journalText.trim() || saving) return;
    setSaving(true);
    try {
      const res = await api.post("/api/garden/journal", {
        userId: user.id,
        text: journalText,
      });
      if (res.ok) {
        const newEntry = { text: journalText, date: new Date().toISOString() };
        const patch = {
          journalEntries: [newEntry, ...(garden.journalEntries || [])],
        };
        await saveGarden(patch);
        await awardPoints("journal", 5);
        setJournalText("");
      }
    } catch {}
    setSaving(false);
  };

  const buyPet = async (petId) => {
    const petDef = PETS.find(p => p.id === petId);
    if ((garden.streakPoints || 0) < petDef.cost) {
      setShopMsg(`❌ Need ${petDef.cost} streak points. You have ${garden.streakPoints || 0}.`);
      return;
    }
    const pet = { id: petId, fedToday: false, missedDays: 0, age: 0, stage: 0, lastFedDate: null };
    await saveGarden({
      pet,
      streakPoints: (garden.streakPoints || 0) - petDef.cost,
    });
    setShopMsg(`🎉 You got a ${petDef.name}! Go to My Pet to take care of it.`);
  };

  const feedPet = async () => {
    const today = getToday();
    const updatedPet = {
      ...garden.pet,
      fedToday: true,
      missedDays: 0,
      lastFedDate: today,
      age: (garden.pet.age || 0) + 1,
      stage: Math.min(
        (garden.pet.stage || 0) + ((garden.pet.age || 0) % 5 === 4 ? 1 : 0),
        PETS.find(p => p.id === garden.pet.id).stages.length - 1
      ),
    };
    await saveGarden({ pet: updatedPet });
    setFeedMsg("🍽 Your pet is happy and well-fed! See you tomorrow 💛");
    await awardPoints("pet_feed", 2);
  };

  if (loading) return <div className="garden-page"><div className="loading-spinner">Loading your garden…</div></div>;
  if (!garden) return <div className="garden-page"><p style={{ color: "#9b7c78" }}>Unable to load garden. Please try refreshing.</p></div>;

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const petDef = garden.pet ? PETS.find(p => p.id === garden.pet.id) : null;
  const totalPossibleToday = DAILY_ACTIVITIES.reduce((s, a) => s + a.points, 0);
  const earnedToday = DAILY_ACTIVITIES
    .filter(a => (garden.completedToday || []).includes(a.id))
    .reduce((s, a) => s + a.points, 0);

  return (
    <div className="garden-page">
      {/* Header */}
      <div className="garden-header">
        <div>
          <h2>🌱 Soul Garden</h2>
          <p>Grow daily habits, earn points, and care for your virtual pet.</p>
        </div>
        <div className="garden-points-badge">
          <span className="garden-pts-num">{garden.streakPoints || 0}</span>
          <span className="garden-pts-label">streak pts</span>
          {pointsAnim && <span className="pts-anim">{pointsAnim}</span>}
        </div>
      </div>

      {/* Streak Banner */}
      <div className="streak-banner">
        <div className="streak-flame">
          🔥 <span>{garden.currentStreak || 0}</span>
          <small>day streak</small>
        </div>
        <div className="streak-week">
          {weekDays.map((d, i) => {
            const isToday = d === getToday();
            const isPast = d < getToday();
            return (
              <div key={i} className={`streak-day ${isToday ? "today" : isPast ? "past" : "future"}`}>
                <span className="streak-day-dot">{isToday ? "🌟" : isPast ? "✅" : "○"}</span>
                <span className="streak-day-label">
                  {new Date(d + "T12:00:00").toLocaleDateString("en", { weekday: "short" })}
                </span>
              </div>
            );
          })}
        </div>
        <div className="streak-total">
          🏆 <span>{garden.totalDays || 0}</span> <small>total days</small>
        </div>
      </div>

      {/* Tabs */}
      <div className="garden-tabs">
        {[
          { id: "hub",     label: "🏠 Today" },
          { id: "journal", label: "📓 Journal" },
          { id: "doodle",  label: "🎨 Doodle" },
          { id: "game",    label: "🎮 Games" },
          { id: "pet",     label: `${petDef ? petDef.emoji : "🛒"} ${garden.pet ? "My Pet" : "Pet Shop"}` },
        ].map(tab => (
          <button key={tab.id}
            className={`garden-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* HUB */}
      {activeTab === "hub" && (
        <div className="garden-hub">
          <h3>Today's Activities</h3>
          <p className="hub-sub">Complete activities to earn streak points.</p>
          <div className="hub-progress-row">
            <span>{earnedToday} / {totalPossibleToday} pts earned today</span>
            <div className="hub-progress-track">
              <div className="hub-progress-fill" style={{ width: `${(earnedToday / totalPossibleToday) * 100}%` }} />
            </div>
          </div>
          <div className="hub-activities">
            {DAILY_ACTIVITIES.map(a => {
              const done = (garden.completedToday || []).includes(a.id);
              return (
                <div key={a.id} className={`hub-activity ${done ? "done" : ""}`}>
                  <span className="hub-act-icon">{a.icon}</span>
                  <div className="hub-act-info">
                    <strong>{a.label}</strong>
                    <span>+{a.points} pts</span>
                  </div>
                  {done ? <span className="hub-act-check">✅</span> : (
                    <button className="btn-soft hub-act-btn"
                      onClick={() => setActiveTab(a.id === "journal" ? "journal" : a.id === "doodle" ? "doodle" : a.id === "game" ? "game" : "hub")}>
                      Go →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div className="hub-shop-teaser">
            <h4>🛒 Pet Shop</h4>
            <p>Save up 7–14 streak points to adopt a virtual pet!</p>
            <div className="hub-pet-previews">
              {PETS.map(p => (
                <span key={p.id} className="hub-pet-chip" style={{ background: p.color, color: p.accent }}>
                  {p.emoji} {p.name} — {p.cost} pts
                </span>
              ))}
            </div>
            <button className="btn-primary" onClick={() => setActiveTab("pet")}>Visit Pet Shop →</button>
          </div>
        </div>
      )}

      {/* JOURNAL */}
      {activeTab === "journal" && (
        <div className="journal-section">
          <h3>📓 Daily Journal</h3>
          <p className="journal-sub">Write a few words about your day. No pressure — this is just for you. 🌸</p>
          {!(garden.completedToday || []).includes("journal") ? (
            <div className="journal-card">
              <p className="journal-prompt">
                {["What's one thing that made you smile today? 😊",
                  "How are you really feeling right now?",
                  "What was the hardest part of today, and how did you handle it?",
                  "Write about something you're grateful for today. 🙏",
                  "What's one thing you'd like to let go of today?"][new Date().getDay() % 5]}
              </p>
              <textarea className="journal-textarea" placeholder="Start writing... there's no wrong answer."
                value={journalText} onChange={e => setJournalText(e.target.value)} rows={6} />
              <div className="journal-footer">
                <span className="journal-char">{journalText.length} characters</span>
                <button className="btn-primary" onClick={handleJournalSubmit}
                  disabled={journalText.trim().length < 10 || saving}
                  style={{ opacity: journalText.trim().length < 10 ? 0.5 : 1 }}>
                  {saving ? "Saving…" : "✅ Save Entry (+5 pts)"}
                </button>
              </div>
            </div>
          ) : (
            <div className="activity-done-card">
              <p>🎉 Journal entry saved for today! +5 points earned.</p>
            </div>
          )}
          {(garden.journalEntries || []).length > 0 && (
            <div className="journal-history">
              <h4>Past Entries</h4>
              {(garden.journalEntries || []).slice(0, 5).map((e, i) => (
                <div key={i} className="journal-entry-card">
                  <p className="journal-entry-date">
                    {new Date(e.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <p className="journal-entry-text">{e.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOODLE */}
      {activeTab === "doodle" && (
        <div className="doodle-section">
          <h3>🎨 Doodle Pad</h3>
          <p>Drawing is a great stress reliever. Let your imagination run wild!</p>
          <DoodleCanvas onComplete={() => awardPoints("doodle", 3)} />
        </div>
      )}

      {/* GAME */}
      {activeTab === "game" && (
        <div className="game-section">
          <h3>🎮 Stress Relief Games</h3>
          <p>A quick game to help clear your mind and lift your mood.</p>
          {!(garden.completedToday || []).includes("game") ? (
            <BubbleGame onComplete={() => awardPoints("game", 3)} />
          ) : (
            <div className="activity-done-card">
              <p>🎉 Game completed for today! +3 points earned. Great job! 🫧</p>
              <p style={{ color: "#9b7c78", fontSize: 13, marginTop: 8 }}>Come back tomorrow for another session!</p>
            </div>
          )}
        </div>
      )}

      {/* PET */}
      {activeTab === "pet" && (
        <div className="pet-section">
          {garden.pet && petDef ? (
            <>
              <h3>🐾 My Pet</h3>
              {feedMsg && <p className="pet-feed-msg-banner">{feedMsg}</p>}
              <PetDisplay pet={garden.pet} petDef={petDef} onFeed={feedPet} />
              <div className="pet-care-tips">
                <h4>Care Guide</h4>
                <ul>
                  <li>🍽 Feed your pet daily to keep it happy</li>
                  <li>⚠️ Missing 2 days in a row means your pet leaves</li>
                  <li>📈 Feed daily to help it grow through {petDef.stages.length} stages</li>
                  <li>💛 A happy pet = a happy you!</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <h3>🛒 Pet Shop</h3>
              <p className="shop-sub">You have <strong>{garden.streakPoints || 0} streak points</strong>.</p>
              {shopMsg && <p className="shop-msg">{shopMsg}</p>}
              <div className="pet-shop-grid">
                {PETS.map(p => (
                  <div key={p.id} className="pet-shop-card" style={{ background: p.color, borderColor: p.accent }}>
                    <div className="pet-shop-emoji">{p.emoji}</div>
                    <h4 style={{ color: p.accent }}>{p.name}</h4>
                    <p>{p.desc}</p>
                    <div className="pet-stages-row">
                      {p.stages.map((s, i) => <span key={i} className="pet-stage-chip">{s}</span>)}
                    </div>
                    <p className="pet-food-label">Eats: {p.food}</p>
                    <div className="pet-cost-row">
                      <span className="pet-cost" style={{ color: p.accent }}>🏆 {p.cost} pts</span>
                      <button className="btn-primary pet-buy-btn" style={{ background: p.accent }}
                        onClick={() => buyPet(p.id)}
                        disabled={(garden.streakPoints || 0) < p.cost}>
                        {(garden.streakPoints || 0) >= p.cost ? "Adopt →" : `Need ${p.cost - (garden.streakPoints || 0)} more pts`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GardenPage;
