import { useState, useCallback } from 'react';
import { fetchNews, getCachedNews } from '../utils/news';

/**
 * Hook for news data management.
 */
export function useNewsData() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);
  const [newsUpdatedAt, setNewsUpdatedAt] = useState(null);
  const [isNewsCached, setIsNewsCached] = useState(false);

  const handleRefreshNews = useCallback(async () => {
    setIsRefreshingNews(true);

    // SWR: paint cached data first for faster modal open.
    const cached = getCachedNews();
    if (cached?.data?.length) {
      setNewsArticles(cached.data);
      setNewsUpdatedAt(cached.updatedAt || null);
      setIsNewsCached(true);
      setIsRefreshingNews(false);
    }

    try {
      const articles = await fetchNews();
      if (Array.isArray(articles) && articles.length > 0) {
        setNewsArticles(articles);
        setNewsUpdatedAt(Date.now());
        setIsNewsCached(false);
        return { success: true, stale: Boolean(cached?.data?.length) };
      }

      if (cached?.data?.length) {
        return { success: true, stale: true };
      }

      return { success: false, error: 'Không thể tải tin tức.' };
    } catch (error) {
      console.error('News refresh error:', error);
      if (cached?.data?.length) {
        return { success: true, stale: true };
      }
      return { success: false, error: 'Không thể tải tin tức.' };
    } finally {
      setTimeout(() => setIsRefreshingNews(false), 500);
    }
  }, []);

  return {
    newsArticles,
    isRefreshingNews,
    newsUpdatedAt,
    isNewsCached,
    handleRefreshNews,
  };
}
