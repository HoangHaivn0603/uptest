import {
  deleteEvent,
  getStoredEvents,
  getSystemReminders,
  matchEvents,
  saveEvent,
} from '../events';

describe('events utils', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-id-1'),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns empty array when no local events', () => {
    expect(getStoredEvents()).toEqual([]);
  });

  it('saves a new event with id and persists it', () => {
    const result = saveEvent({
      title: 'Sinh nhat',
      type: 'solar',
      day: 13,
      month: 4,
      year: 2026,
      isYearly: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-id-1');
    expect(getStoredEvents()).toEqual(result);
  });

  it('deletes event by id', () => {
    localStorage.setItem(
      'viet-lunar-events',
      JSON.stringify([
        { id: 'a', title: 'A' },
        { id: 'b', title: 'B' },
      ]),
    );

    const result = deleteEvent('a');

    expect(result).toEqual([{ id: 'b', title: 'B' }]);
    expect(getStoredEvents()).toEqual([{ id: 'b', title: 'B' }]);
  });

  it('matches solar yearly and one-time events correctly', () => {
    const solarDate = new Date(2026, 3, 13);
    const lunarDate = { date: 16, month: 2 };
    const storedEvents = [
      { id: '1', type: 'solar', day: 13, month: 4, year: 2000, isYearly: true },
      { id: '2', type: 'solar', day: 13, month: 4, year: 2026, isYearly: false },
      { id: '3', type: 'solar', day: 13, month: 4, year: 2025, isYearly: false },
      { id: '4', type: 'solar', day: 12, month: 4, year: 2026, isYearly: true },
    ];

    const result = matchEvents(solarDate, lunarDate, storedEvents);

    expect(result.map((x) => x.id)).toEqual(['1', '2']);
  });

  it('matches lunar events by lunar day/month', () => {
    const solarDate = new Date(2026, 3, 13);
    const lunarDate = { date: 16, month: 2 };
    const storedEvents = [
      { id: '1', type: 'lunar', day: 16, month: 2, year: 2020, isYearly: true },
      { id: '2', type: 'lunar', day: 1, month: 2, year: 2020, isYearly: true },
    ];

    const result = matchEvents(solarDate, lunarDate, storedEvents);

    expect(result.map((x) => x.id)).toEqual(['1']);
  });

  it('returns reminders for lunar day 1 and 15', () => {
    expect(getSystemReminders({ date: 1 })).toEqual([
      { id: 'sys-m1', title: 'Mồng một', type: 'system' },
    ]);

    expect(getSystemReminders({ date: 15 })).toEqual([
      { id: 'sys-r15', title: 'Ngày rằm', type: 'system' },
    ]);

    expect(getSystemReminders({ date: 7 })).toEqual([]);
  });
});
