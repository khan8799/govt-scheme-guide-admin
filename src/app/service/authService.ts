// app/service/authService.ts
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export const loginUser = async (payload: { email: string; password: string }) => {
  return axios.post(`${API_BASE_URL}/admin/loginUser`, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

export const registerUser = async (payload: { name: string; email: string; password: string; phone: string }) => {
  return axios.post(`${API_BASE_URL}/admin/registerUser`, payload, {
    headers: { "Content-Type": "application/json" },
  });
};
