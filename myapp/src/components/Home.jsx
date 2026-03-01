import React, { useState } from "react";
import EmergencySupport from "./EmergencySupport";
import ContactUs from "./ContactUs";
import Tests from "./Tests";
import MentalHealthCare from "./MentalHealthCare";
import ChatBot from "./ChatBot";
import MoodTracker from "./MoodTracker";
import GardenPage from "./GardenPage";

const Home = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState("home");
  const [showEmergency, setShowEmergency] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const nav = (section) => setActiveSection(section);

  const featureCards = [
    { id: "mentalHealthCare", icon: "🧘", title: "Mental Health Care", desc: "Tools for Sleep, Anxiety, Stress & Low Mood", color: "#f4d7d3", accent: "#c58f89" },
    { id: "tests", icon: "📋", title: "Tests & Assessments", desc: "PHQ-9, GAD-7, PSS-10 and Aptitude (DAT)", color: "#e8f0fe", accent: "#7b61ff" },
    { id: "moodTracker", icon: "📊", title: "Mood Tracker", desc: "Daily mood logs, emoji ratings & cycle tracking", color: "#e9f7ef", accent: "#4caf80" },
    { id: "chatbot", icon: "💬", title: "ChatBot", desc: "Non-judgemental, empathetic AI support", color: "#fef3e2", accent: "#e08c3a" },
    { id: "garden", icon: "🌱", title: "Soul Garden", desc: "Daily streaks, journal, doodle, games & virtual pets", color: "#f0faf4", accent: "#4caf80" },
  ];

  const Navbar = () => (
    <header className="navbar">
      <div className="logo">
        <span className="logo-icon">🌸</span>
        <span>SoulSpace</span>
      </div>
      <nav className="nav-center">
        <span className="nav-link" onClick={() => nav("home")}>Home</span>
        <span className="nav-link" onClick={() => nav("tests")}>Tests</span>
        <span className="nav-link" onClick={() => nav("mentalHealthCare")}>Mental Health</span>
        <span className="nav-link" onClick={() => nav("moodTracker")}>Mood</span>
        <span className="nav-link" onClick={() => nav("chatbot")}>ChatBot</span>
        <span className="nav-link" onClick={() => nav("garden")}>🌱 Garden</span>
        <span className="nav-link" onClick={() => setShowContact(true)}>Contact</span>
      </nav>
      <div className="nav-right">
        <span className="nav-user">👤 {user?.name || "User"}</span>
        <button className="btn-muted" onClick={() => setShowEmergency(true)}>🆘</button>
        <button className="btn-outline" onClick={onLogout}>Logout</button>
      </div>
    </header>
  );

  if (activeSection !== "home") {
    return (
      <div className="dashboard">
        <Navbar />
        <div style={{ marginTop: 32 }}>
          {activeSection === "tests" && <Tests user={user} />}
          {activeSection === "mentalHealthCare" && <MentalHealthCare user={user} />}
          {activeSection === "moodTracker" && <MoodTracker user={user} />}
          {activeSection === "chatbot" && <ChatBot user={user} />}
          {activeSection === "garden" && <GardenPage user={user} />}
        </div>
        {showEmergency && <EmergencySupport onClose={() => setShowEmergency(false)} />}
        {showContact && <ContactUs onClose={() => setShowContact(false)} />}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      <section className="home-welcome">
        <div className="home-welcome-text">
          <h1>Welcome back, <br /><span className="home-name">{user?.name || "Friend"}</span> 🌸</h1>
          <p>How are you feeling today? Explore tools built to help you understand yourself and grow every day.</p>
        </div>
        <div className="home-welcome-art">
          <div className="mood-bubble-row">
            {["😊", "😔", "😤", "😴", "😰"].map((e, i) => (
              <span key={i} className="mood-bubble">{e}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cards">
        {featureCards.map((card) => (
          <div key={card.id} className="home-card" style={{ background: card.color }} onClick={() => nav(card.id)}>
            <div className="home-card-icon">{card.icon}</div>
            <h3 style={{ color: card.accent }}>{card.title}</h3>
            <p>{card.desc}</p>
            <button className="home-card-btn" style={{ color: card.accent, borderColor: card.accent }}>Explore →</button>
          </div>
        ))}
      </section>

      <section className="home-quick">
        <h2>Quick Actions</h2>
        <div className="home-quick-row">
          <button className="btn-primary" onClick={() => nav("tests")}>📋 Take a Mental Health Test</button>
          <button className="btn-soft" onClick={() => nav("moodTracker")}>📊 Log Today's Mood</button>
          <button className="btn-muted" onClick={() => nav("chatbot")}>💬 Talk to ChatBot</button>
          <button className="btn-soft" onClick={() => nav("garden")}>🌱 Soul Garden</button>
          <button className="btn-outline" onClick={() => setShowEmergency(true)}>🆘 Emergency Help</button>
        </div>
      </section>

      {showEmergency && <EmergencySupport onClose={() => setShowEmergency(false)} />}
      {showContact && <ContactUs onClose={() => setShowContact(false)} />}
    </div>
  );
};

export default Home;
