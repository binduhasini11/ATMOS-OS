import React from 'react';
import {
  MapPin,
  Star,
  Wind,
  Droplets,
  Gauge,
  Eye,
  Sun,
  Sunset,
  Sunrise,
  RefreshCw,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { CurrentWeather, TemperatureUnit, ThemeMode, WeatherLocation } from '../types';
import {
  formatDateShort,
  formatPressure,
  formatTemperature,
  formatTimeOnly,
  formatWindSpeed,
  getUvCategory,
} from '../utils/formatters';
import { WeatherIcon } from '../utils/weatherIcons';

interface CurrentWeatherCardProps {
  location: WeatherLocation;
  current: CurrentWeather;
  unit: TemperatureUnit;
  theme: ThemeMode;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  sunrise?: string;
  sunset?: string;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  location,
  current,
  unit,
  theme,
  isFavorite,
  onToggleFavorite,
  onRefresh,
  isRefreshing,
  sunrise = '06:15 AM',
  sunset = '06:30 PM',
}) => {
  const uvCategory = getUvCategory(current.uv);

  return (
    <div className="space-y-5">
      {/* Station Location Header Banner */}
      <header
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-3 border-b transition-colors ${
          theme === 'dark' ? 'border-slate-800/80' : 'border-purple-200/70'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono tracking-widest uppercase font-bold ${
                theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
              }`}
            >
              ATMOSPHERIC OBSERVATION STATION
            </span>
            <div
              className={`h-[1px] w-8 ${
                theme === 'dark' ? 'bg-cyan-400/40' : 'bg-purple-300'
              }`}
            />
            <span
              className={`text-[10px] font-mono uppercase ${
                theme === 'dark' ? 'text-slate-500' : 'text-stone-600'
              }`}
            >
              LAT {location.lat.toFixed(2)}° • LON {location.lon.toFixed(2)}°
            </span>
          </div>

          <h2
            className={`text-3xl sm:text-4xl font-normal tracking-tight font-sans flex items-baseline gap-2.5 ${
              theme === 'dark' ? 'text-white' : 'text-slate-950 font-medium'
            }`}
          >
            <span>{location.name}</span>
            <span
              className={`text-xl sm:text-2xl font-mono ${
                theme === 'dark' ? 'text-slate-400' : 'text-stone-700'
              }`}
            >
              {location.country}
            </span>
          </h2>

          <p
            className={`text-xs font-mono uppercase tracking-wider ${
              theme === 'dark' ? 'text-slate-400' : 'text-stone-700 font-medium'
            }`}
          >
            Local Time: {location.localtime} — {location.tz_id || 'STATION UTC'}
          </p>
        </div>

        {/* Right Status Tags & Action Buttons */}
        <div className="flex sm:flex-col items-end gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1.5">
            <div
              className={`px-3 py-1 rounded-md text-[11px] font-bold font-mono uppercase tracking-wider border ${
                current.uv >= 6
                  ? theme === 'dark'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-amber-100 border-amber-300 text-amber-950'
                  : current.temp_c <= 0
                  ? theme === 'dark'
                    ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                    : 'bg-sky-100 border-sky-300 text-sky-950'
                  : theme === 'dark'
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                  : 'bg-purple-100 border-purple-300 text-purple-950'
              }`}
            >
              {current.condition.text}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="favorite-toggle-btn"
              onClick={onToggleFavorite}
              aria-label={isFavorite ? 'Remove from saved stations' : 'Save station to favorites'}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm ${
                isFavorite
                  ? theme === 'dark'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                  : theme === 'dark'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100 font-medium'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isFavorite
                    ? 'fill-amber-400 text-amber-500'
                    : theme === 'dark'
                    ? 'text-slate-400'
                    : 'text-purple-600'
                }`}
              />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {isFavorite ? 'Saved' : 'Pin Station'}
              </span>
            </button>

            <button
              id="weather-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh telemetry data"
              className={`p-2 rounded-lg border transition-all shadow-sm ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-300'
                  : 'border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100'
              }`}
              title="Refresh telemetry"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRefreshing
                    ? 'animate-spin text-cyan-400'
                    : theme === 'dark'
                    ? 'text-slate-300'
                    : 'text-purple-700'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Primary Current Weather Observation Card */}
      <div
        id="current-weather-card"
        className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 p-6 sm:p-7 relative overflow-hidden ${
          theme === 'dark'
            ? 'bg-[#0f172a]/95 border-slate-800/90 text-slate-100 shadow-2xl backdrop-blur-xl'
            : 'bg-gradient-to-br from-[#f8f5ff] via-[#f5efff] to-[#fbf7fe] border-purple-200/90 text-slate-900 shadow-md'
        }`}
      >
        {/* Glow accent orb in dark mode */}
        {theme === 'dark' && (
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/15 blur-[60px] pointer-events-none" />
        )}

        <div className="relative z-10 space-y-6">
          {/* Main Temperature & Weather Icon Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1.5">
              <span
                className={`text-[11px] font-mono uppercase tracking-[0.2em] font-bold block ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-800'
                }`}
              >
                CURRENT TEMPERATURE
              </span>

              {/* Fix: Single degree symbol! formatTemperature in 'raw' mode + single ° and Unit */}
              <div
                id="current-temperature-value"
                className="flex items-baseline"
              >
                <span
                  className={`text-6xl sm:text-7xl font-sans font-light tracking-tight ${
                    theme === 'dark' ? 'text-white' : 'text-slate-950 font-normal'
                  }`}
                >
                  {formatTemperature(current.temp_c, current.temp_f, unit, 'raw')}°
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-mono font-medium ml-2 ${
                    theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                  }`}
                >
                  {unit}
                </span>
              </div>

              <div
                className={`text-lg sm:text-xl font-medium tracking-tight mt-1 ${
                  theme === 'dark' ? 'text-slate-200' : 'text-stone-900'
                }`}
              >
                {current.condition.text}
              </div>
            </div>

            {/* Weather Condition Icon */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-center shrink-0 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800 text-cyan-300'
                  : 'bg-white/90 border-purple-200 text-purple-700 shadow-sm'
              }`}
            >
              <WeatherIcon
                conditionText={current.condition.text}
                code={current.condition.code}
                isDay={current.is_day}
                className="w-16 h-16 sm:w-20 sm:h-20"
              />
            </div>
          </div>

          {/* Sub-Metrics Telemetry Grid */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 border-t ${
              theme === 'dark' ? 'border-slate-800/80' : 'border-purple-200/70'
            }`}
          >
            {/* RealFeel */}
            <div
              className={`p-3 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-slate-800/70'
                  : 'bg-white/80 border-purple-100 shadow-xs'
              }`}
            >
              <span
                className={`block text-[10px] font-mono uppercase tracking-wider mb-1 font-semibold ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                RealFeel
              </span>
              <span
                className={`text-base font-mono font-bold uppercase ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                }`}
              >
                {formatTemperature(current.feelslike_c, current.feelslike_f, unit, 'deg')}
              </span>
            </div>

            {/* Humidity */}
            <div
              className={`p-3 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-slate-800/70'
                  : 'bg-white/80 border-purple-100 shadow-xs'
              }`}
            >
              <span
                className={`block text-[10px] font-mono uppercase tracking-wider mb-1 font-semibold ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                Humidity
              </span>
              <span
                className={`text-base font-mono font-bold uppercase ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                }`}
              >
                {current.humidity}%
              </span>
            </div>

            {/* Wind Speed & Direction */}
            <div
              className={`p-3 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-slate-800/70'
                  : 'bg-white/80 border-purple-100 shadow-xs'
              }`}
            >
              <span
                className={`block text-[10px] font-mono uppercase tracking-wider mb-1 font-semibold ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                Wind
              </span>
              <span
                className={`text-base font-mono font-bold uppercase flex items-center gap-1.5 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                }`}
              >
                <Compass
                  className={`w-4 h-4 shrink-0 ${
                    theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'
                  }`}
                  style={{ transform: `rotate(${current.wind_degree}deg)` }}
                />
                <span className="truncate">
                  {formatWindSpeed(current.wind_kph, current.wind_mph, unit)}
                </span>
              </span>
            </div>

            {/* Barometer Pressure */}
            <div
              className={`p-3 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-slate-800/70'
                  : 'bg-white/80 border-purple-100 shadow-xs'
              }`}
            >
              <span
                className={`block text-[10px] font-mono uppercase tracking-wider mb-1 font-semibold ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                Pressure
              </span>
              <span
                className={`text-base font-mono font-bold uppercase ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                }`}
              >
                {formatPressure(current.pressure_mb, unit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


