// src/axiosInstance.js
import axios from 'axios';
import { getToken } from './keycloakService'; // Importo token-in nga Keycloak

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5050', 
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getToken(); // Merr token-in e Keycloak
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Dërgo token-in në header-in Authorization
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
