import axios from "axios";

const API_BASE = "http://localhost:5000";

const getHeaders = (token) => ({
  headers: {
    "x-auth-token": token,
  },
});

/* ================= Projects ================= */
export const getProjects = (token) => axios.get(`${API_BASE}/projects`, getHeaders(token));
export const createProject = (name, token) => axios.post(`${API_BASE}/projects`, { name }, getHeaders(token));
export const deleteProject = (id, token) => axios.delete(`${API_BASE}/projects/${id}`, getHeaders(token));

/* ================= Sessions ================= */
export const getSessions = (projectId, token) => axios.get(`${API_BASE}/sessions/project/${projectId}`, getHeaders(token));
export const createSession = (projectId, token) => axios.post(`${API_BASE}/sessions/project/${projectId}`, {}, getHeaders(token));
export const deleteSession = (sessionId, token) => axios.delete(`${API_BASE}/sessions/${sessionId}`, getHeaders(token));

/* ================= Datasets ================= */
export const getDatasets = (projectId) => axios.get(`${API_BASE}/datasets${projectId ? `?projectId=${projectId}` : ''}`);
export const getDatasetSummary = (id, token) => axios.get(`${API_BASE}/datasets/${id}/summary`, getHeaders(token));
export const getDatasetSuggestions = (id, token) => axios.get(`${API_BASE}/datasets/${id}/suggestions`, getHeaders(token));
export const uploadDataset = (formData, token) => axios.post(`${API_BASE}/upload`, formData, getHeaders(token));
export const deleteDataset = (id, token) => axios.delete(`${API_BASE}/datasets/${id}`, getHeaders(token));

/* ================= Chat ================= */
export const askQuestion = (payload, token) => axios.post(`${API_BASE}/ask`, payload, getHeaders(token));
export const getHistory = (sessionId, token) => axios.get(`${API_BASE}/history/${sessionId}`, getHeaders(token));