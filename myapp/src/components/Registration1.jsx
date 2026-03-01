import React, { useState } from "react";
import regIllustration from "../assets/meditation.png"; // reuse same asset or replace

const Registration = ({ onClose, openLogin }) => {
  const [form, setForm] = useState({
    username: "",
    gender: "",
    age: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Dummy submit - replace with API call
    console.log("Register payload:", form);
    alert("Registration successful (dummy)");
    onClose();
  };

  return (
    <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-card register-card" role="dialog" aria-modal="true">
        <div className="auth-close">
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="auth-grid">
          <div className="auth-illustration">
            <img src={regIllustration} alt="Meditation" />
          </div>

          <div className="auth-form">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
              <label className="input-label">
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                />
              </label>

              <label className="input-label">
                <input
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  placeholder="Gender"
                />
              </label>

              <label className="input-label">
                <input
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Age"
                  type="number"
                />
              </label>

              <label className="input-label">
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  type="password"
                  required
                />
              </label>

              <label className="input-label">
                <input
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-type Password"
                  type="password"
                  required
                />
              </label>

              <button type="submit" className="btn-primary full">
                Register
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?{" "}
              <button className="link-btn" onClick={openLogin}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
