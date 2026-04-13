import {
  getCanChiFromYear,
  getCompatibility,
  getDirections,
  getHourlyCompatibility,
  getLuckyScores,
} from '../horoscope';

describe('horoscope utils', () => {
  it('returns can chi from year', () => {
    expect(getCanChiFromYear(1990)).toEqual({
      can: 'Canh',
      chi: 'Ngọ',
      fullName: 'Canh Ngọ',
    });
    expect(getCanChiFromYear(0)).toBeNull();
  });

  it('computes compatibility for luc xung and luc hop', () => {
    expect(getCompatibility('Tý', 'Bính Ngọ')?.type).toBe('bad');
    expect(getCompatibility('Tý', 'Canh Sửu')?.type).toBe('good');
    expect(getCompatibility('', 'Canh Sửu')).toBeNull();
  });

  it('returns deterministic lucky scores for same input', () => {
    const comp = { score: 4 };
    const first = getLuckyScores('1990', '20260413', comp);
    const second = getLuckyScores('1990', '20260413', comp);

    expect(first).toEqual(second);
    expect(first.wealth).toBeGreaterThanOrEqual(1);
    expect(first.wealth).toBeLessThanOrEqual(5);
  });

  it('returns directions and hourly compatibility', () => {
    expect(getDirections('Giáp Tý')).toEqual({
      hyThan: 'Đông Bắc',
      taiThan: 'Đông Nam',
    });
    expect(getDirections('')).toBeNull();

    expect(getHourlyCompatibility('Tý', 'Sửu')).toBe('good');
    expect(getHourlyCompatibility('Tý', 'Ngọ')).toBe('bad');
    expect(getHourlyCompatibility('Tý', 'Thìn')).toBe('good');
  });
});
