// src/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Login endpoint
export async function login(email, password) {
//   const response = await fetch(`${API_URL}/auth/login`, {
const response = await fetch(`http://localhost:3000/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return await response.json();
}

// Example: fetch notes for logged-in user
export async function getNotes(token) {
//   const response = await fetch(`${API_URL}/notes`, {
const response = await fetch(`http://localhost:3000/api/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
}
