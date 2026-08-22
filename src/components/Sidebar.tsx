import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  Loader2,
  X,
  Globe,
  Sun,
  Moon,
  Trash2,
  Radio,
  Sparkles,
} from 'lucide-react';
import { FavoriteCity, SearchLocationResult, TemperatureUnit, ThemeMode } from '../types';
import { searchCities } from '../services/weatherApi';

interface SidebarProps {
  currentUnit: TemperatureUnit;
  onToggleUnit: (unit: TemperatureUnit) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  favorites: FavoriteCity[];
  activeLocationName?: string;
  selectedLocationName?: string;
  onSelectFavorite: (city: FavoriteCity) => void;
  onRemoveFavorite: (id: string, e: React.MouseEvent) => void;
  onCloseMobile?: () => void;
  currentTemp?: string;
  activeLocationCoords?: { lat: number; lon: number };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUnit,
  onToggleUnit,
  theme,
  onToggleTheme,
  onSelectLocation,
  onUseCurrentLocation,
  isLocating,
  favorites,
  activeLocationName = '',
  selectedLocationName = '',
  onSelectFavorite,
  onRemoveFavorite,
  onCloseMobile,
  currentTemp,
  activeLocationCoords,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchLocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchTerm.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    debounceTimerRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const results = await searchCities(trimmed, abortControllerRef.current.signal);
        setSearchResults(results);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Sidebar search error:', err);
          setSearchError(err.message || 'Could not query stations');
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = useCallback(
    (loc: SearchLocationResult) => {
      onSelectLocation(loc.lat, loc.lon, `${loc.name}, ${loc.country}`);
      setSearchTerm('');
      setSearchResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      if (onCloseMobile) onCloseMobile();
    },
    [onSelectLocation, onCloseMobile]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && searchResults.length > 0) {
        setIsOpen(true);
      }
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        handleSelect(searchResults[selectedIndex]);
      } else if (searchResults.length > 0) {
        handleSelect(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
    setSearchError(null);
  };

  return (
    <aside
      id="atmos-sidebar"
      className={`w-full lg:w-72 xl:w-80 flex flex-col p-5 sm:p-6 space-y-6 backdrop-blur-xl border-r transition-colors duration-200 shrink-0 ${
        theme === 'dark'
          ? 'bg-[#080e1c]/95 border-slate-800/80 text-slate-200'
          : 'bg-[#faf7ff]/95 border-purple-200/80 text-slate-900'
      }`}
    >
      {/* Brand Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                theme === 'dark'
                  ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                  : 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.6)]'
              }`}
            />
            <div>
              <h1
                className={`text-xs font-bold tracking-[0.2em] uppercase font-mono ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-900 font-extrabold'
                }`}
              >
                ATMOS / OS
              </h1>
              <div
                className={`text-[9px] font-mono tracking-wider uppercase font-medium ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                Atmospheric Observation System
              </div>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className={`lg:hidden p-1.5 rounded-lg ${
                theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'text-stone-600 hover:text-slate-900 hover:bg-purple-100'
              }`}
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Coordinates & Station Input */}
        <div ref={searchContainerRef} className="relative">
          <div
            className={`relative flex items-center rounded-xl border transition-all ${
              isOpen
                ? theme === 'dark'
                  ? 'border-cyan-500/60 bg-slate-900 ring-1 ring-cyan-500/30'
                  : 'border-purple-400 bg-white ring-1 ring-purple-400/30 shadow-sm'
                : theme === 'dark'
                ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                : 'bg-white border-purple-200 hover:border-purple-300 shadow-xs'
            }`}
          >
            <input
              id="sidebar-coordinates-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search station or city..."
              className={`w-full bg-transparent px-3.5 py-2.5 text-xs font-mono outline-none ${
                theme === 'dark'
                  ? 'text-slate-100 placeholder:text-slate-500'
                  : 'text-slate-950 placeholder:text-stone-600 font-medium'
              }`}
              autoComplete="off"
            />
            <div
              className={`pr-3 flex items-center gap-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-purple-700'
              }`}
            >
              {searchTerm ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="hover:text-slate-200 p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : isSearching ? (
                <Loader2
                  className={`w-3.5 h-3.5 animate-spin ${
                    theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'
                  }`}
                />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div
              id="sidebar-search-results-dropdown"
              className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 ${
                theme === 'dark'
                  ? 'bg-[#0b1120] border-slate-800 divide-y divide-slate-800/60'
                  : 'bg-white border-purple-200 divide-y divide-purple-100 shadow-xl'
              }`}
            >
              {isSearching && (
                <div className="px-3.5 py-2.5 flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                  Querying station telemetry...
                </div>
              )}

              {searchError && (
                <div className="px-3.5 py-2.5 text-[11px] text-rose-400 font-mono">
                  {searchError}
                </div>
              )}

              {!isSearching && searchResults.length === 0 && searchTerm.trim().length >= 2 && (
                <div className="px-3 py-4 text-center">
                  <Globe className="w-4 h-4 mx-auto text-slate-500 mb-1" />
                  <p className="text-[11px] font-mono text-slate-400">
                    No matching observatory coordinates
                  </p>
                </div>
              )}

              {!isSearching &&
                searchResults.map((loc, idx) => (
                  <button
                    key={`${loc.id}-${loc.lat}-${loc.lon}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
                      selectedIndex === idx
                        ? theme === 'dark'
                          ? 'bg-cyan-950/50 text-cyan-300'
                          : 'bg-purple-100 text-purple-950 font-semibold'
                        : theme === 'dark'
                        ? 'hover:bg-slate-800/60 text-slate-300'
                        : 'hover:bg-purple-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin
                        className={`w-3.5 h-3.5 shrink-0 ${
                          theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'
                        }`}
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate font-sans">
                          {loc.name}
                        </div>
                        <div
                          className={`text-[10px] font-mono truncate ${
                            theme === 'dark' ? 'text-slate-500' : 'text-stone-600'
                          }`}
                        >
                          {loc.country}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-mono shrink-0 pl-2 ${
                        theme === 'dark' ? 'text-slate-500' : 'text-stone-600'
                      }`}
                    >
                      {loc.lat.toFixed(1)}°, {loc.lon.toFixed(1)}°
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Detect Location Button */}
        <button
          id="sidebar-detect-location-btn"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 text-[11px] font-bold font-mono tracking-wider uppercase rounded-xl border transition-all active:scale-[0.98] disabled:opacity-50 shadow-xs ${
            theme === 'dark'
              ? 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
              : 'bg-purple-100 hover:bg-purple-200 text-purple-950 border-purple-300 font-bold'
          }`}
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          <span>DETECT LOCATION</span>
        </button>
      </div>

      {/* Saved Stations List */}
      <div className="flex-1 space-y-3 min-h-[160px] overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-1">
          <h2
            className={`text-[10px] font-bold tracking-[0.2em] uppercase font-mono ${
              theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
            }`}
          >
            SAVED STATIONS
          </h2>
          <span
            className={`text-[9px] font-mono font-semibold ${
              theme === 'dark' ? 'text-slate-500' : 'text-stone-600'
            }`}
          >
            {favorites.length} TOTAL
          </span>
        </div>

        {favorites.length === 0 ? (
          <div
            className={`p-4 rounded-xl border border-dashed text-center text-[11px] font-mono leading-relaxed ${
              theme === 'dark'
                ? 'border-slate-800 text-slate-400'
                : 'border-purple-200 text-stone-600'
            }`}
          >
            No saved observatories yet. Click "Pin Station" on any location to save it here.
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav) => {
              const currentName = (activeLocationName || selectedLocationName || '').toLowerCase();
              const favName = (fav?.name || '').toLowerCase();
              const isSelected =
                (currentName && favName && currentName.includes(favName)) ||
                (activeLocationCoords &&
                  fav &&
                  Math.abs(fav.lat - activeLocationCoords.lat) < 0.05 &&
                  Math.abs(fav.lon - activeLocationCoords.lon) < 0.05);

              return (
                <div
                  key={fav.id}
                  id={`sidebar-station-${fav.id}`}
                  onClick={() => {
                    onSelectFavorite(fav);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group select-none ${
                    isSelected
                      ? theme === 'dark'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.1)]'
                        : 'bg-purple-100 border-purple-300 text-purple-950 shadow-sm font-bold'
                      : theme === 'dark'
                      ? 'bg-slate-900/30 hover:bg-slate-900/60 border-slate-800/60 hover:border-slate-700 text-slate-300'
                      : 'bg-white hover:bg-purple-50 border-purple-100 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span
                      className={`text-xs font-semibold font-sans truncate transition-colors ${
                        isSelected
                          ? theme === 'dark'
                            ? 'text-cyan-300 font-bold'
                            : 'text-purple-950 font-bold'
                          : theme === 'dark'
                          ? 'text-slate-200 group-hover:text-cyan-300'
                          : 'text-slate-950 group-hover:text-purple-800'
                      }`}
                    >
                      {fav.name}, {fav.country}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase truncate ${
                        theme === 'dark' ? 'text-cyan-400/70' : 'text-stone-600 font-medium'
                      }`}
                    >
                      Station: {fav.lat.toFixed(2)} / {fav.lon.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => onRemoveFavorite(fav.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      title="Remove station"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isSelected && currentTemp && (
                      <span
                        className={`font-mono text-sm font-bold ${
                          theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                        }`}
                      >
                        {currentTemp}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Telemetry Status & Unit / Theme Controls */}
      <div
        className={`pt-4 border-t flex items-center justify-between ${
          theme === 'dark' ? 'border-slate-800/80' : 'border-purple-200/80'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span
            className={`text-[10px] font-mono uppercase tracking-widest font-semibold ${
              theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
            }`}
          >
            Core Online
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Unit Toggle */}
          <div
            className={`flex rounded-xl p-0.5 border text-[10px] font-bold font-mono ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800'
                : 'bg-purple-100 border-purple-200'
            }`}
          >
            <button
              onClick={() => onToggleUnit('C')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currentUnit === 'C'
                  ? theme === 'dark'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white text-purple-950 font-bold shadow-xs'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-stone-700 hover:text-purple-900'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => onToggleUnit('F')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                currentUnit === 'F'
                  ? theme === 'dark'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-white text-purple-950 font-bold shadow-xs'
                  : theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-stone-700 hover:text-purple-900'
              }`}
            >
              °F
            </button>
          </div>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-50 shadow-xs'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
