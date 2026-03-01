// src/utils/api.js
// ─────────────────────────────────────────────────────────────
// Central API helper — automatically attaches Bearer token.
// Import and use instead of raw fetch() in every component.
// ─────────────────────────────────────────────────────────────

const BASE = ""; // empty = same origin (Vite proxy handles /api → backend)

const getToken = () => localStorage.getItem("token") || "";

export const api = {
  get: (path) =>
    fetch(`${BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  post: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    }),

  put: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    }),

  delete: (path) =>
    fetch(`${BASE}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }),
};
