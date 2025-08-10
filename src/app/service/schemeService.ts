import axios from "axios";

const API_BASE = "https://govt-scheme-guide-api.onrender.com/api";

export const getAllSchemes = () => {
  return axios.get(`${API_BASE}/getAllSchemes`);
};

export const getCategoriesWithSchemeCount = () => {
  return axios.get(`${API_BASE}/categoriesWithSchemeCount`);
};
