const runtimeBase = (globalThis as { __API_BASE_URL?: string }).__API_BASE_URL;

const normalizedBase = (runtimeBase && runtimeBase.trim())
  ? runtimeBase.trim().replace(/\/+$/, '')
  : 'http://localhost:8000';

export const API_BASE_URL = normalizedBase;
export const API_URL = `${API_BASE_URL}/api`;
