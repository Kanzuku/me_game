/**
 * ME — The Life Game | API Client
 * Axios instance with JWT auth, refresh logic, error handling
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Inject access token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refresh,
        });
        await SecureStore.setItemAsync('access_token', data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        // Navigate to login — handled by Zustand auth store
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// ── Profile ──────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get('/profile/'),
  upsert: (data: Record<string, unknown>) => api.put('/profile/', data),
  analyze: () => api.get('/profile/analyze'),
};

// ── Game Stats ───────────────────────────────────────────────
export const statsApi = {
  get: () => api.get('/stats/'),
  history: (days = 30) => api.get(`/stats/history?days=${days}`),
};

// ── Quests ───────────────────────────────────────────────────
export const questsApi = {
  generate: (type = 'daily', count = 3, focusArea?: string) =>
    api.post('/quests/generate', { quest_type: type, count, focus_area: focusArea }),
  active: () => api.get('/quests/active'),
  complete: (id: string) => api.post(`/quests/${id}/complete`),
  fail: (id: string) => api.post(`/quests/${id}/fail`),
};

// ── Decision Engine ──────────────────────────────────────────
export const decisionsApi = {
  simulate: (question: string, context?: Record<string, unknown>) =>
    api.post('/decisions/simulate', { question, context }),
  choose: (decisionId: string, scenarioId: string) =>
    api.post('/decisions/choose', { decision_id: decisionId, scenario_id: scenarioId }),
  history: (limit = 20) => api.get(`/decisions/history?limit=${limit}`),
};

// ── Simulation ───────────────────────────────────────────────
export const simulationApi = {
  generateFuture: () => api.post('/simulation/future'),
  getLatestFuture: () => api.get('/simulation/future/latest'),
  generateEvent: () => api.post('/simulation/event/generate'),
  chooseEventOption: (eventId: string, optionId: string) =>
    api.post(`/simulation/event/${eventId}/choose?option_id=${optionId}`),
};

export default api;
