// src/api/auth.js
import api from "./client";

export async function login(email, password) {
  const response = await api.post("/api/token/", {
    email,      // IMPORTANT: must match backend expectations
    password,
  });
  return response.data; // { access, refresh }
}
