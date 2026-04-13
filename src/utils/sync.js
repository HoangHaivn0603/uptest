import { fetchJson } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USER_SYNC_PREFIX = 'laf_user_sync_v1:';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function localKey(userId) {
  return `${USER_SYNC_PREFIX}${userId}`;
}

function readLocalSync(userId) {
  if (!userId || !canUseLocalStorage()) return {};
  try {
    const raw = localStorage.getItem(localKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalSync(userId, patch) {
  if (!userId || !canUseLocalStorage()) return;
  const current = readLocalSync(userId);
  localStorage.setItem(localKey(userId), JSON.stringify({ ...current, ...patch }));
}

function canUseRemoteSync(accessToken) {
  return Boolean(API_BASE_URL && accessToken && !String(accessToken).startsWith('mock.'));
}

function authHeaders(accessToken) {
  if (!accessToken) return {};
  return { Authorization: `Bearer ${accessToken}` };
}

export async function pullUserData({ userId, accessToken }) {
  if (!userId) return { events: null, settings: null, source: 'none' };

  if (canUseRemoteSync(accessToken)) {
    try {
      const data = await fetchJson(`${API_BASE_URL}/sync/bootstrap`, {
        context: 'sync-bootstrap',
        fetchOptions: {
          method: 'GET',
          headers: {
            ...authHeaders(accessToken),
          },
        },
        retries: 0,
        timeoutMs: 9000,
      });

      return {
        events: Array.isArray(data?.events) ? data.events : null,
        settings: data?.settings && typeof data.settings === 'object' ? data.settings : null,
        source: 'remote',
      };
    } catch {
      // fall through to local-scoped sync
    }
  }

  const local = readLocalSync(userId);
  return {
    events: Array.isArray(local.events) ? local.events : null,
    settings: local.settings && typeof local.settings === 'object' ? local.settings : null,
    source: 'local',
  };
}

export async function pushUserEvents({ userId, accessToken, events }) {
  if (!userId || !Array.isArray(events)) return;

  writeLocalSync(userId, { events, updatedAt: Date.now() });

  if (!canUseRemoteSync(accessToken)) return;
  try {
    await fetchJson(`${API_BASE_URL}/sync/events`, {
      context: 'sync-events',
      fetchOptions: {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(accessToken),
        },
        body: JSON.stringify({ events }),
      },
      retries: 0,
      timeoutMs: 9000,
    });
  } catch {
    // keep local-scoped sync as fallback
  }
}

export async function pushUserSettings({ userId, accessToken, settings }) {
  if (!userId || !settings || typeof settings !== 'object') return;

  writeLocalSync(userId, { settings, updatedAt: Date.now() });

  if (!canUseRemoteSync(accessToken)) return;
  try {
    await fetchJson(`${API_BASE_URL}/sync/settings`, {
      context: 'sync-settings',
      fetchOptions: {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(accessToken),
        },
        body: JSON.stringify({ settings }),
      },
      retries: 0,
      timeoutMs: 9000,
    });
  } catch {
    // keep local-scoped sync as fallback
  }
}

