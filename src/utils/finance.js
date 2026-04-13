/**
 * Finance Utility for LichAntiFast
 * Fetches real gold prices and exchange rates with fallback to simulated data.
 */
import { readCache, writeCache } from './cache';

const GOLD_CACHE_KEY = 'finance:gold';
const GOLD_HISTORY_CACHE_KEY = 'finance:gold_history';
const RATES_CACHE_KEY = 'finance:rates';
const FINANCE_TTL_MS = 10 * 60 * 1000;

export const getCachedGoldPrices = () => readCache(GOLD_CACHE_KEY);
export const getCachedGoldHistory = () => readCache(GOLD_HISTORY_CACHE_KEY);
export const getCachedExchangeRates = () => readCache(RATES_CACHE_KEY);

// ============= GOLD PRICES =============

const FALLBACK_GOLD = [
  { name: 'SJC 9999', buy: '---', sell: '---', trend: 'stable' },
  { name: 'DOJI HN', buy: '---', sell: '---', trend: 'stable' },
  { name: 'DOJI HCM', buy: '---', sell: '---', trend: 'stable' },
  { name: 'PNJ Hà Nội', buy: '---', sell: '---', trend: 'stable' },
  { name: 'Bao Tín SJC', buy: '---', sell: '---', trend: 'stable' },
  { name: 'Thế giới (XAU)', buy: '---', sell: '---', trend: 'stable' },
];

// Preferred display order and Vietnamese labels for vang.today keys
const VANG_TODAY_MAP = {
  'SJL1L10':   { label: 'SJC 9999' },
  'DOHNL':     { label: 'DOJI Hà Nội' },
  'DOHCML':    { label: 'DOJI TP.HCM' },
  'PQHNVM':    { label: 'PNJ Hà Nội' },
  'BTSJC':     { label: 'Bảo Tín SJC' },
  'BT9999NTT': { label: 'Bảo Tín 9999' },
  'PQHN24NTT': { label: 'PNJ 24K' },
  'XAUUSD':    { label: 'Thế giới XAU/USD' },
};

/**
 * Fetches real gold prices from vang.today (free, no API key).
 * Falls back to BTMC API if the primary source fails.
 * Returns: { data: [...], isLive: boolean }
 */
export const getGoldPrices = async () => {
  try {
    const response = await fetch('https://www.vang.today/api/prices', {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('vang.today unavailable');
    const json = await response.json();

    if (json?.success && json.prices) {
      const mapped = [];
      // Use preferred order first, then remaining
      const orderedKeys = Object.keys(VANG_TODAY_MAP);
      for (const key of orderedKeys) {
        const item = json.prices[key];
        if (!item) continue;
        const isUSD = item.currency === 'USD';
        mapped.push({
          name: VANG_TODAY_MAP[key].label,
          buy: isUSD ? `$${Number(item.buy).toLocaleString('en-US')}` : formatGoldVND(item.buy),
          sell: isUSD
            ? (item.sell ? `$${Number(item.sell).toLocaleString('en-US')}` : '---')
            : formatGoldVND(item.sell),
          trend: determineTrendFromChange(item.change_buy),
        });
      }
      if (mapped.length > 0) {
        writeCache(GOLD_CACHE_KEY, mapped, FINANCE_TTL_MS);
        return { data: mapped, isLive: true };
      }
    }
    throw new Error('Invalid vang.today format');
  } catch (e1) {
    // Fallback: BTMC API (Bảo Tín Minh Châu)
    try {
      const response = await fetch(
        'http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45ez6v7',
        { signal: AbortSignal.timeout(8000) },
      );
      if (!response.ok) throw new Error('BTMC API unavailable');
      const json = await response.json();
      const prices = parseBTMCData(json);
      if (prices.length > 0) {
        writeCache(GOLD_CACHE_KEY, prices, FINANCE_TTL_MS);
        return { data: prices, isLive: true };
      }
      throw new Error('Could not parse BTMC data');
    } catch (e2) {
      console.warn('Gold prices: All sources failed, using fallback.', e1.message, e2.message);
      return { data: FALLBACK_GOLD, isLive: false };
    }
  }
};

/**
 * Fetches 7-day history for top gold brands.
 */
export const getGoldHistory = async (days = 7) => {
  const topBrands = ['SJL1L10', 'DOHNL', 'PQHNVM', 'BTSJC'];
  const historyData = {};

  try {
    await Promise.all(
      topBrands.map(async (type) => {
        try {
          const res = await fetch(`https://www.vang.today/api/prices?type=${type}&days=${days}`, {
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.history)) {
              // Extract just the buy prices for the sparkline
              historyData[type] = json.history.map((h) => Number(h.buy)).reverse();
            }
          }
        } catch (e) {
          console.warn(`History fetch failed for ${type}`, e.message);
        }
      })
    );

    if (Object.keys(historyData).length > 0) {
      writeCache(GOLD_HISTORY_CACHE_KEY, historyData, 60 * 60 * 1000); // Cache for 1 hour
      return { data: historyData, isLive: true };
    }
    return { data: {}, isLive: false };
  } catch (err) {
    return { data: {}, isLive: false };
  }
};

/**
 * Parse gold rows from the BTMC API response.
 * Gold items have `@k_N` === '24k' and `@h_N` containing '999'.
 * The format uses numbered keys like @n_670, @pb_670, @ps_670.
 */
function parseBTMCData(json) {
  try {
    const dataList = json?.DataList?.Data;
    if (!Array.isArray(dataList)) return [];

    const goldItems = [];
    for (const item of dataList) {
      const row = item['@row'];
      const name = item[`@n_${row}`];
      const karat = item[`@k_${row}`];
      const buy = item[`@pb_${row}`];
      const sell = item[`@ps_${row}`];
      // Only gold (24k) items, skip silver (BẠC)
      if (karat === '24k' && name && buy) {
        goldItems.push({
          name: shortenBTMCName(name),
          buy: formatGoldVND(buy),
          sell: sell && sell !== '0' ? formatGoldVND(sell) : '---',
          trend: 'stable',
        });
      }
    }
    // Deduplicate by name (BTMC repeats rows with timestamps)
    const seen = new Set();
    return goldItems.filter((g) => {
      if (seen.has(g.name)) return false;
      seen.add(g.name);
      return true;
    }).slice(0, 8);
  } catch {
    return [];
  }
}

function shortenBTMCName(raw) {
  // e.g. "VÀNG MIẾNG SJC (Vàng SJC)" → "Vàng SJC"
  const match = raw.match(/\(([^)]+)\)/);
  if (match) return match[1];
  return raw.length > 30 ? raw.substring(0, 28) + '…' : raw;
}

/** Format raw VND value (e.g. 16850000) to "16.850" (unit: nghìn đồng/lượng) */
function formatGoldVND(value) {
  if (!value) return '---';
  const num = parseInt(String(value).replace(/[,.]/g, ''), 10);
  if (isNaN(num)) return String(value);
  // Gold prices already in VND per lượng, display in nghìn đồng
  return (num / 1000).toLocaleString('vi-VN');
}

function determineTrendFromChange(change) {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'stable';
}


// ============= EXCHANGE RATES =============

const CURRENCY_META = {
  'USD': { name: 'Đô la Mỹ', flag: '🇺🇸' },
  'EUR': { name: 'Euro', flag: '🇪🇺' },
  'JPY': { name: 'Yên Nhật', flag: '🇯🇵' },
  'GBP': { name: 'Bảng Anh', flag: '🇬🇧' },
  'CNY': { name: 'Nhân dân tệ', flag: '🇨🇳' },
  'KRW': { name: 'Won Hàn Quốc', flag: '🇰🇷' },
  'AUD': { name: 'Đô la Úc', flag: '🇦🇺' },
  'SGD': { name: 'Đô la Sing', flag: '🇸🇬' },
  'THB': { name: 'Baht Thái', flag: '🇹🇭' },
};

const FALLBACK_RATES = [
  { code: 'USD', name: 'Đô la Mỹ', buy: '---', sell: '---', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', buy: '---', sell: '---', flag: '🇪🇺' },
  { code: 'JPY', name: 'Yên Nhật', buy: '---', sell: '---', flag: '🇯🇵' },
  { code: 'GBP', name: 'Bảng Anh', buy: '---', sell: '---', flag: '🇬🇧' },
  { code: 'CNY', name: 'Nhân dân tệ', buy: '---', sell: '---', flag: '🇨🇳' },
  { code: 'KRW', name: 'Won Hàn Quốc', buy: '---', sell: '---', flag: '🇰🇷' },
];

/**
 * Fetches exchange rates from Open Exchange Rates API (free).
 * Returns: { data: [...], isLive: boolean }
 */
export const getExchangeRates = async () => {
  try {
    // Free API - no key required, base USD
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('Exchange rate API unavailable');
    const data = await response.json();
    
    if (data.result === 'success' && data.rates?.VND) {
      const vndRate = data.rates.VND;
      const targetCodes = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'KRW', 'AUD', 'SGD', 'THB'];
      
      const rates = targetCodes
        .filter(code => data.rates[code])
        .map(code => {
          const meta = CURRENCY_META[code] || { name: code, flag: '🏳️' };
          // Calculate VND per 1 unit of foreign currency
          const ratePerUnit = vndRate / data.rates[code];
          // Approximate buy/sell spread (typical 0.5-1% spread)
          const buy = ratePerUnit * 0.995;
          const sell = ratePerUnit * 1.005;
          
          return {
            code,
            name: meta.name,
            flag: meta.flag,
            buy: formatRate(buy, code),
            sell: formatRate(sell, code),
          };
        });
      writeCache(RATES_CACHE_KEY, rates, FINANCE_TTL_MS);
      return { data: rates, isLive: true };
    }
    throw new Error('Invalid exchange rate data');
  } catch (error) {
    console.warn('Exchange rates: API failed, using fallback.', error.message);
    return { data: FALLBACK_RATES, isLive: false };
  }
};

function formatRate(value, code) {
  if (['JPY', 'KRW'].includes(code)) {
    // These are low-value currencies, show per 100 units
    return (value / 100).toFixed(2);
  }
  return Math.round(value).toLocaleString('vi-VN');
}


// ============= BANK INTEREST RATES =============

const BANK_RATES_CACHE_KEY = 'finance:bankRates';

export const getCachedBankRates = () => readCache(BANK_RATES_CACHE_KEY);

/**
 * Reference interest rates from major Vietnamese banks.
 * Updated periodically — rates are for savings deposits (tiền gửi tiết kiệm).
 * Unit: %/năm (annual percentage)
 */
const BANK_INTEREST_DATA = [
  {
    bank: 'Vietcombank',
    short: 'VCB',
    logo: '🏦',
    color: '#00703c',
    rates: { '1m': 1.6, '3m': 2.0, '6m': 3.0, '12m': 4.7, '24m': 4.7 },
  },
  {
    bank: 'BIDV',
    short: 'BIDV',
    logo: '🏛️',
    color: '#0066b3',
    rates: { '1m': 1.6, '3m': 2.0, '6m': 3.0, '12m': 4.7, '24m': 4.7 },
  },
  {
    bank: 'Agribank',
    short: 'AGR',
    logo: '🌾',
    color: '#e30613',
    rates: { '1m': 1.6, '3m': 2.0, '6m': 3.0, '12m': 4.7, '24m': 4.7 },
  },
  {
    bank: 'Techcombank',
    short: 'TCB',
    logo: '💳',
    color: '#ed1c24',
    rates: { '1m': 2.85, '3m': 3.15, '6m': 4.35, '12m': 4.85, '24m': 5.0 },
  },
  {
    bank: 'MB Bank',
    short: 'MBB',
    logo: '🔵',
    color: '#1e3a8a',
    rates: { '1m': 2.89, '3m': 3.19, '6m': 4.39, '12m': 4.99, '24m': 4.99 },
  },
  {
    bank: 'VPBank',
    short: 'VPB',
    logo: '🟢',
    color: '#00a650',
    rates: { '1m': 2.9, '3m': 3.2, '6m': 4.4, '12m': 5.0, '24m': 5.3 },
  },
  {
    bank: 'TPBank',
    short: 'TPB',
    logo: '🟣',
    color: '#7b2d8e',
    rates: { '1m': 2.9, '3m': 3.4, '6m': 4.6, '12m': 5.2, '24m': 5.4 },
  },
  {
    bank: 'Sacombank',
    short: 'STB',
    logo: '🔷',
    color: '#003399',
    rates: { '1m': 2.7, '3m': 3.1, '6m': 4.3, '12m': 5.0, '24m': 5.3 },
  },
];

/**
 * Returns bank interest rates.
 * Currently uses reference data. Can be upgraded to fetch from bank APIs later.
 * Returns: { data: [...], isLive: boolean }
 */
export const getBankInterestRates = async () => {
  try {
    // Mark as reference (not live from API) since no free public API exists
    const data = BANK_INTEREST_DATA.map((b) => ({ ...b }));
    writeCache(BANK_RATES_CACHE_KEY, data, FINANCE_TTL_MS);
    return { data, isLive: false };
  } catch {
    return { data: BANK_INTEREST_DATA, isLive: false };
  }
};
