import axios from "axios";

const API = axios.create({
  // use environment variable for API URL
  // in development → http://localhost:3000/api
  // in production  → your render URL
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
