/**
 * Weather & Air Quality Utility using Open-Meteo APIs
 */
import { fetchJson } from './apiClient';
import { readCache, writeCache } from './cache';

const WEATHER_TTL_MS = 10 * 60 * 1000;
const AIR_QUALITY_TTL_MS = 5 * 60 * 1000;

function coordKey(lat, lon) {
  return `${Number(lat).toFixed(3)}:${Number(lon).toFixed(3)}`;
}

function weatherCacheKey(lat, lon) {
  return `weather:${coordKey(lat, lon)}`;
}

function airQualityCacheKey(lat, lon) {
  return `airq:${coordKey(lat, lon)}`;
}

export const getCachedWeather = (lat, lon) => readCache(weatherCacheKey(lat, lon));
export const getCachedAirQuality = (lat, lon) => readCache(airQualityCacheKey(lat, lon));

export const fetchWeather = async (lat, lon) => {
  try {
    // Current + Daily Forecast (3 days)
    const data = await fetchJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto&forecast_days=3`,
      { context: 'weather', retries: 1, timeoutMs: 8000 },
    );
    writeCache(weatherCacheKey(lat, lon), data, WEATHER_TTL_MS);
    return data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
};

export const fetchAirQuality = async (lat, lon) => {
  try {
    const data = await fetchJson(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`,
      { context: 'air-quality', retries: 1, timeoutMs: 8000 },
    );
    const current = data.current || null;
    if (current) writeCache(airQualityCacheKey(lat, lon), current, AIR_QUALITY_TTL_MS);
    return current;
  } catch (error) {
    console.error('AQI fetch error:', error);
    return null;
  }
};

export const getAQIStatus = (aqi) => {
  if (aqi <= 50) return { label: 'Tốt', color: 'text-green-500', bg: 'bg-green-500' };
  if (aqi <= 100) return { label: 'Trung bình', color: 'text-yellow-500', bg: 'bg-yellow-500' };
  if (aqi <= 150) return { label: 'Kém', color: 'text-orange-500', bg: 'bg-orange-500' };
  if (aqi <= 200) return { label: 'Xấu', color: 'text-red-500', bg: 'bg-red-500' };
  return { label: 'Báo động', color: 'text-purple-600', bg: 'bg-purple-600' };
};

export const getUVLevel = (uv) => {
  if (uv <= 2) return { label: 'Thấp', color: 'text-green-500' };
  if (uv <= 5) return { label: 'Trung bình', color: 'text-yellow-500' };
  if (uv <= 7) return { label: 'Cao', color: 'text-orange-500' };
  if (uv <= 10) return { label: 'Rất cao', color: 'text-red-500' };
  return { label: 'Nguy hại', color: 'text-purple-600' };
};

export const getWeatherDescription = (code) => {
  if (code === 0) return 'Trời quang';
  if (code >= 1 && code <= 3) return 'Mây rải rác';
  if (code === 45 || code === 48) return 'Sương mù';
  if (code >= 51 && code <= 55) return 'Mưa phùn';
  if (code >= 61 && code <= 65) return 'Có mưa';
  if (code >= 71 && code <= 75) return 'Có tuyết';
  if (code >= 80 && code <= 82) return 'Mưa rào';
  if (code >= 95) return 'Có dông';
  return 'Thời tiết';
};

export const getWeatherIconName = (code) => {
  if (code === 0) return 'Sun';
  if (code >= 1 && code <= 3) return 'CloudSun';
  if (code === 45 || code === 48) return 'CloudFog';
  if (code >= 51 && code <= 55) return 'CloudDrizzle';
  if (code >= 61 && code <= 65) return 'CloudRain';
  if (code >= 71 && code <= 75) return 'CloudSnow';
  if (code >= 80 && code <= 82) return 'CloudRain';
  if (code >= 95) return 'CloudLightning';
  return 'Cloud';
};
export const searchCities = async (query) => {
  if (!query || query.length < 2) return [];
  try {
    const data = await fetchJson(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=vi&format=json`,
      { context: 'city-search', retries: 0, timeoutMs: 6000 },
    );
    return data.results || [];
  } catch (error) {
    console.error('City search error:', error);
    return [];
  }
};
