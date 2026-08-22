/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TemperatureUnit,
  ThemeMode,
  WeatherApiResponse,
  FavoriteCity,
} from './types';
import {
  getWeatherForecast,
  checkConfigStatus,
  WeatherApiError,
} from './services/weatherApi';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyTemperatureChart } from './components/HourlyTemperatureChart';
import { FiveDayForecast } from './components/FiveDayForecast';
import { AtmosphericDetails } from './components/AtmosphericDetails';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorState } from './components/ErrorState';
import { Info, Radio, Activity, Terminal } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'ATMOSPHERE_FAVORITES_V1';
const UNIT_STORAGE_KEY = 'ATMOSPHERE_UNIT_V1';
const THEME_STORAGE_KEY = 'ATMOSPHERE_THEME_V1';

export default function App() {
  // Application State
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    try {
      const saved = localStorage.getItem(UNIT_STORAGE_KEY);
      return saved === 'F' || saved === 'C' ? saved : 'C';
    } catch {
      return 'C';
    }
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse favorites from storage:', e);
    }
    // Default starter favorites
    return [
      { id: 'fav-bengaluru', name: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946, addedAt: Date.now() },
      { id: 'fav-london', name: 'London', region: 'Greater London', country: 'United Kingdom', lat: 51.5171, lon: -0.1062, addedAt: Date.now() },
      { id: 'fav-tokyo', name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917, addedAt: Date.now() },
      { id: 'fav-nyc', name: 'New York', region: 'New York', country: 'United States', lat: 40.7128, lon: -74.006, addedAt: Date.now() },
    ];
  });

  // Current active location query (can be "lat,lon" or "city name")
  const [activeQuery, setActiveQuery] = useState<string>('12.9716,77.5946');
  const [activeLocationLabel, setActiveLocationLabel] = useState<string>('Bengaluru, India');
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check config status on initial mount
  useEffect(() => {
    checkConfigStatus().then((status) => {
      setHasApiKey(status.hasApiKey);
    });
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  // Save unit preference
  const handleToggleUnit = (newUnit: TemperatureUnit) => {
    setUnit(newUnit);
    try {
      localStorage.setItem(UNIT_STORAGE_KEY, newUnit);
    } catch (e) {
      console.warn('Failed to save unit to localStorage:', e);
    }
  };

  // Save theme preference
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  };

  // Primary weather fetch function
  const fetchWeather = useCallback(
    async (query: string, showBackgroundRefresh = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (showBackgroundRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await getWeatherForecast(query, 5, abortControllerRef.current.signal);
        setWeatherData(data);
        setActiveLocationLabel(`${data.location.name}, ${data.location.country}`);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load weather:', err);
          setError(
            err instanceof WeatherApiError
              ? err.message
              : 'Failed to retrieve meteorological telemetry. Please check your network connection.'
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Handle location selection from search or preset
  const handleSelectLocation = useCallback(
    (lat: number, lon: number, name: string) => {
      const q = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      setActiveQuery(q);
      setActiveLocationLabel(name);
      fetchWeather(q);
    },
    [fetchWeather]
  );

  // Geolocation handler ("Use My Location")
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser or environment.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const q = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        setActiveQuery(q);
        setActiveLocationLabel(`Current Station (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
        fetchWeather(q);
      },
      (geoError) => {
        setIsLocating(false);
        console.warn('Geolocation error or denied:', geoError);
        // If first launch and denied, fallback quietly to default city
        if (!weatherData) {
          fetchWeather('12.9716,77.5946');
        } else {
          setError(
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Location permission was denied. You can search for any city manually.'
              : 'Unable to acquire precise GPS coordinates. Try searching for your city name.'
          );
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, [fetchWeather, weatherData]);

  // Initial load: Attempt Geolocation, fallback to default station
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const q = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
          setActiveQuery(q);
          fetchWeather(q);
        },
        () => {
          // If denied/unavailable on launch, load default city (Bengaluru / India)
          fetchWeather('12.9716,77.5946');
        },
        { timeout: 4000 }
      );
    } else {
      fetchWeather('12.9716,77.5946');
    }
  }, [fetchWeather]);

  // Favorites management
  const isCurrentFavorite = Boolean(
    weatherData?.location?.name &&
      favorites.some(
        (f) =>
          (f?.name &&
            weatherData.location.name &&
            f.name.toLowerCase() === weatherData.location.name.toLowerCase()) ||
          (Math.abs(f.lat - weatherData.location.lat) < 0.05 &&
            Math.abs(f.lon - weatherData.location.lon) < 0.05)
      )
  );

  const toggleFavorite = () => {
    if (!weatherData?.location) return;

    if (isCurrentFavorite) {
      setFavorites((prev) =>
        prev.filter(
          (f) =>
            (!f.name ||
              !weatherData.location.name ||
              f.name.toLowerCase() !== weatherData.location.name.toLowerCase()) &&
            Math.abs(f.lat - weatherData.location.lat) >= 0.05
        )
      );
    } else {
      const newFav: FavoriteCity = {
        id: `fav-${Date.now()}`,
        name: weatherData.location.name,
        region: weatherData.location.region,
        country: weatherData.location.country,
        lat: weatherData.location.lat,
        lon: weatherData.location.lon,
        addedAt: Date.now(),
      };
      setFavorites((prev) => [newFav, ...prev]);
    }
  };

  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSelectFavorite = (fav: FavoriteCity) => {
    handleSelectLocation(fav.lat, fav.lon, `${fav.name}, ${fav.country}`);
  };

  // Derived astro data
  const firstDayAstro = weatherData?.forecast?.forecastday?.[0]?.astro;
  const sunrise = firstDayAstro?.sunrise || '06:15 AM';
  const sunset = firstDayAstro?.sunset || '06:30 PM';

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden font-sans select-none ${
        theme === 'dark'
          ? 'atmos-bg-dark text-slate-100'
          : 'atmos-bg-light text-slate-950'
      }`}
    >
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* High Density Left Sidebar Station */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:transform-none ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          currentUnit={unit}
          onToggleUnit={handleToggleUnit}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onSelectLocation={(lat, lon, name) => {
            handleSelectLocation(lat, lon, name);
            setIsMobileSidebarOpen(false);
          }}
          onUseCurrentLocation={() => {
            handleUseCurrentLocation();
            setIsMobileSidebarOpen(false);
          }}
          isLocating={isLocating}
          favorites={favorites}
          activeLocationName={weatherData?.location.name || activeLocationLabel}
          selectedLocationName={weatherData?.location.name || activeLocationLabel}
          onSelectFavorite={(fav) => {
            handleSelectFavorite(fav);
            setIsMobileSidebarOpen(false);
          }}
          onRemoveFavorite={handleRemoveFavorite}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          activeLocationCoords={
            weatherData
              ? { lat: weatherData.location.lat, lon: weatherData.location.lon }
              : undefined
          }
        />
      </div>

      {/* Main High Density Telemetry Stage */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
        {/* Mobile Header (Navbar with Search and Menu Button) */}
        <Header
          currentUnit={unit}
          onToggleUnit={handleToggleUnit}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onSelectLocation={handleSelectLocation}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLocating={isLocating}
          activeLocationName={activeLocationLabel}
          hasApiKey={hasApiKey}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Inner Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Fallback Demo status banner if API key is not supplied */}
          {weatherData?.isFallbackDemo && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-mono backdrop-blur-xl ${
                theme === 'dark'
                  ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-300'
                  : 'bg-purple-100/90 border-purple-200 text-purple-950 font-medium'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info
                  className={`w-4 h-4 shrink-0 ${
                    theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                  }`}
                />
                <span>
                  Demo Telemetry Mode. Set <strong className="underline font-bold">WEATHER_API_KEY</strong> in Settings for live global station data.
                </span>
              </div>
            </div>
          )}

          {isLoading ? (
            <LoadingSkeleton theme={theme} />
          ) : error ? (
            <ErrorState
              message={error}
              onRetry={() => fetchWeather(activeQuery)}
              onSelectPreset={handleSelectLocation}
              theme={theme}
            />
          ) : weatherData ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Primary Current Weather Observation Card */}
              <CurrentWeatherCard
                location={weatherData.location}
                current={weatherData.current}
                unit={unit}
                theme={theme}
                isFavorite={isCurrentFavorite}
                onToggleFavorite={toggleFavorite}
                onRefresh={() => fetchWeather(activeQuery, true)}
                isRefreshing={isRefreshing}
                sunrise={sunrise}
                sunset={sunset}
              />

              {/* Middle Section: 18-Hour Recharts Hourly Chart */}
              <HourlyTemperatureChart
                forecastDays={weatherData.forecast.forecastday}
                localTimeString={weatherData.location.localtime}
                unit={unit}
                theme={theme}
              />

              {/* Lower Section: 5-Day Forecast & Atmospheric Air Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 5-Day Forecast - 7 Cols on desktop */}
                <div className="lg:col-span-7">
                  <FiveDayForecast
                    forecastDays={weatherData.forecast.forecastday}
                    unit={unit}
                    theme={theme}
                  />
                </div>

                {/* Atmospheric Details & Air Quality - 5 Cols on desktop */}
                <div className="lg:col-span-5">
                  <AtmosphericDetails
                    current={weatherData.current}
                    alerts={weatherData.alerts?.alert}
                    unit={unit}
                    theme={theme}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {/* High-density Footer */}
          <footer
            className={`pt-6 pb-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono ${
              theme === 'dark'
                ? 'border-slate-800/80 text-slate-400'
                : 'border-purple-200/80 text-stone-600 font-medium'
            }`}
          >
            <div>
              ATMOS / OS • ATMOSPHERIC OBSERVATION SYSTEM V2.5
            </div>
            <div className="flex items-center gap-3">
              <span>LAT: {weatherData?.location.lat.toFixed(2) || '0.00'}°</span>
              <span>LON: {weatherData?.location.lon.toFixed(2) || '0.00'}°</span>
              <span
                className={`font-bold ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                }`}
              >
                ● ONLINE
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
