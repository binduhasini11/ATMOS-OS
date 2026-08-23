import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ForecastDay, TemperatureUnit, ThemeMode } from '../types';
import { formatDateShort, formatDayName, formatTemperature, formatWindSpeed } from '../utils/formatters';
import { WeatherIcon } from '../utils/weatherIcons';

interface FiveDayForecastProps {
  forecastDays: ForecastDay[];
  unit: TemperatureUnit;
  theme: ThemeMode;
}

export const FiveDayForecast: React.FC<FiveDayForecastProps> = ({ forecastDays, unit, theme }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const isDark = theme === 'dark';

  const allMins = forecastDays.map((d) => (unit === 'C' ? d.day.mintemp_c : d.day.mintemp_f));
  const allMaxs = forecastDays.map((d) => (unit === 'C' ? d.day.maxtemp_c : d.day.maxtemp_f));
  const globalMin   = Math.min(...(allMins.length ? allMins : [0]));
  const globalMax   = Math.max(...(allMaxs.length ? allMaxs : [40]));
  const globalRange = Math.max(1, globalMax - globalMin);

  const sectionLabelCls = isDark
    ? 'text-[9px] font-mono tracking-widest uppercase font-semibold text-slate-500'
    : 'text-[9px] font-mono tracking-widest uppercase font-semibold text-indigo-400';

  return (
    <div
      id="five-day-forecast-card"
      className={`rounded-2xl border h-full ${
        isDark
          ? 'atmos-card-dark border-white/[0.07] text-slate-100'
          : 'atmos-card-light border-violet-100 text-slate-900 shadow-md shadow-violet-100/40'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className={`${sectionLabelCls} mb-1.5`}>ATMOSPHERIC OUTLOOK</div>
            <h2 className={`text-2xl sm:text-3xl font-light tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>Five day forecast</h2>
          </div>
          <span className={`text-[10px] font-mono tracking-widest pb-1 ${
            isDark ? 'text-slate-600' : 'text-violet-300'
          }`}>HIGH / LOW</span>
        </div>

        {/* Rows */}
        <div className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-violet-100/60'}`}>
          {forecastDays.map((fDay, index) => {
            const isExpanded = expandedIndex === index;
            const minTemp = unit === 'C' ? fDay.day.mintemp_c : fDay.day.mintemp_f;
            const maxTemp = unit === 'C' ? fDay.day.maxtemp_c : fDay.day.maxtemp_f;
            const rain    = fDay.day.daily_chance_of_rain || 0;

            const leftPct  = Math.max(0,  Math.min(100, ((minTemp - globalMin) / globalRange) * 100));
            const widthPct = Math.max(12, Math.min(100 - leftPct, ((maxTemp - minTemp) / globalRange) * 100));

            return (
              <div key={`${fDay.date}-${index}`} id={`forecast-day-row-${index}`}>
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className={`flex items-center gap-3 py-3 cursor-pointer group rounded-lg px-1 -mx-1 transition-colors ${
                    isDark ? 'hover:bg-slate-800/30' : 'hover:bg-violet-50'
                  }`}
                >
                  {/* Day */}
                  <div className="w-20 sm:w-24 shrink-0">
                    <div className={`text-sm font-light ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      {formatDayName(fDay.date)}
                    </div>
                    <div className={`text-[11px] font-mono ${isDark ? 'text-slate-600' : 'text-violet-300'}`}>
                      {formatDateShort(fDay.date)}
                    </div>
                  </div>

                  {/* Icon + condition */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <WeatherIcon
                      conditionText={fDay.day.condition.text}
                      code={fDay.day.condition.code}
                      isDay={1}
                      className="w-5 h-5 shrink-0"
                    />
                    <span className={`text-sm font-light truncate hidden sm:block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {fDay.day.condition.text}
                    </span>
                    {rain > 0 && (
                      <span className={`text-[11px] font-mono shrink-0 sm:hidden ${
                        isDark ? 'text-slate-500' : 'text-indigo-400'
                      }`}>{rain}%</span>
                    )}
                  </div>

                  {/* Thermal bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-mono w-8 text-right ${
                      isDark ? 'text-slate-500' : 'text-violet-400'
                    }`}>
                      {formatTemperature(fDay.day.mintemp_c, fDay.day.mintemp_f, unit, 'deg')}
                    </span>

                    <div className={`w-16 sm:w-24 h-1.5 rounded-full relative overflow-hidden ${
                      isDark ? 'bg-slate-800' : 'bg-violet-100'
                    }`}>
                      <div
                        className={`absolute top-0 bottom-0 rounded-full ${
                          isDark
                            ? 'bg-gradient-to-r from-cyan-500/80 to-cyan-300'
                            : 'bg-gradient-to-r from-violet-400 to-amber-400'
                        }`}
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      />
                    </div>

                    <span className={`text-sm font-mono w-8 font-medium ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      {formatTemperature(fDay.day.maxtemp_c, fDay.day.maxtemp_f, unit, 'deg')}
                    </span>

                    <span className={isDark ? 'text-slate-600' : 'text-violet-300'}>
                      {isExpanded
                        ? <ChevronUp className="w-3.5 h-3.5" />
                        : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </div>

                {/* Expanded tray */}
                {isExpanded && (
                  <div className={`mx-1 mb-2 px-3 py-3 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono ${
                    isDark
                      ? 'bg-slate-900/60 text-slate-400'
                      : 'bg-violet-50 text-violet-700'
                  }`}>
                    {[
                      ['Max Wind',      formatWindSpeed(fDay.day.maxwind_kph, fDay.day.maxwind_mph, unit)],
                      ['Humidity',      `${fDay.day.avghumidity}%`],
                      ['UV Index',      `${fDay.day.uv}`],
                      ['Precipitation', unit === 'C' ? `${fDay.day.totalprecip_mm} mm` : `${fDay.day.totalprecip_in} in`],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <div className={`text-[9px] uppercase tracking-wider mb-1 ${
                          isDark ? 'text-slate-600' : 'text-violet-300'
                        }`}>{label}</div>
                        <div className={`font-medium ${
                          label === 'UV Index'
                            ? 'text-amber-500'
                            : isDark ? 'text-slate-300' : 'text-violet-800'
                        }`}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
