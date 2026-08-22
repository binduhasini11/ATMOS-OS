import React from 'react';
import {
  ShieldAlert,
  Wind,
  Droplets,
  Activity,
  AlertTriangle,
  SunMedium,
  Gauge,
} from 'lucide-react';
import { CurrentWeather, TemperatureUnit, ThemeMode, WeatherAlert } from '../types';
import { getAirQualityCategory } from '../utils/formatters';

interface AtmosphericDetailsProps {
  current: CurrentWeather;
  alerts?: WeatherAlert[];
  unit: TemperatureUnit;
  theme: ThemeMode;
}

export const AtmosphericDetails: React.FC<AtmosphericDetailsProps> = ({
  current,
  alerts = [],
  unit,
  theme,
}) => {
  const aqiInfo = current.air_quality
    ? getAirQualityCategory(current.air_quality['us-epa-index'])
    : null;

  return (
    <div className="space-y-4">
      {/* Severe Weather Alerts Banner (if present) */}
      {alerts && alerts.length > 0 && (
        <div
          id="weather-alerts-banner"
          className="rounded-2xl border border-rose-500/40 bg-rose-950/40 text-rose-200 p-4 sm:p-5 shadow-lg relative overflow-hidden backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/30 text-rose-300">
                  {alerts[0].severity || 'METEOROLOGICAL WARNING'}
                </span>
                <span className="text-xs text-rose-300 font-mono">
                  {alerts[0].event}
                </span>
              </div>
              <h3 className="text-sm font-bold text-rose-100 font-sans">
                {alerts[0].headline}
              </h3>
              <p className="text-xs text-rose-300/90 font-sans leading-relaxed line-clamp-3">
                {alerts[0].desc || alerts[0].instruction || 'Adhere to regional meteorological civil safety guidelines.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Atmospheric Instrumentation Stack (Aligned cleanly as on mobile/tablet) */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {/* Air Quality Station Card */}
        <div
          id="air-quality-card"
          className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 backdrop-blur-xl ${
            theme === 'dark'
              ? 'bg-[#0f172a]/95 border-slate-800/90 text-slate-100 shadow-xl'
              : 'bg-gradient-to-br from-[#faf7ff] via-[#f5efff] to-[#fcf9fe] border-purple-200/90 text-slate-900 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center justify-between mb-3 pb-2.5 border-b ${
              theme === 'dark' ? 'border-slate-800/80' : 'border-purple-200/70'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Activity
                className={`w-3.5 h-3.5 shrink-0 ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                }`}
              />
              <span
                className={`text-[11px] font-mono uppercase tracking-widest font-bold truncate ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-900'
                }`}
              >
                AIR QUALITY
              </span>
            </div>
            {aqiInfo && (
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border shrink-0 whitespace-nowrap ${
                  theme === 'dark'
                    ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                    : 'border-purple-300 bg-purple-100 text-purple-950'
                }`}
              >
                {aqiInfo.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-0 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : 'bg-white/90 border-purple-100 shadow-xs'
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase font-semibold truncate w-full ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                PM 2.5
              </div>
              <div
                className={`text-base sm:text-lg font-bold font-mono mt-0.5 tracking-tight ${
                  theme === 'dark' ? 'text-cyan-300' : 'text-slate-950'
                }`}
              >
                {current.air_quality?.pm2_5 ? current.air_quality.pm2_5.toFixed(1) : '--'}
              </div>
              <div
                className={`text-[9px] font-mono mt-0.5 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-stone-500'
                }`}
              >
                µg/m³
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-0 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : 'bg-white/90 border-purple-100 shadow-xs'
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase font-semibold truncate w-full ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                PM 10
              </div>
              <div
                className={`text-base sm:text-lg font-bold font-mono mt-0.5 tracking-tight ${
                  theme === 'dark' ? 'text-cyan-300' : 'text-slate-950'
                }`}
              >
                {current.air_quality?.pm10 ? current.air_quality.pm10.toFixed(1) : '--'}
              </div>
              <div
                className={`text-[9px] font-mono mt-0.5 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-stone-500'
                }`}
              >
                µg/m³
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-0 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : 'bg-white/90 border-purple-100 shadow-xs'
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase font-semibold truncate w-full ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                OZONE (O3)
              </div>
              <div
                className={`text-base sm:text-lg font-bold font-mono mt-0.5 tracking-tight ${
                  theme === 'dark' ? 'text-cyan-300' : 'text-slate-950'
                }`}
              >
                {current.air_quality?.o3 ? current.air_quality.o3.toFixed(1) : '--'}
              </div>
              <div
                className={`text-[9px] font-mono mt-0.5 ${
                  theme === 'dark' ? 'text-slate-500' : 'text-stone-500'
                }`}
              >
                µg/m³
              </div>
            </div>
          </div>
        </div>

        {/* Micro-climate & Solar Index Card */}
        <div
          id="solar-conditions-card"
          className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 backdrop-blur-xl ${
            theme === 'dark'
              ? 'bg-[#0f172a]/95 border-slate-800/90 text-slate-100 shadow-xl'
              : 'bg-gradient-to-br from-[#faf7ff] via-[#f5efff] to-[#fcf9fe] border-purple-200/90 text-slate-900 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center justify-between mb-3 pb-2.5 border-b ${
              theme === 'dark' ? 'border-slate-800/80' : 'border-purple-200/70'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <SunMedium
                className={`w-3.5 h-3.5 shrink-0 ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                }`}
              />
              <span
                className={`text-[11px] font-mono uppercase tracking-widest font-bold truncate ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-900'
                }`}
              >
                ATMOSPHERE & OPTICS
              </span>
            </div>
            <span
              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border shrink-0 whitespace-nowrap ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/70 text-slate-300'
                  : 'border-purple-200 bg-purple-100/70 text-purple-950'
              }`}
            >
              TELEMETRY
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-0 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : 'bg-white/90 border-purple-100 shadow-xs'
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase font-semibold truncate w-full ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                CLOUDS
              </div>
              <div
                className={`text-base sm:text-lg font-bold font-mono mt-0.5 tracking-tight ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                }`}
              >
                {current.cloud}%
              </div>
              <div
                className={`text-[9px] font-mono mt-0.5 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-500'
                }`}
              >
                Coverage
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-0 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : 'bg-white/90 border-purple-100 shadow-xs'
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase font-semibold truncate w-full ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                BEARING
              </div>
              <div
                className={`text-base sm:text-lg font-bold font-mono mt-0.5 tracking-tight ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                }`}
              >
                {current.wind_degree}°
              </div>
              <div
                className={`text-[9px] font-mono font-semibold mt-0.5 truncate w-full ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                }`}
              >
                {current.wind_dir}
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-0 ${
                theme === 'dark'
                  ? 'bg-slate-900/60 border-slate-800/80'
                  : 'bg-white/90 border-purple-100 shadow-xs'
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase font-semibold truncate w-full ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                }`}
              >
                UV INDEX
              </div>
              <div
                className={`text-base sm:text-lg font-bold font-mono mt-0.5 tracking-tight ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                }`}
              >
                {current.uv}
              </div>
              <div
                className={`text-[9px] font-mono mt-0.5 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-stone-500'
                }`}
              >
                {current.uv >= 8 ? 'Very High' : current.uv >= 6 ? 'High' : current.uv >= 3 ? 'Moderate' : 'Low'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

