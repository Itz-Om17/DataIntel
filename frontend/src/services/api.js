import axios from "axios";

const API_BASE = "http://localhost:5000";

export const uploadDataset = (formData) =>
  axios.post(`${API_BASE}/upload`, formData);

export const askQuestion = (payload) =>
  axios.post(`${API_BASE}/ask`, payload);

export const getDatasets = () =>
  axios.get(`${API_BASE}/datasets`);