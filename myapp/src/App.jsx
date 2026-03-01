import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";

const App = () => {
  // user: null = logged out, object = logged in
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  return user ? (
    <Home user={user} onLogout={handleLogout} />
  ) : (
    <Dashboard onLogin={handleLogin} />
  );
};

export default App;
