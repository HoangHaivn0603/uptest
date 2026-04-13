/**
 * News Utility for LichAntiFast
 * Fetches Vietnamese news from popular sources
 */
import { fetchJson } from './apiClient';
import { readCache, writeCache } from './cache';

const RSS_SOURCES = {
  vne_home: 'https://vnexpress.net/rss/tin-moi-nhat.rss',
  vne_world: 'https://vnexpress.net/rss/the-gioi.rss',
  vne_tech: 'https://vnexpress.net/rss/so-hoa.rss',
  vne_biz: 'https://vnexpress.net/rss/kinh-doanh.rss'
};

const NEWS_CACHE_KEY = 'news:vne_home';
const NEWS_TTL_MS = 10 * 60 * 1000;

export function getCachedNews() {
  return readCache(NEWS_CACHE_KEY);
}

function mapNewsItems(items = []) {
  return items.map(item => ({
    id: item.guid || item.link,
    title: item.title,
    pubDate: item.pubDate,
    link: item.link,
    author: item.author,
    thumbnail: extractThumbnail(item.description, item.enclosure?.link),
    description: cleanDescription(item.description),
    category: item.categories?.[0] || 'Tin tức'
  }));
}

/**
 * Fetches news and converts RSS to JSON using a public API
 */
export async function fetchNews() {
  try {
    // Using rss2json.com public service (free tier, CORS friendly)
    const targetUrl = encodeURIComponent(RSS_SOURCES.vne_home);
    const data = await fetchJson(
      `https://api.rss2json.com/v1/api.json?rss_url=${targetUrl}`,
      { context: 'news', retries: 1, timeoutMs: 9000 },
    );

    if (data.status === 'ok') {
      const mapped = mapNewsItems(data.items);
      writeCache(NEWS_CACHE_KEY, mapped, NEWS_TTL_MS);
      return mapped;
    }

    const cached = getCachedNews();
    return cached?.data || [];
  } catch (error) {
    console.error('News fetch error:', error);
    const cached = getCachedNews();
    if (cached?.data?.length) return cached.data;
    return getMockNews(); // Fallback to mock data for demo
  }
}

function extractThumbnail(description, enclosure) {
  if (enclosure) return enclosure;
  // Try to find image tag in description
  const match = description.match(/src="([^"]+)"/);
  return match ? match[1] : null;
}

function cleanDescription(description) {
  // RSS descriptions often contain HTML tags (images, etc)
  return description.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Fallback static news in case of network errors
 */
function getMockNews() {
  return [
    {
      id: '1',
      title: 'Chào mừng bạn đến với mục Tin Tức của Lịch Việt Fast',
      pubDate: new Date().toISOString(),
      link: '#',
      thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop',
      description: 'Tính năng tin tức đang được hoàn thiện. Hãy quay lại sau để cập nhật những thông báo mới nhất.',
      category: 'Hệ thống'
    }
  ];
}
