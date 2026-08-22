import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Sun,
  Moon,
  X,
  Loader2,
  Navigation,
  Globe,
  Radio,
  Menu,
} from 'lucide-react';
import { SearchLocationResult, TemperatureUnit, ThemeMode } from '../types';
import { searchCities } from '../services/weatherApi';

interface HeaderProps {
  currentUnit: TemperatureUnit;
  onToggleUnit: (unit: TemperatureUnit) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  activeLocationName?: string;
  hasApiKey: boolean;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUnit,
  onToggleUnit,
  theme,
  onToggleTheme,
  onSelectLocation,
  onUseCurrentLocation,
  isLocating,
  activeLocationName,
  hasApiKey,
  onOpenMobileSidebar,
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

  // Debounced search effect
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
          console.error('Search error:', err);
          setSearchError(err.message || 'Could not fetch matching locations');
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
    },
    [onSelectLocation]
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
    <header
      id="app-header"
      className={`lg:hidden sticky top-0 z-40 transition-colors duration-200 backdrop-blur-xl border-b ${
        theme === 'dark'
          ? 'bg-[#080e1c]/95 border-slate-800/80 text-slate-100'
          : 'bg-[#faf7ff]/95 border-purple-200/80 text-slate-900 shadow-sm'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* Mobile Sidebar Open Button & Brand */}
        <div className="flex items-center gap-2.5">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className={`p-1.5 rounded-xl border transition-colors ${
                theme === 'dark'
                  ? 'border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40'
                  : 'border-purple-200 text-stone-700 hover:text-purple-950 hover:bg-purple-100'
              }`}
              aria-label="Open sidebar stations"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                theme === 'dark'
                  ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                  : 'bg-purple-600 shadow-[0_0_6px_rgba(147,51,234,0.6)]'
              }`}
            />
            <span
              className={`text-xs font-bold font-mono tracking-[0.15em] uppercase ${
                theme === 'dark' ? 'text-cyan-400' : 'text-purple-900 font-extrabold'
              }`}
            >
              ATMOS / OS
            </span>
          </div>
        </div>

        {/* Quick Search on Mobile */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xs">
          <div
            className={`relative flex items-center rounded-xl border text-xs ${
              theme === 'dark'
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-white border-purple-200 shadow-xs'
            }`}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search station..."
              className={`w-full py-2 pl-3 pr-7 bg-transparent text-xs outline-none font-mono ${
                theme === 'dark'
                  ? 'text-slate-100 placeholder:text-slate-500'
                  : 'text-slate-950 placeholder:text-stone-600 font-medium'
              }`}
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search
                className={`w-3.5 h-3.5 absolute right-2 pointer-events-none ${
                  theme === 'dark' ? 'text-slate-500' : 'text-purple-600'
                }`}
              />
            )}
          </div>

          {isOpen && (
            <div
              className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-xl z-50 overflow-hidden ${
                theme === 'dark'
                  ? 'bg-[#0b1120] border-slate-800'
                  : 'bg-white border-purple-200 shadow-xl'
              }`}
            >
              {searchResults.map((loc, idx) => (
                <button
                  key={`${loc.id}-${idx}`}
                  onClick={() => handleSelect(loc)}
                  className={`w-full px-3 py-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-cyan-950/40 hover:text-cyan-300'
                      : 'hover:bg-purple-100 hover:text-purple-950 text-slate-900 font-medium'
                  }`}
                >
                  <span className="truncate">{loc.name}, {loc.country}</span>
                  <span
                    className={`text-[10px] font-mono shrink-0 pl-2 ${
                      theme === 'dark' ? 'text-slate-500' : 'text-stone-600'
                    }`}
                  >
                    {loc.lat.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Location & Unit */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className={`p-2 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                : 'border-purple-300 bg-purple-100 text-purple-950 shadow-xs'
            }`}
            aria-label="Use current location"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900 text-amber-400'
                : 'border-purple-200 bg-white text-purple-900 shadow-xs'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

