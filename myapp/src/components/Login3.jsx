import React, { useState } from "react";

// ── Dummy credentials for testing (remove when backend is ready) ──
const DUMMY_USER = { id: "dummy001", username: "testuser", gender: "other", age: 20 };

const Login = ({ onClose, onLogin, openRegister }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ── Dummy login bypass (remove when backend is ready) ──────────
    if (form.username === "testuser" && form.password === "test123") {
      setTimeout(() => {
        localStorage.setItem("token", "dummy-token");
        onLogin(DUMMY_USER);
        onClose();
        setLoading(false);
      }, 600);
      return;
    }
    // ───────────────────────────────────────────────────────────────

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // { username, password }
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        // backend returns { user: { id, username, gender, age }, token }
        localStorage.setItem("token", data.token);
        onLogin(data.user);
        onClose();
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card login-card">
        <div className="auth-close">
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="login-inner">
          <div className="logo" style={{ justifyContent: "center", marginBottom: 12 }}>
            <span>🌸</span> <span>SoulSpace</span>
          </div>
          <h2>Welcome Back</h2>

          {/* Test hint – remove before production */}
          <p style={{ fontSize: 12, color: "#9b7c78", background: "#f8efed", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
            🧪 Test: <strong>testuser</strong> / <strong>test123</strong>
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="input-label">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </label>
            <label className="input-label">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>
            {error && <p style={{ color: "#f44336", fontSize: 13 }}>{error}</p>}
            <button type="submit" className="btn-primary login-btn" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <button className="link-btn" onClick={openRegister}>Register here</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
