import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MapPin,
  Sun,
  Moon,
  X,
  Loader2,
  Navigation,
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

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
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
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();
      try {
        const results = await searchCities(trimmed, abortControllerRef.current.signal);
        setSearchResults(results);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err: any) {
        if (err.name !== 'AbortError') setSearchError(err.message || 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [searchTerm]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = useCallback((loc: SearchLocationResult) => {
    onSelectLocation(loc.lat, loc.lon, `${loc.name}, ${loc.country}`);
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [onSelectLocation]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen && searchResults.length > 0) setIsOpen(true);
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) handleSelect(searchResults[selectedIndex]);
      else if (searchResults.length > 0) handleSelect(searchResults[0]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <header
      id="app-header"
      className={`lg:hidden sticky top-0 z-40 border-b ${
        isDark
          ? 'bg-[#0a0f1a]/95 border-slate-800/70 text-slate-100'
          : 'bg-[#efefeb]/95 border-stone-300/60 text-slate-900'
      } backdrop-blur-xl`}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        {/* Menu button */}
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-slate-200'
                : 'border-stone-300 text-stone-500 hover:text-slate-800'
            }`}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Search */}
        <div ref={searchContainerRef} className="relative flex-1">
          <div
            className={`relative flex items-center rounded-lg border ${
              isDark
                ? 'bg-slate-800/60 border-slate-700/60'
                : 'bg-white/80 border-stone-300'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ml-3 shrink-0 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search places · Current position"
              className={`w-full bg-transparent px-2.5 py-2 text-[12px] font-mono outline-none ${
                isDark
                  ? 'text-slate-200 placeholder:text-slate-500'
                  : 'text-slate-900 placeholder:text-stone-400'
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setSearchResults([]); setIsOpen(false); }}
                className={`mr-2.5 ${isDark ? 'text-slate-500' : 'text-stone-400'}`}
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {isOpen && (
            <div
              className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden ${
                isDark
                  ? 'bg-slate-900 border-slate-700'
                  : 'bg-white border-stone-200 shadow-lg'
              }`}
            >
              {searchResults.map((loc, idx) => (
                <button
                  key={`${loc.id}-${idx}`}
                  onClick={() => handleSelect(loc)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center gap-2.5 text-[12px] transition-colors ${
                    isDark
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-stone-50 text-slate-700'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-stone-400'}`} />
                  <span>{loc.name}, {loc.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* °C / °F */}
        <div className={`flex items-center text-[11px] font-mono font-semibold gap-1 shrink-0 ${isDark ? 'text-slate-500' : 'text-stone-500'}`}>
          <button
            onClick={() => onToggleUnit('C')}
            className={`transition-colors ${currentUnit === 'C' ? (isDark ? 'text-slate-100' : 'text-slate-900') : ''}`}
          >
            °C
          </button>
          <span>/</span>
          <button
            onClick={() => onToggleUnit('F')}
            className={`transition-colors ${currentUnit === 'F' ? (isDark ? 'text-slate-100' : 'text-slate-900') : ''}`}
          >
            °F
          </button>
        </div>

        {/* Location + Theme */}
        <button
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className={`p-1.5 rounded-lg shrink-0 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-slate-800'}`}
          aria-label="Use current location"
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleTheme}
          className={`p-1.5 rounded-lg shrink-0 transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-500 hover:text-slate-800'}`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
