// Tiny axios instance to talk to Django API
import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  writeCredentials: false,
});

// Helper to set/remove Authorization header globally
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
