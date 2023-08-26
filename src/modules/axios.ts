import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_VERCEL_API_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});
