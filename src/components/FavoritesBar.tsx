import React from 'react';
import { Star, MapPin, X, Plus } from 'lucide-react';
import { FavoriteCity, ThemeMode } from '../types';

interface FavoritesBarProps {
  favorites: FavoriteCity[];
  selectedLocationName: string;
  onSelectFavorite: (city: FavoriteCity) => void;
  onRemoveFavorite: (id: string, e: React.MouseEvent) => void;
  theme: ThemeMode;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  favorites,
  selectedLocationName,
  onSelectFavorite,
  onRemoveFavorite,
  theme,
}) => {
  if (favorites.length === 0) {
    return null;
  }

  return (
    <div
      id="favorites-bar-container"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 overflow-hidden"
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-400 shrink-0 mr-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="hidden sm:inline">Favorites:</span>
        </div>

        {favorites.map((fav) => {
          const isSelected = (selectedLocationName || '')
            .toLowerCase()
            .includes((fav?.name || '').toLowerCase());

          return (
            <div
              key={fav.id}
              id={`fav-pill-${fav.id}`}
              onClick={() => onSelectFavorite(fav)}
              className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-sans font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                isSelected
                  ? theme === 'dark'
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30 font-bold'
                    : 'bg-purple-200/90 border-purple-400 text-purple-950 font-bold shadow-xs'
                  : theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                  : 'bg-white border-purple-100 text-slate-900 hover:border-purple-300 hover:bg-purple-50 shadow-xs'
              }`}
            >
              <MapPin
                className={`w-3.5 h-3.5 ${
                  isSelected
                    ? theme === 'dark'
                      ? 'text-cyan-400'
                      : 'text-purple-700'
                    : theme === 'dark'
                    ? 'text-slate-400 group-hover:text-slate-200'
                    : 'text-purple-500 group-hover:text-purple-800'
                }`}
              />
              <span className="font-semibold">{fav.name}</span>
              <span
                className={`text-[10px] font-mono ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                {fav.country}
              </span>

              <button
                type="button"
                onClick={(e) => onRemoveFavorite(fav.id, e)}
                title={`Remove ${fav.name} from favorites`}
                className="p-0.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors ml-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
