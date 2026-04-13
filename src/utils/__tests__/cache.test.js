import { clearCache, readCache, writeCache } from '../cache';

describe('cache utils', () => {
  beforeEach(() => {
    localStorage.clear();
    clearCache('sample-key');
  });

  it('writes and reads fresh cache entries', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1000);
    writeCache('sample-key', { ok: true }, 5000);

    nowSpy.mockReturnValue(1200);
    const entry = readCache('sample-key');

    expect(entry).toBeTruthy();
    expect(entry.data).toEqual({ ok: true });
    expect(entry.stale).toBe(false);
    nowSpy.mockRestore();
  });

  it('marks cache as stale after ttl expires', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1000);
    writeCache('sample-key', { ok: true }, 100);

    nowSpy.mockReturnValue(1201);
    const entry = readCache('sample-key');

    expect(entry).toBeTruthy();
    expect(entry.stale).toBe(true);
    nowSpy.mockRestore();
  });
});
