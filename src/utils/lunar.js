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

export const CHI_HOURS = [
  { name: 'Tý', range: '23h - 01h', start: 23, end: 1 },
  { name: 'Sửu', range: '01h - 03h', start: 1, end: 3 },
  { name: 'Dần', range: '03h - 05h', start: 3, end: 5 },
  { name: 'Mão', range: '05h - 07h', start: 5, end: 7 },
  { name: 'Thìn', range: '07h - 09h', start: 7, end: 9 },
  { name: 'Tỵ', range: '09h - 11h', start: 9, end: 11 },
  { name: 'Ngọ', range: '11h - 13h', start: 11, end: 13 },
  { name: 'Mùi', range: '13h - 15h', start: 13, end: 15 },
  { name: 'Thân', range: '15h - 17h', start: 15, end: 17 },
  { name: 'Dậu', range: '17h - 19h', start: 17, end: 19 },
  { name: 'Tuất', range: '19h - 21h', start: 19, end: 21 },
  { name: 'Hợi', range: '21h - 23h', start: 21, end: 23 }
];

/**
 * Lấy danh sách 12 giờ kèm theo Tiết (Hoàng Đạo/Hắc Đạo)
 */
export function get12HoursDetails(date) {
  const ld = new LunarDate(date);
  const lucky = ld.luckyHours || [];
  
  return CHI_HOURS.map(hour => ({
    ...hour,
    isLucky: lucky.includes(hour.name)
  }));
}

/**
 * Xác định giờ Can Chi hiện tại
 */
export function getCurrentCanChiHour(date = new Date()) {
  const h = date.getHours();
  // Giờ Tý bắt đầu từ 23h ngày hôm trước đến 1h sáng ngày hôm sau
  if (h >= 23 || h < 1) return CHI_HOURS[0];
  return CHI_HOURS.find(hour => h >= hour.start && h < hour.end) || CHI_HOURS[0];
}

