import React from 'react';
import {
  Heart,
  Wind,
  Droplets,
  Gauge,
  Thermometer,
  RefreshCw,
} from 'lucide-react';
import { CurrentWeather, TemperatureUnit, ThemeMode, WeatherLocation } from '../types';
import {
  formatTemperature,
  formatWindSpeed,
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

function getWindDescription(kph: number): string {
  if (kph < 5) return 'calm';
  if (kph < 15) return 'surface movement';
  if (kph < 30) return 'light breeze';
  if (kph < 50) return 'moderate breeze';
  if (kph < 70) return 'strong wind';
  return 'storm force';
}

function getHumidityDescription(h: number): string {
  if (h < 30) return 'dry air';
  if (h < 50) return 'comfortable air';
  if (h < 70) return 'moderate humidity';
  if (h < 85) return 'saturated air';
  return 'very humid';
}

function getPressureDescription(mb: number): string {
  if (mb < 1000) return 'very low pressure';
  if (mb < 1010) return 'low pressure';
  if (mb < 1020) return 'normal pressure';
  if (mb < 1025) return 'high pressure';
  return 'very high pressure';
}

function getFeelsLikeDescription(feelsC: number, actualC: number): string {
  const d = feelsC - actualC;
  if (d > 3) return 'warmer perception';
  if (d < -3) return 'cooler perception';
  return 'thermal perception';
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  location, current, unit, theme,
  isFavorite, onToggleFavorite, onRefresh, isRefreshing,
}) => {
  const isDark = theme === 'dark';

  const localTimeDisplay = (() => {
    try { return location.localtime?.split(' ')[1] || ''; }
    catch { return ''; }
  })();

  // ── shared label class ──────────────────────────
  const labelCls = isDark
    ? 'text-[9px] font-mono tracking-widest uppercase font-semibold text-slate-500'
    : 'text-[9px] font-mono tracking-widest uppercase font-semibold text-indigo-400';

  return (
    <div className="space-y-3">

      {/* ── LIVE CONDITIONS card — ombre teal glow ── */}
      <div
        id="current-weather-card"
        className={`rounded-2xl border relative overflow-hidden ${
          isDark
            ? 'atmos-live-card-dark border-white/[0.07] text-slate-100'
            : 'lcard-sky border-sky-200 text-slate-900 shadow-md shadow-sky-200/60'
        }`}
      >
        {/* Ombre glow blob — bottom-right corner, dark mode only */}
        {isDark && (
          <div
            className="pointer-events-none absolute -bottom-16 -right-16 w-72 h-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(14,116,144,0.22) 0%, rgba(8,70,92,0.12) 45%, transparent 70%)',
            }}
          />
        )}
        <div className="p-6 sm:p-7">
          {/* header row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-sky-500'}`} />
              <span className={labelCls}>LIVE CONDITIONS</span>
              {localTimeDisplay && (
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-600' : 'text-sky-400'}`}>
                  {localTimeDisplay} LOCAL
                </span>
              )}
            </div>
            <button
              id="weather-refresh-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'text-slate-500 hover:text-slate-300' : 'text-sky-400 hover:text-sky-600'
              }`}
              aria-label="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* temperature + icon / location */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-start gap-3">
                <WeatherIcon
                  conditionText={current.condition.text}
                  code={current.condition.code}
                  isDay={current.is_day}
                  className="w-14 h-14 sm:w-16 sm:h-16 mt-1"
                />
                <div id="current-temperature-value" className="flex items-start">
                  <span className={`text-8xl sm:text-9xl font-light leading-none tracking-tighter ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {formatTemperature(current.temp_c, current.temp_f, unit, 'raw')}
                  </span>
                  <span className={`text-4xl sm:text-5xl font-light leading-none mt-2 ml-1 ${
                    isDark ? 'text-slate-400' : 'text-sky-400'
                  }`}>°</span>
                </div>
              </div>
              <div className={`text-base font-light mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {current.condition.text}
                <span className={`ml-3 ${isDark ? 'text-slate-500' : 'text-sky-400'}`}>
                  · Feels like {formatTemperature(current.feelslike_c, current.feelslike_f, unit, 'deg')}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0 space-y-1">
              <button
                id="favorite-toggle-btn"
                onClick={onToggleFavorite}
                aria-label={isFavorite ? 'Remove from pinned' : 'Pin this location'}
                className={`p-1.5 rounded transition-colors block ml-auto mb-3 ${
                  isFavorite ? 'text-rose-400' : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-sky-300 hover:text-rose-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <div className={`text-xl sm:text-2xl font-light ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {location.name}
              </div>
              <div className={`text-sm font-light ${isDark ? 'text-slate-500' : 'text-sky-500'}`}>
                {location.region}, {location.country}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── METRIC CARDS ROW ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {/* Humidity */}
        <div className={`rounded-xl border p-4 sm:p-5 ${
          isDark
            ? 'atmos-card-dark-raised border-white/[0.07]'
            : 'lcard-blue border-blue-200 shadow-sm shadow-blue-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={labelCls}>HUMIDITY</span>
            <Droplets className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-blue-400'}`} />
          </div>
          <div className={`text-3xl sm:text-4xl font-light tracking-tight ${isDark ? 'text-slate-100' : 'text-blue-700'}`}>
            {current.humidity}%
          </div>
          <div className={`text-[11px] font-light mt-1 ${isDark ? 'text-slate-500' : 'text-blue-400'}`}>
            {getHumidityDescription(current.humidity)}
          </div>
        </div>

        {/* Wind */}
        <div className={`rounded-xl border p-4 sm:p-5 ${
          isDark
            ? 'atmos-card-dark-raised border-white/[0.07]'
            : 'lcard-teal border-teal-200 shadow-sm shadow-teal-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={labelCls}>WIND</span>
            <Wind className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-teal-500'}`} />
          </div>
          <div className={`text-3xl sm:text-4xl font-light tracking-tight ${isDark ? 'text-slate-100' : 'text-teal-700'}`}>
            {formatWindSpeed(current.wind_kph, current.wind_mph, unit)}
          </div>
          <div className={`text-[11px] font-light mt-1 ${isDark ? 'text-slate-500' : 'text-teal-500'}`}>
            {getWindDescription(current.wind_kph)}
          </div>
        </div>

        {/* Pressure */}
        <div className={`rounded-xl border p-4 sm:p-5 ${
          isDark
            ? 'atmos-card-dark-raised border-white/[0.07]'
            : 'lcard-violet border-violet-200 shadow-sm shadow-violet-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={labelCls}>PRESSURE</span>
            <Gauge className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-violet-400'}`} />
          </div>
          <div className={`text-3xl sm:text-4xl font-light tracking-tight ${isDark ? 'text-slate-100' : 'text-violet-700'}`}>
            {unit === 'C' ? `${Math.round(current.pressure_mb)} mb` : `${current.pressure_in.toFixed(2)} in`}
          </div>
          <div className={`text-[11px] font-light mt-1 ${isDark ? 'text-slate-500' : 'text-violet-400'}`}>
            {getPressureDescription(current.pressure_mb)}
          </div>
        </div>

        {/* Feels Like */}
        <div className={`rounded-xl border p-4 sm:p-5 ${
          isDark
            ? 'atmos-card-dark-raised border-white/[0.07]'
            : 'lcard-amber border-amber-200 shadow-sm shadow-amber-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={labelCls}>FEELS LIKE</span>
            <Thermometer className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-amber-500'}`} />
          </div>
          <div className={`text-3xl sm:text-4xl font-light tracking-tight ${isDark ? 'text-slate-100' : 'text-amber-700'}`}>
            {formatTemperature(current.feelslike_c, current.feelslike_f, unit, 'deg')}
          </div>
          <div className={`text-[11px] font-light mt-1 ${isDark ? 'text-slate-500' : 'text-amber-500'}`}>
            {getFeelsLikeDescription(current.feelslike_c, current.temp_c)}
          </div>
        </div>

      </div>
    </div>
  );
};
