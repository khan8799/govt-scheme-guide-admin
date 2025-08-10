// app/service/authService.ts
import axios from "axios";

const API_BASE_URL = "https://govt-scheme-guide-api.onrender.com/api";

export const loginUser = async (payload: { email: string; password: string }) => {
  return axios.post(`${API_BASE_URL}/loginUser`, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const registerUser = async (payload: { name: string; email: string; password: string; phone: string }) => {
  return axios.post(`${API_BASE_URL}/registerUser`, payload, {
    headers: { "Content-Type": "application/json" },
  });
};
