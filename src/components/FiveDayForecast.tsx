import React, { useState } from 'react';
import { Calendar, Droplets, Wind, Sun, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { ForecastDay, TemperatureUnit, ThemeMode } from '../types';
import {
  formatDateShort,
  formatDayName,
  formatTemperature,
  formatWindSpeed,
} from '../utils/formatters';
import { WeatherIcon } from '../utils/weatherIcons';

interface FiveDayForecastProps {
  forecastDays: ForecastDay[];
  unit: TemperatureUnit;
  theme: ThemeMode;
}

export const FiveDayForecast: React.FC<FiveDayForecastProps> = ({
  forecastDays,
  unit,
  theme,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Global min and max across all 5 days for the proportional temperature bar calculation
  const allMins = forecastDays.map((d) => (unit === 'C' ? d.day.mintemp_c : d.day.mintemp_f));
  const allMaxs = forecastDays.map((d) => (unit === 'C' ? d.day.maxtemp_c : d.day.maxtemp_f));
  const globalMin = Math.min(...(allMins.length ? allMins : [0]));
  const globalMax = Math.max(...(allMaxs.length ? allMaxs : [40]));
  const globalRange = Math.max(1, globalMax - globalMin);

  return (
    <div
      id="five-day-forecast-card"
      className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 p-5 sm:p-6 backdrop-blur-xl ${
        theme === 'dark'
          ? 'bg-[#0f172a]/95 border-slate-800/90 text-slate-100 shadow-2xl'
          : 'bg-gradient-to-br from-[#faf7ff] via-[#f5efff] to-[#fcf9fe] border-purple-200/90 text-slate-900 shadow-md'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between gap-2 mb-4 pb-3 border-b ${
          theme === 'dark' ? 'border-slate-800/80' : 'border-purple-200/70'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-mono uppercase tracking-widest font-bold ${
              theme === 'dark' ? 'text-cyan-400' : 'text-purple-800'
            }`}
          >
            5-DAY EXTENDED FORECAST
          </span>
        </div>
        <span
          className={`text-[10px] font-mono uppercase font-semibold ${
            theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
          }`}
        >
          METEOROLOGICAL MODEL
        </span>
      </div>

      {/* Days List */}
      <div
        className={`divide-y ${
          theme === 'dark' ? 'divide-slate-800/60' : 'divide-purple-100'
        }`}
      >
        {forecastDays.map((fDay, index) => {
          const isExpanded = expandedIndex === index;
          const minTemp = unit === 'C' ? fDay.day.mintemp_c : fDay.day.mintemp_f;
          const maxTemp = unit === 'C' ? fDay.day.maxtemp_c : fDay.day.maxtemp_f;
          const chanceOfRain = fDay.day.daily_chance_of_rain || 0;

          // Proportional bar offset and width
          const leftPercent = Math.max(0, Math.min(100, ((minTemp - globalMin) / globalRange) * 100));
          const widthPercent = Math.max(15, Math.min(100 - leftPercent, ((maxTemp - minTemp) / globalRange) * 100));

          return (
            <div
              key={`${fDay.date}-${index}`}
              id={`forecast-day-row-${index}`}
              className="py-3.5 first:pt-1 last:pb-1 transition-colors"
            >
              {/* Main Summary Row */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="flex items-center justify-between gap-3 cursor-pointer select-none group"
              >
                {/* Day name & Date */}
                <div className="w-20 sm:w-28 shrink-0">
                  <div
                    className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                      theme === 'dark'
                        ? 'text-slate-200 group-hover:text-cyan-300'
                        : 'text-slate-950 group-hover:text-purple-700'
                    }`}
                  >
                    <span>{formatDayName(fDay.date)}</span>
                    {index === 0 && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          theme === 'dark'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-purple-100 text-purple-900 border border-purple-200'
                        }`}
                      >
                        TODAY
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-medium ${
                      theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                    }`}
                  >
                    {formatDateShort(fDay.date)}
                  </div>
                </div>

                {/* Condition Icon, Rain Chance & Optional Text */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex flex-col items-center justify-center shrink-0 w-8 sm:w-9">
                    <WeatherIcon
                      conditionText={fDay.day.condition.text}
                      code={fDay.day.condition.code}
                      isDay={1}
                      className="w-5 h-5"
                    />
                    {chanceOfRain > 0 && (
                      <span
                        className={`text-[9px] font-mono font-bold leading-none mt-0.5 whitespace-nowrap ${
                          theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                        }`}
                        title={`Chance of precipitation: ${chanceOfRain}%`}
                      >
                        {chanceOfRain}%
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-sans truncate hidden md:inline ${
                      theme === 'dark' ? 'text-slate-300' : 'text-stone-800 font-medium'
                    }`}
                  >
                    {fDay.day.condition.text}
                  </span>
                </div>

                {/* Min / Max Thermal Bar Visualizer */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                  <span
                    className={`text-xs font-mono w-8 sm:w-9 text-right font-medium shrink-0 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-stone-700'
                    }`}
                  >
                    {formatTemperature(fDay.day.mintemp_c, fDay.day.mintemp_f, unit, 'deg')}
                  </span>

                  {/* Gradient Thermal Bar */}
                  <div
                    className={`w-12 sm:w-20 md:w-24 rounded-full h-1.5 sm:h-2 relative overflow-hidden shrink-0 ${
                      theme === 'dark' ? 'bg-slate-800' : 'bg-purple-100'
                    }`}
                  >
                    <div
                      className={`absolute top-0 bottom-0 rounded-full ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-sky-400 to-cyan-300'
                          : 'bg-gradient-to-r from-purple-400 to-indigo-500'
                      }`}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>

                  <span
                    className={`text-xs font-mono font-bold w-8 sm:w-9 text-left shrink-0 ${
                      theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
                    }`}
                  >
                    {formatTemperature(fDay.day.maxtemp_c, fDay.day.maxtemp_f, unit, 'deg')}
                  </span>

                  <div
                    className={`shrink-0 ${
                      theme === 'dark'
                        ? 'text-slate-500 group-hover:text-cyan-400'
                        : 'text-purple-400 group-hover:text-purple-700'
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Details Tray */}
              {isExpanded && (
                <div
                  className={`mt-3 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono p-3 rounded-xl border animate-in fade-in duration-150 ${
                    theme === 'dark'
                      ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                      : 'bg-white/90 border-purple-100 text-slate-900 shadow-xs'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[9px] uppercase block font-semibold mb-0.5 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                      }`}
                    >
                      Max Wind
                    </span>
                    <span
                      className={`font-bold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-950'
                      }`}
                    >
                      {formatWindSpeed(fDay.day.maxwind_kph, fDay.day.maxwind_mph, unit)}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-[9px] uppercase block font-semibold mb-0.5 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                      }`}
                    >
                      Humidity
                    </span>
                    <span
                      className={`font-bold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-950'
                      }`}
                    >
                      {fDay.day.avghumidity}%
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-[9px] uppercase block font-semibold mb-0.5 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                      }`}
                    >
                      UV Rating
                    </span>
                    <span className="font-bold text-amber-500">
                      Index {fDay.day.uv}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-[9px] uppercase block font-semibold mb-0.5 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
                      }`}
                    >
                      Precipitation
                    </span>
                    <span
                      className={`font-bold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-950'
                      }`}
                    >
                      {unit === 'C'
                        ? `${fDay.day.totalprecip_mm} mm`
                        : `${fDay.day.totalprecip_in} in`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

