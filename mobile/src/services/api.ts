import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const TOKEN_KEY = 'winter_arc_jwt_token';
const OFFLINE_QUEUE_KEY = 'winter_arc_offline_queue';

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export const apiRequest = async (endpoint: string, method = 'GET', body: any = null) => {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, options, 12000);
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn(`[API] Endpoint ${endpoint} failed or offline. Using local cache.`, error);

    // Queue mutations for offline sync if method is POST/PUT/DELETE
    if (method !== 'GET') {
      await saveOfflineMutation({ endpoint, method, body, timestamp: Date.now() });
    }

    return { success: false, offline: true, error: (error as Error).message };
  }
};

const saveOfflineMutation = async (mutation: any) => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push(mutation);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to save offline mutation:', err);
  }
};

export const syncOfflineData = async () => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return;
    const queue = JSON.parse(raw);
    if (!queue || queue.length === 0) return;

    console.log(`[SYNC] Processing ${queue.length} offline mutations...`);

    const remaining = [];
    for (const item of queue) {
      const res = await apiRequest(item.endpoint, item.method, item.body);
      if (!res.success && res.offline) {
        remaining.push(item);
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } catch (err) {
    console.error('Offline sync error:', err);
  }
};
