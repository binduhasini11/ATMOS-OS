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
import { Search, Navigation, Loader2, X, Sun, Moon, MapPin } from 'lucide-react';
import { searchCities } from './services/weatherApi';
import { SearchLocationResult } from './types';

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

  // Compute greeting message based on local hour
  const getGreeting = (): string => {
    try {
      if (weatherData?.location?.localtime) {
        const timePart = weatherData.location.localtime.split(' ')[1] || '';
        const [h] = timePart.split(':');
        const hour = parseInt(h, 10) || new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning, observer.';
        if (hour >= 12 && hour < 17) return 'Good afternoon, observer.';
        if (hour >= 17 && hour < 21) return 'Good evening, observer.';
        return 'Good night, observer.';
      }
    } catch {}
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return 'Good morning, observer.';
    if (currentHour >= 12 && currentHour < 17) return 'Good afternoon, observer.';
    if (currentHour >= 17 && currentHour < 21) return 'Good evening, observer.';
    return 'Good night, observer.';
  };

  // Desktop search state
  const [desktopSearch, setDesktopSearch] = useState('');
  const [desktopResults, setDesktopResults] = useState<SearchLocationResult[]>([]);
  const [desktopSearching, setDesktopSearching] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [desktopSelectedIdx, setDesktopSelectedIdx] = useState(-1);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const desktopDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (desktopDebounceRef.current) clearTimeout(desktopDebounceRef.current);
    const trimmed = desktopSearch.trim();
    if (trimmed.length < 2) { setDesktopResults([]); setDesktopSearching(false); return; }
    setDesktopSearching(true);
    desktopDebounceRef.current = setTimeout(async () => {
      if (desktopAbortRef.current) desktopAbortRef.current.abort();
      desktopAbortRef.current = new AbortController();
      try {
        const results = await searchCities(trimmed, desktopAbortRef.current.signal);
        setDesktopResults(results);
        setDesktopOpen(true);
        setDesktopSelectedIdx(-1);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
      } finally { setDesktopSearching(false); }
    }, 350);
  }, [desktopSearch]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setDesktopOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDesktopSelect = (loc: SearchLocationResult) => {
    handleSelectLocation(loc.lat, loc.lon, `${loc.name}, ${loc.country}`);
    setDesktopSearch('');
    setDesktopResults([]);
    setDesktopOpen(false);
  };

  const handleDesktopKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDesktopSelectedIdx((p) => (p < desktopResults.length - 1 ? p + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDesktopSelectedIdx((p) => (p > 0 ? p - 1 : desktopResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const idx = desktopSelectedIdx >= 0 ? desktopSelectedIdx : 0;
      if (desktopResults[idx]) handleDesktopSelect(desktopResults[idx]);
    } else if (e.key === 'Escape') {
      setDesktopOpen(false);
    }
  };

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

      {/* Main Content Stage */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
        {/* Mobile Header (only on small screens) */}
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

        {/* Desktop top bar */}
        <div className={`hidden lg:flex items-center justify-between gap-4 px-8 py-4 border-b ${
          theme === 'dark' ? 'border-white/5' : 'border-blue-200/60'
        }`}>
          {/* Desktop search */}
          <div ref={desktopSearchRef} className="relative flex-1 max-w-md">
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:border-white/20'
                : 'bg-white border-blue-200'
            }`}>
              <Search className={`w-3.5 h-3.5 shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={desktopSearch}
                onChange={(e) => setDesktopSearch(e.target.value)}
                onKeyDown={handleDesktopKeyDown}
                placeholder="Search places · Current position"
                className={`flex-1 bg-transparent text-sm font-mono outline-none ${
                  theme === 'dark'
                    ? 'text-slate-200 placeholder:text-slate-600'
                    : 'text-slate-900 placeholder:text-slate-400'
                }`}
              />
              {desktopSearch && (
                <button
                  onClick={() => { setDesktopSearch(''); setDesktopResults([]); setDesktopOpen(false); }}
                  className={`shrink-0 ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {desktopSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {desktopOpen && desktopResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-xl z-50 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#111827] border-white/10'
                  : 'bg-white border-blue-200 shadow-blue-100'
              }`}>
                {desktopResults.map((loc, idx) => (
                  <button
                    key={`${loc.id}-${idx}`}
                    onClick={() => handleDesktopSelect(loc)}
                    onMouseEnter={() => setDesktopSelectedIdx(idx)}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2.5 text-sm transition-colors ${
                      desktopSelectedIdx === idx
                        ? theme === 'dark' ? 'bg-white/10 text-white' : 'bg-blue-50 text-slate-900'
                        : theme === 'dark' ? 'hover:bg-white/5 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span>{loc.name}, {loc.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Unit toggle */}
            <div className={`flex items-center rounded-lg border px-1 py-0.5 text-[11px] font-mono font-semibold ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-blue-200'
            }`}>
              {(['C','F'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => handleToggleUnit(u)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    unit === u
                      ? theme === 'dark' ? 'bg-white/15 text-white font-bold' : 'bg-blue-100 text-indigo-700 font-bold'
                      : theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  °{u}
                </button>
              ))}
            </div>

            {/* Location */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className={`p-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  : 'border-blue-200 text-slate-500 hover:text-indigo-700'
              }`}
              aria-label="Use current location"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            </button>

            {/* Theme */}
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-lg border transition-colors ${
                theme === 'dark'
                  ? 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  : 'border-blue-200 text-slate-500 hover:text-indigo-700'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Inner Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Greeting Heading + Status */}
          {weatherData && !isLoading && !error && (
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="space-y-1.5">
                <div className={`text-[10px] uppercase tracking-widest font-semibold font-mono ${
                  theme === 'dark' ? 'text-cyan-500/70' : 'text-indigo-400'
                }`}>
                  PERSONAL ATMOSPHERIC LOG
                </div>
                <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight leading-tight ${
                  theme === 'dark' ? 'text-white' : 'text-slate-950'
                }`}>
                  {getGreeting()}
                </h1>
                <p className={`text-sm font-normal ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  A clear view of what the air is doing around{' '}
                  <strong className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    {weatherData.location.name}
                  </strong>
                  {weatherData.isFallbackDemo && (
                    <span className={`ml-3 text-[11px] font-mono ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                      · demo data
                    </span>
                  )}
                </p>
              </div>
              {/* STATION ONLINE badge */}
              <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold ${
                  theme === 'dark' ? 'text-slate-500' : 'text-indigo-400'
                }`}>
                  STATION ONLINE
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

          {/* Footer — Replit style */}
          <footer className={`pt-5 pb-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono ${
            theme === 'dark' ? 'border-white/5 text-slate-600' : 'border-blue-200/60 text-slate-400'
          }`}>
            <div className="tracking-widest uppercase">
              ATMOS / {weatherData?.location.lat.toFixed(3) || '0.000'}° {weatherData?.location.lon.toFixed(3) || '0.000'}°
            </div>
            <div>
              Forecast source refreshed {weatherData?.location.localtime?.split(' ')[1] || '--:--'}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
