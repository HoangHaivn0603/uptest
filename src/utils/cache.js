const CACHE_PREFIX = 'laf_cache_v1:';
const memoryCache = new Map();

function now() {
  return Date.now();
}

function storageKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function writeCache(key, data, ttlMs) {
  const entry = {
    data,
    updatedAt: now(),
    expiresAt: now() + ttlMs,
  };

  memoryCache.set(key, entry);

  if (!canUseLocalStorage()) return;
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    // Ignore quota / serialization errors and keep in-memory cache.
  }
}

function parseStoredEntry(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.expiresAt !== 'number' || typeof parsed.updatedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readCache(key) {
  const inMemory = memoryCache.get(key);
  if (inMemory) {
    return {
      ...inMemory,
      stale: inMemory.expiresAt <= now(),
      source: 'memory',
    };
  }

  if (!canUseLocalStorage()) return null;
  const parsed = parseStoredEntry(localStorage.getItem(storageKey(key)));
  if (!parsed) return null;

  memoryCache.set(key, parsed);
  return {
    ...parsed,
    stale: parsed.expiresAt <= now(),
    source: 'storage',
  };
}

export function clearCache(key) {
  memoryCache.delete(key);
  if (!canUseLocalStorage()) return;
  localStorage.removeItem(storageKey(key));
}
