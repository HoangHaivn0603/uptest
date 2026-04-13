import { differenceInDays, startOfDay } from 'date-fns';
import { convertLunar2Solar } from 'vietnamese-lunar-calendar/build/solar-lunar/convert-solar';
import { getLocalTimezone } from 'vietnamese-lunar-calendar/build/solar-lunar/utils';

export const HOLIDAYS = [
  // Solar
  { name: 'Tết Dương Lịch', type: 'solar', day: 1, month: 1 },
  { name: 'Giải phóng Miền Nam', type: 'solar', day: 30, month: 4 },
  { name: 'Quốc tế Lao động', type: 'solar', day: 1, month: 5 },
  { name: 'Quốc khánh', type: 'solar', day: 2, month: 9 },
  { name: 'Ngày Phụ nữ VN', type: 'solar', day: 20, month: 10 },
  { name: 'Nhà giáo Việt Nam', type: 'solar', day: 20, month: 11 },
  { name: 'Giáng sinh', type: 'solar', day: 25, month: 12 },
  
  // Lunar
  { name: 'Tết Nguyên Đán', type: 'lunar', day: 1, month: 1 },
  { name: 'Rằm tháng Giêng', type: 'lunar', day: 15, month: 1 },
  { name: 'Giỗ tổ Hùng Vương', type: 'lunar', day: 10, month: 3 },
  { name: 'Tết Đoan Ngọ', type: 'lunar', day: 5, month: 5 },
  { name: 'Lễ Vu Lan', type: 'lunar', day: 15, month: 7 },
  { name: 'Tết Trung Thu', type: 'lunar', day: 15, month: 8 },
  { name: 'Tết Ông Táo', type: 'lunar', day: 23, month: 12 },
];

/**
 * Calculates the next upcoming holiday from the current date.
 */
export function getNextHoliday(currentDate = new Date()) {
  const currentYear = currentDate.getFullYear();
  const timezone = getLocalTimezone();
  const occurrences = [];

  const today = startOfDay(currentDate);

  HOLIDAYS.forEach(h => {
    let solarDate;
    if (h.type === 'solar') {
      solarDate = new Date(currentYear, h.month - 1, h.day);
      if (solarDate < today) {
        solarDate = new Date(currentYear + 1, h.month - 1, h.day);
      }
    } else {
      // Lunar to Solar for current year
      const result = convertLunar2Solar(h.day, h.month, currentYear, 0, timezone);
      solarDate = new Date(result[2], result[1] - 1, result[0]);
      
      if (solarDate < today) {
        // Lunar to Solar for next year
        const result2 = convertLunar2Solar(h.day, h.month, currentYear + 1, 0, timezone);
        solarDate = new Date(result2[2], result2[1] - 1, result2[0]);
      }
    }
    
    occurrences.push({ 
      ...h, 
      date: solarDate, 
      daysLeft: differenceInDays(solarDate, today) 
    });
  });

  // Filter out holidays that are today or in the future, then sort by proximity
  const futureHolidays = occurrences
    .filter(h => h.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return futureHolidays[0];
}
