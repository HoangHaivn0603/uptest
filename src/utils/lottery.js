/**
 * Utility for fetching and processing Northern Vietnam Lottery (XSMB) results.
 */
import { readCache, writeCache } from './cache';

const LOTTERY_CACHE_KEY = 'lottery:xsmb';
const LOTTERY_TTL_MS = 30 * 60 * 1000;

export const getCachedLotteryResults = () => readCache(LOTTERY_CACHE_KEY);

export async function fetchLotteryResults() {
  try {
    const response = await fetch('https://api-xsmb-today.onrender.com/api/v1');
    if (!response.ok) throw new Error('Failed to fetch lottery data');
    const data = await response.json();
    
    // Process head-tail statistics
    const stats = calculateHeadTailStats(data.results);
    
    const payload = {
      ...data,
      stats
    };
    writeCache(LOTTERY_CACHE_KEY, payload, LOTTERY_TTL_MS);
    return payload;
  } catch (error) {
    console.error('Error fetching lottery results:', error);
    return null;
  }
}

function calculateHeadTailStats(results) {
  const allNumbers = Object.values(results).flat();
  const heads = Array.from({ length: 10 }, () => []);
  const tails = Array.from({ length: 10 }, () => []);

  allNumbers.forEach(num => {
    if (!num) return;
    const lastTwo = num.slice(-2);
    if (lastTwo.length < 2) return;
    
    const head = parseInt(lastTwo[0]);
    const tail = parseInt(lastTwo[1]);
    
    heads[head].push(tail);
    tails[tail].push(head);
  });

  // Sort the suffixes/prefixes for better display
  heads.forEach(h => h.sort((a, b) => a - b));
  tails.forEach(t => t.sort((a, b) => a - b));

  return { heads, tails };
}
