import { LunarDate, SolarDate, Calendar as LunarCalendar } from 'vietnamese-lunar-calendar';
import { convertLunar2Solar } from 'vietnamese-lunar-calendar/build/solar-lunar/convert-solar';
import { getLocalTimezone } from 'vietnamese-lunar-calendar/build/solar-lunar/utils';

export const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/**
 * Lấy thông tin chi tiết một ngày
 */
export function getDayDetails(date) {
  const ld = new LunarDate(date);
  const sd = new SolarDate(date);

  return {
    solar: {
      date: sd.date,
      month: sd.month,
      year: sd.year,
      dayOfWeek: date.getDay(), // 0: CN, 1: T2...
    },
    lunar: {
      date: ld.date,
      month: ld.month,
      year: ld.year,
      isLeap: ld.isLeap,
      canChiYear: ld.getLunarYear(),
      canChiMonth: ld.getLunarMonth(),
      canChiDay: ld.getLunarDate(),
      canChiHour: ld.lunarHour.can + ' ' + ld.lunarHour.chi,
    },
    luckyHours: ld.luckyHours,
    solarTerm: ld.solarTerm,
    holiday: ld.holiday,
    isVegetarian: ld.isVegetarianDay,
    // Trực: Cần tính thêm hoặc lấy từ lib nếu có
    truc: getTruc(ld.month, ld.date, ld.year, date),
  };
}

/**
 * Lấy danh sách các ngày trong tháng (để vẽ grid)
 */
export function getMonthDays(year, month) {
  const cal = new LunarCalendar(year, month);
  return cal.weeks.flat().map((day) => ({
    date: new Date(day.solar.year, day.solar.month - 1, day.solar.date),
    isCurrentMonth: day.solar.month === month,
    isToday: day.isToday,
    lunar: {
      date: day.lunar.date,
      month: day.lunar.month,
      isLeap: day.lunar.isLeap,
      holiday: day.lunar.holiday,
    },
  }));
}

/**
 * Tính Trực (Thập Nhị Trực)
 * Dựa trên tháng tiết khí và địa chi ngày
 */
export function getTruc(lunarMonth, lunarDay, lunarYear, jsDate) {
  const TRUC = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'];
  // Một cách tính đơn giản (có thể cần refine theo tiết khí chính xác)
  // Trực Kiến là ngày có Chi trùng với Chi của tháng.
  // Tháng 1 (Dần), 2 (Mão), ... 11 (Tý), 12 (Sửu)
  const monthChiIndex = (lunarMonth + 1) % 12; // 1 -> index 2 (Dần)

  const ld = new LunarDate(jsDate);
  const dayChi = ld.lunarDate.chi;
  const dayChiIndex = CHI.indexOf(dayChi);

  const trucIndex = (dayChiIndex - monthChiIndex + 12) % 12;
  return TRUC[trucIndex];
}

export function isAuspiciousTruc(truc) {
  const GOOD_TRUC = ['Kiến', 'Mãn', 'Bình', 'Định', 'Thành', 'Khai'];
  return GOOD_TRUC.includes(truc);
}

/**
 * Chuyển đổi Âm lịch sang Dương lịch
 */
export function lunarToSolar(d, m, y, isLeap = false) {
  if (isNaN(d) || isNaN(m) || isNaN(y) || d === '' || m === '' || y === '') return null;
  try {
    const result = convertLunar2Solar(parseInt(d), parseInt(m), parseInt(y), isLeap ? 1 : 0, getLocalTimezone());
    if (!result || isNaN(result.getTime())) return null;
    return result; // result is already a Date object from the library
  } catch {
    return null;
  }
}

/**
 * Chuyển đổi Dương lịch sang Âm lịch (Gọn nhẹ cho Converter)
 */
export function solarToLunar(d, m, y) {
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  try {
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return null;
    const ld = new LunarDate(date);
    return {
      d: ld.date,
      m: ld.month,
      y: ld.year,
      isLeap: ld.isLeap,
      canChiDay: ld.getLunarDate(),
      canChiMonth: ld.getLunarMonth(),
      canChiYear: ld.getLunarYear(),
    };
  } catch {
    return null;
  }
}
