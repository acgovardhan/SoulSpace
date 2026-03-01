import React, { useState } from "react";
import heroImg from "../assets/meditation.png";
import EmergencySupport from "./EmergencySupport";
import Registration from "./Registration";
import Login from "./Login";
import ContactUs from "./ContactUs";

const Dashboard = () => {
  const [showEmergency, setShowEmergency] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🌸</span>
          <span>SoulSpace</span>
        </div>

        {/* removed Home as requested, keep Contact Us */}
        <nav className="nav-center">
          <span className="nav-link" onClick={() => setShowContact(true)}>Contact Us</span>
        </nav>

        <div className="nav-right">
          <button className="btn-soft" onClick={() => setShowRegister(true)}>
            Register
          </button>
          <button className="btn-outline" onClick={() => setShowLogin(true)}>
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            Become Your <br /> Best Self
          </h1>

          <p>
            Discover personalized assessments, growth tools, and mental wellness
            practices that empower you to overcome stress, anxiety, low mood,
            and everyday challenges.
          </p>

          <div className="hero-actions">
            {/* Get Started opens registration */}
            <button className="btn-primary" onClick={() => setShowRegister(true)}>
              Get Started →
            </button>
            <button
              className="btn-muted"
              onClick={() => setShowEmergency(true)}
            >
              Emergency Call →
            </button>
          </div>
        </div>

        <div className="hero-right">
          <img src={heroImg} alt="Meditation" />
        </div>
      </section>

      {/* Modals / overlays */}
      {showEmergency && <EmergencySupport onClose={() => setShowEmergency(false)} />}
      {showContact && <ContactUs onClose={() => setShowContact(false)} />}

      {showRegister && (
        <Registration
          onClose={() => setShowRegister(false)}
          openLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          openRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
