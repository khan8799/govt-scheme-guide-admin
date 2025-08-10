import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export const getCategoriesWithSchemeCount = async () => {
  return axios.get(`${API_BASE_URL}/categoriesWithSchemeCount`, {
    headers: {

    },
  });
};
