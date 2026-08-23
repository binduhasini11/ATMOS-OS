import React from 'react';
import {
  Navigation,
  Loader2,
  X,
} from 'lucide-react';
import { FavoriteCity, TemperatureUnit, ThemeMode } from '../types';

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
  const isDark = theme === 'dark';

  return (
    <aside
      id="atmos-sidebar"
      className={`w-64 xl:w-72 flex flex-col h-full border-r shrink-0 ${
        isDark
          ? 'atmos-sidebar-dark border-slate-800/70 text-slate-200'
          : 'atmos-sidebar-light border-blue-200/70 text-slate-900'
      }`}
    >
      {/* Brand */}
      <div
        className={`px-6 py-5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800/70' : 'border-stone-300/60'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Signal-style icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={isDark ? 'text-slate-300' : 'text-slate-700'}>
            <path d="M2 16.5L12 3.5L22 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 16.5L12 11L16 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div className={`text-xs font-bold tracking-[0.12em] uppercase font-mono leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              atmos
            </div>
            <div className={`text-[9px] font-mono tracking-widest uppercase ${isDark ? 'text-slate-500' : 'text-stone-500'}`}>
              FIELD INSTRUMENT
            </div>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className={`lg:hidden p-1 rounded ${isDark ? 'text-slate-500 hover:text-slate-200' : 'text-stone-500 hover:text-slate-900'}`}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search */}
      {/* REMOVED — search lives in the desktop top bar and mobile header */}

      {/* PINNED LOCATIONS */}
      <div className="px-5 pt-5 pb-3">
        <div
          className={`text-[9px] font-mono tracking-[0.2em] uppercase font-semibold mb-3 ${isDark ? 'text-slate-500' : 'text-stone-500'}`}
        >
          PINNED LOCATIONS
        </div>

        {/* Use my location */}
        <button
          id="sidebar-detect-location-btn"
          onClick={() => { onUseCurrentLocation(); if (onCloseMobile) onCloseMobile(); }}
          disabled={isLocating}
          className={`w-full flex items-center gap-2.5 py-2 px-1 text-sm font-light transition-colors rounded disabled:opacity-50 ${
            isDark
              ? 'text-slate-300 hover:text-white'
              : 'text-stone-700 hover:text-slate-900'
          }`}
        >
          {isLocating ? (
            <Loader2 className={`w-3.5 h-3.5 animate-spin shrink-0 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
          ) : (
            <Navigation className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
          )}
          <span>Use my location</span>
        </button>

        {/* Favorites list */}
        {favorites.length > 0 && (
          <div className="mt-1 space-y-0.5">
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
                  onClick={() => { onSelectFavorite(fav); if (onCloseMobile) onCloseMobile(); }}
                  className={`group flex items-center justify-between py-1.5 px-1 rounded cursor-pointer transition-colors ${
                    isSelected
                      ? isDark ? 'text-white' : 'text-slate-950 font-medium'
                      : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-stone-600 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm font-light truncate">{fav.name}</span>
                  <button
                    type="button"
                    onClick={(e) => onRemoveFavorite(fav.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded ml-1 text-slate-500 hover:text-rose-400 transition-all"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {favorites.length === 0 && (
          <p className={`text-[11px] font-mono mt-2 ${isDark ? 'text-slate-600' : 'text-stone-400'}`}>
            Pin a location with ♥ to save it here.
          </p>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom tagline */}
      <div
        className={`px-5 py-5 border-t text-[10px] font-mono leading-relaxed ${
          isDark ? 'border-slate-800/70 text-slate-600' : 'border-stone-300/60 text-stone-400'
        }`}
      >
        Atmospheric readings, quietly observed.<br />Updated as the sky changes.
      </div>
    </aside>
  );
};
