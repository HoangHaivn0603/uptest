import { fetchJson } from './apiClient';

const AUTH_SESSION_KEY = 'calendar_auth_session_v1';
const MOCK_USERS_KEY = 'mock_users_v2';
const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || 'auto'; // auto | api | mock
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJsonStorage(key, fallback) {
  if (!canUseLocalStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function removeStorage(key) {
  if (!canUseLocalStorage()) return;
  localStorage.removeItem(key);
}

function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id || raw.userId || raw.email,
    email: raw.email || '',
    name: raw.name || '',
    phone: raw.phone || '',
  };
}

function normalizeSession(payload) {
  const user = normalizeUser(payload?.user);
  if (!user) return null;
  return {
    user,
    accessToken: payload?.accessToken || null,
    refreshToken: payload?.refreshToken || null,
    expiresAt: payload?.expiresAt || null,
    authProvider: payload?.authProvider || 'api',
  };
}

function hasBackendConfigured() {
  return Boolean(API_BASE_URL);
}

function shouldUseApiFirst() {
  if (AUTH_MODE === 'api') return true;
  if (AUTH_MODE === 'mock') return false;
  return hasBackendConfigured();
}

function isApiStrictMode() {
  return AUTH_MODE === 'api';
}

function authHeaders(accessToken) {
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex;
}

function randomToken() {
  if (crypto?.randomUUID) return `mock.${crypto.randomUUID()}`;
  return `mock.${Math.random().toString(36).slice(2)}`;
}

async function apiLogin(email, password) {
  const data = await fetchJson(`${API_BASE_URL}/auth/login`, {
    context: 'auth-login',
    fetchOptions: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    timeoutMs: 10000,
  });

  const session = normalizeSession({
    ...data,
    authProvider: 'api',
  });
  if (!session) {
    throw new Error('Invalid login response');
  }
  return session;
}

async function apiRegister(email, name, phone, password) {
  const data = await fetchJson(`${API_BASE_URL}/auth/register`, {
    context: 'auth-register',
    fetchOptions: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, phone, password }),
    },
    timeoutMs: 10000,
  });

  const session = normalizeSession({
    ...data,
    authProvider: 'api',
  });
  if (!session) {
    throw new Error('Invalid register response');
  }
  return session;
}

async function apiLogout(accessToken) {
  if (!accessToken || !hasBackendConfigured()) return;
  try {
    await fetchJson(`${API_BASE_URL}/auth/logout`, {
      context: 'auth-logout',
      fetchOptions: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(accessToken),
        },
      },
      retries: 0,
      timeoutMs: 6000,
    });
  } catch {
    // Best-effort logout.
  }
}

async function mockLogin(email, password) {
  const users = readJsonStorage(MOCK_USERS_KEY, []);
  const passwordHash = await hashPassword(password);
  const foundUser = users.find((u) => u.email === email && u.passwordHash === passwordHash);
  if (!foundUser) {
    return { ok: false, message: 'Email hoặc mật khẩu không chính xác.' };
  }

  return {
    ok: true,
    session: {
      user: normalizeUser(foundUser),
      accessToken: randomToken(),
      refreshToken: null,
      expiresAt: null,
      authProvider: 'mock',
    },
  };
}

async function mockRegister(email, name, phone, password) {
  const users = readJsonStorage(MOCK_USERS_KEY, []);
  if (users.find((u) => u.email === email)) {
    return { ok: false, message: 'Email này đã được sử dụng.' };
  }

  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    email,
    name,
    phone,
    passwordHash: await hashPassword(password),
  };

  users.push(user);
  writeJsonStorage(MOCK_USERS_KEY, users);

  return {
    ok: true,
    session: {
      user: normalizeUser(user),
      accessToken: randomToken(),
      refreshToken: null,
      expiresAt: null,
      authProvider: 'mock',
    },
  };
}

export function loadStoredSession() {
  return readJsonStorage(AUTH_SESSION_KEY, null);
}

export function persistSession(session) {
  if (!session) {
    removeStorage(AUTH_SESSION_KEY);
    return;
  }
  writeJsonStorage(AUTH_SESSION_KEY, session);
}

export async function loginUser(email, password) {
  if (shouldUseApiFirst()) {
    try {
      const session = await apiLogin(email, password);
      return { success: true, session };
    } catch (error) {
      if (isApiStrictMode()) {
        return { success: false, message: error.message || 'Đăng nhập thất bại.' };
      }
    }
  }

  const mock = await mockLogin(email, password);
  if (!mock.ok) return { success: false, message: mock.message };
  return { success: true, session: mock.session };
}

export async function registerUser(email, name, phone, password) {
  if (shouldUseApiFirst()) {
    try {
      const session = await apiRegister(email, name, phone, password);
      return { success: true, session };
    } catch (error) {
      if (isApiStrictMode()) {
        return { success: false, message: error.message || 'Đăng ký thất bại.' };
      }
    }
  }

  const mock = await mockRegister(email, name, phone, password);
  if (!mock.ok) return { success: false, message: mock.message };
  return { success: true, session: mock.session };
}

export async function logoutUser(session) {
  await apiLogout(session?.accessToken);
  persistSession(null);
}

