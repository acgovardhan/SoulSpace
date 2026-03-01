// src/utils/getBaseUrl.js
// In development: empty string (Vite proxy handles /api → localhost:5000)
// In production:  full Render backend URL from VITE_API_URL env variable
const BASE_URL = import.meta.env.VITE_API_URL || '';
export default BASE_URL;
