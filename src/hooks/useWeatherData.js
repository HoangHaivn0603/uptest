import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, fetchAirQuality, getCachedAirQuality, getCachedWeather, searchCities } from '../utils/weather';
import { VIETNAM_CITIES } from '../utils/constants';

/**
 * Hook for weather data management (fetch, location, AQI, city search).
 */
export function useWeatherData() {
  const [weather, setWeather] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [locationName, setLocationName] = useState('Hà Nội');
  const [locationConfig, setLocationConfig] = useState(() => {
    const saved = localStorage.getItem('weatherLocation');
    return saved ? JSON.parse(saved) : { type: 'gps' };
  });

  // City search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchCities(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefreshWeather = useCallback(async () => {
    setLoadingWeather(true);

    const fetchWithCoords = async (lat, lon, name) => {
      const cachedWeather = getCachedWeather(lat, lon);
      const cachedAir = getCachedAirQuality(lat, lon);
      const hasCached = Boolean(cachedWeather?.data || cachedAir?.data);

      // SWR: return stale data instantly, then refresh in background.
      if (cachedWeather?.data) setWeather(cachedWeather.data);
      if (cachedAir?.data) setAqiData(cachedAir.data);
      if (hasCached) {
        setLocationName(name);
        setLoadingWeather(false);
      }

      try {
        const [w, a] = await Promise.all([fetchWeather(lat, lon), fetchAirQuality(lat, lon)]);
        if (w) setWeather(w);
        if (a) setAqiData(a);

        if (w || a) {
          setLocationName(name);
          return { success: true };
        }

        if (hasCached) {
          return { success: true, stale: true };
        }

        return { success: false, error: 'Không thể tải dữ liệu thời tiết.' };
      } catch (err) {
        console.error(err);
        if (hasCached) {
          return { success: true, stale: true };
        }
        return { success: false, error: 'Không thể tải dữ liệu thời tiết.' };
      } finally {
        setLoadingWeather(false);
      }
    };

    if (locationConfig.type === 'city') {
      const city = VIETNAM_CITIES.find(c => c.id === locationConfig.cityId) || {
        name: locationConfig.customName,
        lat: locationConfig.lat,
        lon: locationConfig.lon
      };
      if (city.lat && city.lon) {
        return fetchWithCoords(city.lat, city.lon, city.name);
      }
    }

    if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(fetchWithCoords(pos.coords.latitude, pos.coords.longitude, 'Vị trí của bạn')),
          () => {
            const def = VIETNAM_CITIES[0];
            resolve(fetchWithCoords(def.lat, def.lon, def.name));
          },
          { timeout: 10000 }
        );
      });
    }

    const def = VIETNAM_CITIES[0];
    return fetchWithCoords(def.lat, def.lon, def.name);
  }, [locationConfig]);

  // Auto-fetch on location change
  useEffect(() => {
    handleRefreshWeather();
  }, [handleRefreshWeather]);

  return {
    weather, aqiData, loadingWeather, locationName,
    locationConfig, setLocationConfig,
    searchQuery, setSearchQuery,
    searchResults, isSearching,
    handleRefreshWeather,
  };
}
