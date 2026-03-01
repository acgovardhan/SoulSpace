import React, { useState } from "react";
import regIllustration from "../assets/meditation.png";

const Registration = ({ onClose, openLogin }) => {
  const [form, setForm] = useState({
    username: "",
    gender: "",
    age: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (Number(form.age) < 10 || Number(form.age) > 120) {
      setError("Please enter a valid age.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          gender: form.gender,
          age: Number(form.age),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend sends { error: "..." }
        setError(data.error || "Registration failed. Please try again.");
      } else {
        // Registration successful — save token and go to login
        localStorage.setItem("token", data.token);
        openLogin();
      }
    } catch {
      setError("Network error. Is the server running?");
    }
    setLoading(false);
  };

  return (
    <div
      className="auth-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="auth-card register-card" role="dialog" aria-modal="true">
        <div className="auth-close">
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="auth-grid">
          <div className="auth-illustration">
            <img src={regIllustration} alt="Meditation" />
          </div>

          <div className="auth-form">
            <h2>Create Account</h2>

            {error && (
              <p style={{ color: "#f44336", fontSize: 13, marginBottom: 10,
                background: "#fff3f2", borderRadius: 8, padding: "8px 12px" }}>
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <label className="input-label">
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  autoComplete="username"
                />
              </label>

              {/* Gender as select to match your schema enum */}
              <label className="input-label">
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    border: "1px solid #ddd6d6", background: "#fff",
                    outline: "none", fontSize: 14, color: form.gender ? "#333" : "#999",
                  }}
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </label>

              <label className="input-label">
                <input
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Age"
                  type="number"
                  min="10"
                  max="120"
                  required
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
                  minLength={6}
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

              <button
                type="submit"
                className="btn-primary full"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Creating account…" : "Register →"}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?{" "}
              <button className="link-btn" onClick={openLogin}>Sign In</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
