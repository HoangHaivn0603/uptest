import { CAN, CHI } from './lunar';

/**
 * Calculates Can Chi from a Gregorian year
 */
export const getCanChiFromYear = (year) => {
  if (!year || year < 1000) return null;
  // Adjusted for modulo with negative result avoidance in JS
  const canIndex = (year - 4) % 10;
  const chiIndex = (year - 4) % 12;
  
  const safeCanIndex = canIndex < 0 ? canIndex + 10 : canIndex;
  const safeChiIndex = chiIndex < 0 ? chiIndex + 12 : chiIndex;

  return {
    can: CAN[safeCanIndex],
    chi: CHI[safeChiIndex],
    fullName: `${CAN[safeCanIndex]} ${CHI[safeChiIndex]}`
  };
};

const TAM_HOP = [
  ["Tý", "Thìn", "Thân"],
  ["Sửu", "Tỵ", "Dậu"],
  ["Dần", "Ngọ", "Tuất"],
  ["Mão", "Mùi", "Hợi"]
];

const LUC_HOP = {
  "Tý": "Sửu", "Sửu": "Tý",
  "Dần": "Hợi", "Hợi": "Dần",
  "Mão": "Tuất", "Tuất": "Mão",
  "Thìn": "Dậu", "Dậu": "Thìn",
  "Tỵ": "Thân", "Thân": "Tỵ",
  "Ngọ": "Mùi", "Mùi": "Ngọ"
};

const LUC_XUNG = {
  "Tý": "Ngọ", "Ngọ": "Tý",
  "Sửu": "Mùi", "Mùi": "Sửu",
  "Dần": "Thân", "Thân": "Dần",
  "Mão": "Dậu", "Dậu": "Mão",
  "Thìn": "Tuất", "Tuất": "Thìn",
  "Tỵ": "Hợi", "Hợi": "Tỵ"
};

/**
 * Returns compatibility level between user's birth animal and day's animal
 */
export const getCompatibility = (userChi, dayChiFull) => {
  if (!userChi || !dayChiFull) return null;
  
  // Extract just the Chi from full name (e.g. "Ất Tỵ" -> "Tỵ")
  const dayChi = dayChiFull.split(' ')[1];

  if (LUC_XUNG[userChi] === dayChi) return { label: 'Lục Xung', type: 'bad', score: 1, text: 'Rất xung khắc, nên thận trọng.' };
  
  if (LUC_HOP[userChi] === dayChi) return { label: 'Lục Hợp', type: 'good', score: 5, text: 'Rất hòa hợp, gặp nhiều may mắn.' };
  
  for (const group of TAM_HOP) {
    if (group.includes(userChi) && group.includes(dayChi)) {
      return { label: 'Tam Hợp', type: 'good', score: 5, text: 'Quý nhân phù trợ, vạn sự hanh thông.' };
    }
  }
  
  // Simple elements matching (Simplified version)
  return { label: 'Bình thường', type: 'neutral', score: 3, text: 'Ngày bình ổn, không có biến động lớn.' };
};

/**
 * Generates randomized but deterministic scores based on compatibility
 */
export const getLuckyScores = (userYear, dayKey, compatibility) => {
  // Use userYear and dayKey (e.g. 11042026) as seeds for consistency
  const seed = parseInt(userYear) + parseInt(dayKey.replace(/\//g, ''));
  const pseudoRandom = (offset) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const base = compatibility?.score || 3;
  
  return {
    wealth: Math.min(5, Math.max(1, Math.floor(base + pseudoRandom(1) * 2 - 0.5))),
    love: Math.min(5, Math.max(1, Math.floor(base + pseudoRandom(2) * 2 - 0.5))),
    health: Math.min(5, Math.max(1, Math.floor(base + pseudoRandom(3) * 2 - 0.5)))
  };
};

/**
 * Calculates Hỷ Thần and Tài Thần directions based on Day Can
 */
export const getDirections = (dayCanFull) => {
  if (!dayCanFull) return null;
  const dayCan = dayCanFull.split(' ')[0];

  const hyThan = {
    'Giáp': 'Đông Bắc', 'Kỷ': 'Đông Bắc',
    'Ất': 'Tây Bắc', 'Canh': 'Tây Bắc',
    'Bính': 'Tây Nam', 'Tân': 'Tây Nam',
    'Đinh': 'Chính Nam', 'Nhâm': 'Chính Nam',
    'Mậu': 'Đông Nam', 'Quý': 'Đông Nam'
  }[dayCan] || 'Chính Nam';

  const taiThan = {
    'Giáp': 'Đông Nam', 'Ất': 'Đông Nam',
    'Bính': 'Chính Đông', 'Đinh': 'Chính Đông',
    'Canh': 'Tây Nam', 'Tân': 'Tây Nam',
    'Nhâm': 'Tây Bắc',
    'Mậu': 'Chính Bắc', 'Kỷ': 'Chính Nam', 'Quý': 'Chính Bắc'
  }[dayCan] || 'Chính Bắc';

  return { hyThan, taiThan };
};

/**
 * Checks if a specific reference Chi (e.g. Hour Chi) is compatible with User Chi
 */
export const getHourlyCompatibility = (userChi, hourChiName) => {
  if (!userChi || !hourChiName) return 'neutral';
  
  const hourChi = hourChiName; // Just the Chi part (e.g. "Tý")

  if (LUC_XUNG[userChi] === hourChi) return 'bad';
  if (LUC_HOP[userChi] === hourChi) return 'good';
  
  for (const group of TAM_HOP) {
    if (group.includes(userChi) && group.includes(hourChi)) {
      return 'good';
    }
  }
  
  return 'neutral';
};
