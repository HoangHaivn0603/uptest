const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_RETRIES = 1;
const DEFAULT_BACKOFF_MS = 350;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function toApiError(error, context) {
  if (error?.name === 'AbortError') {
    return new Error(`Request timeout: ${context}`);
  }
  if (error instanceof Error) {
    return error;
  }
  return new Error(`Request failed: ${context}`);
}

export async function fetchJson(url, options = {}) {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
    backoffMs = DEFAULT_BACKOFF_MS,
    fetchOptions = {},
    context = url,
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${context}`);
      }

      const json = await response.json();
      clearTimeout(timeoutId);
      return json;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = toApiError(error, context);

      if (attempt < retries) {
        await sleep(backoffMs * (attempt + 1));
      }
    }
  }

  throw lastError || new Error(`Request failed: ${context}`);
}
