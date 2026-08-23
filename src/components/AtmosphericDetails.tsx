import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { CurrentWeather, TemperatureUnit, ThemeMode, WeatherAlert } from '../types';
import { getAirQualityCategory, getUvCategory } from '../utils/formatters';

interface AtmosphericDetailsProps {
  current: CurrentWeather;
  alerts?: WeatherAlert[];
  unit: TemperatureUnit;
  theme: ThemeMode;
}

export const AtmosphericDetails: React.FC<AtmosphericDetailsProps> = ({
  current, alerts = [], unit, theme,
}) => {
  const isDark = theme === 'dark';
  const aqiInfo     = current.air_quality ? getAirQualityCategory(current.air_quality['us-epa-index']) : null;
  const uvCategory  = getUvCategory(current.uv);

  // ── sub-card classes ──────────────────────────────
  const aqiCardCls = isDark
    ? 'rounded-xl border p-4 bg-slate-900/40 border-white/[0.06]'
    : 'rounded-xl border p-4 lcard-green border-emerald-200';

  const atmCardCls = isDark
    ? 'rounded-xl border p-4 bg-slate-900/40 border-white/[0.06]'
    : 'rounded-xl border p-4 lcard-indigo border-indigo-200';

  const labelCls = isDark
    ? 'text-[9px] font-mono tracking-widest uppercase font-semibold mb-1 text-slate-600'
    : 'text-[9px] font-mono tracking-widest uppercase font-semibold mb-1 text-indigo-300';

  const valueCls = isDark
    ? 'text-lg font-light text-slate-200'
    : 'text-lg font-light text-slate-800';

  const subCls = isDark
    ? 'text-[11px] font-mono mt-0.5 text-slate-600'
    : 'text-[11px] font-mono mt-0.5 text-slate-400';

  const sectionLabelCls = isDark
    ? 'text-[9px] font-mono tracking-widest uppercase font-semibold text-slate-500'
    : 'text-[9px] font-mono tracking-widest uppercase font-semibold text-indigo-400';

  return (
    <div className="space-y-3">

      {/* Severe Weather Alert */}
      {alerts && alerts.length > 0 && (
        <div
          id="weather-alerts-banner"
          className={`rounded-xl border p-4 ${
            isDark
              ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <div className={`text-[10px] font-mono font-semibold uppercase tracking-wider mb-1 ${
                isDark ? 'text-rose-400' : 'text-rose-600'
              }`}>
                {alerts[0].severity || 'WEATHER WARNING'} · {alerts[0].event}
              </div>
              <p className={`text-xs font-light leading-relaxed line-clamp-3 ${
                isDark ? 'text-rose-300/80' : 'text-rose-700'
              }`}>
                {alerts[0].headline || alerts[0].desc || alerts[0].instruction}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Air Quality */}
      <div
        id="air-quality-card"
        className={`rounded-xl border ${
          isDark
            ? 'atmos-card-dark border-white/[0.07]'
            : 'atmos-card-light border-emerald-100 shadow-md shadow-emerald-50'
        }`}
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className={sectionLabelCls}>AIR QUALITY</div>
            {aqiInfo && (
              <span className={`text-[10px] font-mono font-semibold ${
                isDark ? 'text-slate-400' : 'text-emerald-600'
              }`}>{aqiInfo.label}</span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'PM 2.5', val: current.air_quality?.pm2_5?.toFixed(1) ?? '--' },
              { label: 'PM 10',  val: current.air_quality?.pm10?.toFixed(1)  ?? '--' },
              { label: 'O₃',     val: current.air_quality?.o3?.toFixed(1)    ?? '--' },
            ].map(({ label, val }) => (
              <div key={label} className={aqiCardCls}>
                <div className={labelCls}>{label}</div>
                <div className={isDark ? 'text-lg font-light text-slate-200' : 'text-lg font-light text-emerald-700'}>{val}</div>
                <div className={isDark ? 'text-[11px] font-mono mt-0.5 text-slate-600' : 'text-[11px] font-mono mt-0.5 text-emerald-400'}>µg/m³</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Atmosphere & Optics */}
      <div
        id="solar-conditions-card"
        className={`rounded-xl border ${
          isDark
            ? 'atmos-card-dark border-white/[0.07]'
            : 'atmos-card-light border-indigo-100 shadow-md shadow-indigo-50'
        }`}
      >
        <div className="p-4 sm:p-5">
          <div className={`${sectionLabelCls} mb-4`}>ATMOSPHERE & OPTICS</div>
          <div className="grid grid-cols-3 gap-3">
            <div className={atmCardCls}>
              <div className={labelCls}>Cloud</div>
              <div className={isDark ? 'text-lg font-light text-slate-200' : 'text-lg font-light text-indigo-700'}>{current.cloud}%</div>
              <div className={isDark ? 'text-[11px] font-mono mt-0.5 text-slate-600' : 'text-[11px] font-mono mt-0.5 text-indigo-400'}>coverage</div>
            </div>
            <div className={atmCardCls}>
              <div className={labelCls}>Wind dir</div>
              <div className={isDark ? 'text-lg font-light text-slate-200' : 'text-lg font-light text-indigo-700'}>{current.wind_degree}°</div>
              <div className={`text-[11px] font-mono font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-indigo-500'}`}>
                {current.wind_dir}
              </div>
            </div>
            <div className={atmCardCls}>
              <div className={labelCls}>UV Index</div>
              <div className={isDark ? 'text-lg font-light text-slate-200' : 'text-lg font-light text-amber-600'}>{current.uv}</div>
              <div className={`text-[11px] font-mono mt-0.5 ${uvCategory.color}`}>{uvCategory.label}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
