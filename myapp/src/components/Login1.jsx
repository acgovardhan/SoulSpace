import React, { useState } from "react";

const Login = ({ onClose, openRegister }) => {
  const [creds, setCreds] = useState({ username: "", password: "" });

  const handleChange = (e) => setCreds((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy login
    console.log("Login attempt:", creds);
    alert("Logged in (dummy)");
    onClose();
  };

  return (
    <div className="auth-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-card login-card" role="dialog" aria-modal="true">
        <div className="auth-close">
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="login-inner">
          <h2>Sign In</h2>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="input-label">
              <input
                name="username"
                value={creds.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />
            </label>

            <label className="input-label">
              <input
                name="password"
                type="password"
                value={creds.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </label>

            <button type="submit" className="btn-primary login-btn">
              Login
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account?{" "}
            <button className="link-btn" onClick={openRegister}>
              Register and Create.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
