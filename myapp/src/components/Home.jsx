import React, { useState, useEffect, useRef } from "react";
import EmergencySupport from "./EmergencySupport";
import ContactUs from "./ContactUs";
import Tests from "./Tests";
import MentalHealthCare from "./MentalHealthCare";
import ChatBot from "./ChatBot";
import MoodTracker from "./MoodTracker";
import GardenPage from "./GardenPage";
import Reviews from "./Reviews";
import TherapistFinder from "./TherapistFinder";

const Home = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState("home");
  const [showEmergency, setShowEmergency] = useState(false);
  const [showContact, setShowContact]     = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const menuRef = useRef(null);

  const nav = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const featureCards = [
    { id: "mentalHealthCare", icon: "🧘", title: "Mental Health Care",   desc: "Tools for Sleep, Anxiety, Stress & Low Mood",           color: "#f4d7d3", accent: "#c58f89" },
    { id: "tests",            icon: "📋", title: "Tests & Assessments", desc: "PHQ-9, GAD-7, PSS-10 and Aptitude (DAT)",               color: "#e8f0fe", accent: "#7b61ff" },
    { id: "moodTracker",      icon: "📊", title: "Mood Tracker",         desc: "Daily mood logs, emoji ratings & cycle tracking",       color: "#e9f7ef", accent: "#4caf80" },
    { id: "chatbot",          icon: "💬", title: "ChatBot",              desc: "Non-judgemental, empathetic AI support",               color: "#fef3e2", accent: "#e08c3a" },
    { id: "garden",           icon: "🌱", title: "Soul Garden",          desc: "Daily streaks, journal, doodle, games & virtual pets",  color: "#f0faf4", accent: "#4caf80" },
    { id: "reviews",          icon: "⭐", title: "Community Reviews",    desc: "See what others say — share your experience",           color: "#f8efed", accent: "#b86f68" },
    { id: "therapist",        icon: "🗺", title: "Find a Therapist",     desc: "Locate mental health professionals near you — free",    color: "#e8f0fe", accent: "#7b61ff" },
  ];

  const sectionTitles = {
    tests:            "Tests & Assessments",
    mentalHealthCare: "Mental Health Care",
    moodTracker:      "Mood Tracker",
    chatbot:          "ChatBot",
    garden:           "Soul Garden",
    reviews:          "Community Reviews",
    therapist:        "Find a Therapist",
  };

  const navLinks = [
    { id: "home",             label: "Home" },
    { id: "tests",            label: "Tests" },
    { id: "mentalHealthCare", label: "Mental Health" },
    { id: "moodTracker",      label: "Mood" },
    { id: "chatbot",          label: "ChatBot" },
    { id: "garden",           label: "🌱 Garden" },
  ];

  const BackBar = ({ title }) => (
    <div className="back-bar">
      <button className="back-bar-btn" onClick={() => nav("home")}>
        <span className="back-arrow">←</span> Home
      </button>
      {title && <span className="back-bar-title">{title}</span>}
    </div>
  );

  const Navbar = () => (
    <header className="navbar" ref={menuRef}>
      <div className="navbar-inner">
        <div className="logo" onClick={() => nav("home")} style={{ cursor: "pointer" }}>
          <span className="logo-icon">🌸</span>
          <span className="logo-text">SoulSpace</span>
        </div>

        <nav className="nav-center nav-desktop">
          {navLinks.map(l => (
            <span
              key={l.id}
              className={"nav-link" + (activeSection === l.id ? " nav-link-active" : "")}
              onClick={() => nav(l.id)}
            >
              {l.label}
            </span>
          ))}
          <span className="nav-link" onClick={() => { setShowContact(true); setMenuOpen(false); }}>Contact</span>
        </nav>

        <div className="nav-right">
          <span className="nav-user nav-user-desktop">👤 {user && user.username ? user.username : "User"}</span>
          <button className="btn-muted nav-icon-btn" onClick={() => setShowEmergency(true)} title="Emergency">🆘</button>
          <button className="btn-outline nav-logout-btn" onClick={onLogout}>Logout</button>
          <button
            className={"hamburger" + (menuOpen ? " open" : "")}
            onClick={() => setMenuOpen(function(o){ return !o; })}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-user">👤 {user && user.username ? user.username : "User"}</div>
          <div className="mobile-menu-divider" />
          {navLinks.map(l => (
            <button
              key={l.id}
              className={"mobile-menu-item" + (activeSection === l.id ? " active" : "")}
              onClick={() => nav(l.id)}
            >
              {l.label}
            </button>
          ))}
          <button className="mobile-menu-item" onClick={() => { setShowContact(true); setMenuOpen(false); }}>Contact</button>
          <div className="mobile-menu-divider" />
          <button className="mobile-menu-item mobile-menu-emergency" onClick={() => { setShowEmergency(true); setMenuOpen(false); }}>🆘 Emergency Help</button>
          <button className="mobile-menu-item mobile-menu-logout" onClick={onLogout}>Logout</button>
        </div>
      )}
    </header>
  );

  if (activeSection !== "home") {
    return (
      <div className="dashboard">
        <Navbar />
        <BackBar title={sectionTitles[activeSection]} />
        <div className="section-content">
          {activeSection === "tests"            && <Tests user={user} />}
          {activeSection === "mentalHealthCare" && <MentalHealthCare user={user} />}
          {activeSection === "moodTracker"      && <MoodTracker user={user} />}
          {activeSection === "chatbot"          && <ChatBot user={user} />}
          {activeSection === "garden"           && <GardenPage user={user} />}
          {activeSection === "reviews"          && <Reviews user={user} />}
          {activeSection === "therapist"        && <TherapistFinder />}
        </div>
        {showEmergency && <EmergencySupport onClose={() => setShowEmergency(false)} />}
        {showContact   && <ContactUs onClose={() => setShowContact(false)} />}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />

      <section className="home-welcome">
        <div className="home-welcome-text">
          <h1>Welcome back,<br /><span className="home-name">{user && user.username ? user.username : "Friend"}</span> 🌸</h1>
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
            <p className="home-card-desc">{card.desc}</p>
            <button className="home-card-btn" style={{ color: card.accent, borderColor: card.accent }}>Explore →</button>
          </div>
        ))}
      </section>

      <section className="home-quick">
        <h2>Quick Actions</h2>
        <div className="home-quick-row">
          <button className="btn-primary"  onClick={() => nav("tests")}>📋 Take a Test</button>
          <button className="btn-soft"     onClick={() => nav("moodTracker")}>📊 Log Mood</button>
          <button className="btn-muted"    onClick={() => nav("chatbot")}>💬 ChatBot</button>
          <button className="btn-soft"     onClick={() => nav("garden")}>🌱 Garden</button>
          <button className="btn-soft"     onClick={() => nav("reviews")}>⭐ Reviews</button>
          <button className="btn-soft"     onClick={() => nav("therapist")}>🗺 Find Therapist</button>
          <button className="btn-outline"  onClick={() => setShowEmergency(true)}>🆘 Emergency</button>
        </div>
      </section>

      {showEmergency && <EmergencySupport onClose={() => setShowEmergency(false)} />}
      {showContact   && <ContactUs onClose={() => setShowContact(false)} />}
    </div>
  );
};

export default Home;
