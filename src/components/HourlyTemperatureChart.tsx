import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CloudRain, Thermometer, Wind, Sparkles, Activity } from 'lucide-react';
import { ForecastDay, HourlyChartDataPoint, TemperatureUnit, ThemeMode } from '../types';
import { formatTimeOnly } from '../utils/formatters';

interface HourlyTemperatureChartProps {
  forecastDays: ForecastDay[];
  localTimeString: string;
  unit: TemperatureUnit;
  theme: ThemeMode;
}

type ChartMetric = 'temp' | 'rain' | 'wind';

export const HourlyTemperatureChart: React.FC<HourlyTemperatureChartProps> = ({
  forecastDays,
  localTimeString,
  unit,
  theme,
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temp');

  // Compute the next 18 hours relative to current local time
  const chartData: HourlyChartDataPoint[] = useMemo(() => {
    if (!forecastDays || forecastDays.length === 0) return [];

    let currentHourIndex = 0;
    try {
      if (localTimeString && localTimeString.includes(' ')) {
        const timePart = localTimeString.split(' ')[1];
        const [h] = timePart.split(':');
        currentHourIndex = parseInt(h, 10) || 0;
      } else {
        currentHourIndex = new Date().getHours();
      }
    } catch {
      currentHourIndex = new Date().getHours();
    }

    const todayHours = forecastDays[0]?.hour || [];
    const tomorrowHours = forecastDays[1]?.hour || [];

    // Slice starting from currentHourIndex forward for up to 18 hours
    const combinedHours = [
      ...todayHours.slice(currentHourIndex),
      ...tomorrowHours.slice(0, Math.max(0, 18 - (todayHours.length - currentHourIndex))),
    ].slice(0, 18);

    return combinedHours.map((h, idx) => {
      const tempVal = unit === 'C' ? h.temp_c : h.temp_f;
      const feelsLikeVal = unit === 'C' ? h.feelslike_c : h.feelslike_f;
      const windVal = unit === 'C' ? h.wind_kph : h.wind_mph;

      let timeLabel = '';
      if (idx === 0) {
        timeLabel = 'Now';
      } else {
        const hourStr = h.time.split(' ')[1] || h.time;
        const [hourNum] = hourStr.split(':');
        const hr = parseInt(hourNum, 10);
        const ampm = hr >= 12 ? 'PM' : 'AM';
        const displayHr = hr % 12 === 0 ? 12 : hr % 12;
        timeLabel = `${displayHr}${ampm}`;
      }

      return {
        timeLabel,
        fullTime: h.time,
        temp: Math.round(tempVal * 10) / 10,
        feelsLike: Math.round(feelsLikeVal * 10) / 10,
        humidity: h.humidity,
        chanceOfRain: h.chance_of_rain || 0,
        windSpeed: Math.round(windVal * 10) / 10,
        condition: h.condition.text,
        icon: h.condition.icon,
        isDay: Boolean(h.is_day),
      };
    });
  }, [forecastDays, localTimeString, unit]);

  // Calculate dynamic min & max for padding
  const { minVal, maxVal } = useMemo(() => {
    if (chartData.length === 0) return { minVal: 0, maxVal: 100 };
    if (activeMetric === 'rain') {
      return { minVal: 0, maxVal: 100 };
    }
    const key = activeMetric === 'temp' ? 'temp' : 'windSpeed';
    const values = chartData.map((d) => d[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = activeMetric === 'temp' ? 2 : 5;
    return {
      minVal: Math.floor(min - padding),
      maxVal: Math.ceil(max + padding),
    };
  }, [chartData, activeMetric]);

  const metricConfig = {
    temp: {
      dataKey: 'temp',
      name: `Temperature (°${unit})`,
      stroke: '#22D3EE',
      fillStart: 'rgba(34, 211, 238, 0.35)',
      fillEnd: 'rgba(34, 211, 238, 0.0)',
      unit: `°${unit}`,
    },
    rain: {
      dataKey: 'chanceOfRain',
      name: 'Precipitation Chance (%)',
      stroke: '#38BDF8',
      fillStart: 'rgba(56, 189, 248, 0.4)',
      fillEnd: 'rgba(56, 189, 248, 0.0)',
      unit: '%',
    },
    wind: {
      dataKey: 'windSpeed',
      name: `Wind Speed (${unit === 'C' ? 'km/h' : 'mph'})`,
      stroke: '#10B981',
      fillStart: 'rgba(16, 185, 129, 0.35)',
      fillEnd: 'rgba(16, 185, 129, 0.0)',
      unit: unit === 'C' ? ' km/h' : ' mph',
    },
  }[activeMetric];

  return (
    <div
      id="hourly-forecast-chart-card"
      className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 p-5 sm:p-6 relative backdrop-blur-xl ${
        theme === 'dark'
          ? 'bg-[#0f172a]/95 border-slate-800/90 text-slate-100 shadow-2xl'
          : 'bg-gradient-to-br from-[#faf7ff] via-[#f5efff] to-[#fcf9fe] border-purple-200/90 text-slate-900 shadow-md'
      }`}
    >
      {/* Chart Header with High Contrast Labels */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-mono uppercase tracking-widest font-bold ${
                theme === 'dark' ? 'text-cyan-400' : 'text-purple-800'
              }`}
            >
              HOURLY TEMPERATURE FORECAST [18H]
            </span>
            <div className="flex gap-1 items-end h-3">
              <div
                className={`w-1 h-3 ${
                  theme === 'dark' ? 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]' : 'bg-purple-600'
                }`}
              />
              <div
                className={`w-1 h-2.5 ${
                  theme === 'dark' ? 'bg-cyan-400/60' : 'bg-purple-400'
                }`}
              />
              <div
                className={`w-1 h-1.5 ${
                  theme === 'dark' ? 'bg-cyan-400/30' : 'bg-purple-300'
                }`}
              />
            </div>
          </div>
          <span
            className={`text-[10px] font-mono uppercase hidden md:inline ${
              theme === 'dark' ? 'text-slate-400' : 'text-stone-600 font-medium'
            }`}
          >
            INTERVAL: 1-HOUR • HORIZON: 18H
          </span>
        </div>

        {/* Metric Selector Pills */}
        <div
          id="chart-metric-selector"
          className={`flex items-center p-1 rounded-xl border text-xs font-mono font-medium ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-purple-100/70 border-purple-200'
          }`}
        >
          <button
            id="metric-temp-btn"
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              activeMetric === 'temp'
                ? theme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-white text-purple-950 border border-purple-300 font-bold shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-stone-700 hover:text-purple-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temp</span>
          </button>

          <button
            id="metric-rain-btn"
            onClick={() => setActiveMetric('rain')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              activeMetric === 'rain'
                ? theme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-white text-purple-950 border border-purple-300 font-bold shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-stone-700 hover:text-purple-900'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain %</span>
          </button>

          <button
            id="metric-wind-btn"
            onClick={() => setActiveMetric('wind')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
              activeMetric === 'wind'
                ? theme === 'dark'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-white text-purple-950 border border-purple-300 font-bold shadow-sm'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-stone-700 hover:text-purple-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </button>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-56 sm:h-64 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
            No telemetry regression samples available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
            >
              <defs>
                <linearGradient id="atmosphericGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricConfig.fillStart} />
                  <stop offset="100%" stopColor={metricConfig.fillEnd} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? 'rgba(51, 65, 85, 0.25)' : 'rgba(226, 232, 240, 0.7)'}
                vertical={false}
              />

              <XAxis
                dataKey="timeLabel"
                stroke={theme === 'dark' ? '#64748B' : '#94A3B8'}
                tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                tickLine={false}
                axisLine={{ stroke: theme === 'dark' ? '#1E293B' : '#E2E8F0' }}
              />

              <YAxis
                domain={[minVal, maxVal]}
                stroke={theme === 'dark' ? '#64748B' : '#94A3B8'}
                tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                tickLine={false}
                axisLine={false}
                unit={activeMetric === 'rain' ? '%' : `°`}
              />

              <Tooltip
                content={<CustomTooltip unit={unit} theme={theme} activeMetric={activeMetric} />}
              />

              <Area
                type="monotone"
                dataKey={metricConfig.dataKey}
                stroke={metricConfig.stroke}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#atmosphericGradient)"
                activeDot={{
                  r: 5,
                  fill: metricConfig.stroke,
                  stroke: '#020617',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini quick-hour scroller pill cards below chart */}
      <div
        className={`mt-4 pt-3.5 border-t flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none ${
          theme === 'dark' ? 'border-slate-800/80' : 'border-purple-200/80'
        }`}
      >
        {chartData.map((item, idx) => (
          <div
            key={idx}
            className={`shrink-0 px-3 py-2 rounded-xl text-center border transition-all ${
              idx === 0
                ? theme === 'dark'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                  : 'bg-purple-100 border-purple-300 text-purple-950 font-bold shadow-xs'
                : theme === 'dark'
                ? 'bg-slate-900/50 border-slate-800/70 text-slate-300 hover:border-slate-700'
                : 'bg-white/90 border-purple-100 text-slate-900 shadow-xs'
            }`}
          >
            <div
              className={`text-[10px] font-mono mb-0.5 font-semibold ${
                theme === 'dark' ? 'text-slate-400' : 'text-stone-600'
              }`}
            >
              {item.timeLabel}
            </div>
            <div
              className={`text-xs font-mono font-bold ${
                theme === 'dark' ? 'text-slate-100' : 'text-slate-950'
              }`}
            >
              {activeMetric === 'temp' && `${item.temp}°`}
              {activeMetric === 'rain' && `${item.chanceOfRain}%`}
              {activeMetric === 'wind' && `${item.windSpeed}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit: TemperatureUnit;
  theme: ThemeMode;
  activeMetric: ChartMetric;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  unit,
  theme,
}) => {
  if (!active || !payload || !payload.length) return null;

  const data: HourlyChartDataPoint = payload[0].payload;

  return (
    <div
      className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-xl text-xs font-mono min-w-[170px] ${
        theme === 'dark'
          ? 'bg-[#0b1326]/95 border-cyan-500/30 text-slate-200'
          : 'bg-white/98 border-purple-200 text-slate-900 shadow-lg'
      }`}
    >
      <div
        className={`flex items-center justify-between font-semibold pb-1.5 mb-2 border-b ${
          theme === 'dark' ? 'border-slate-800' : 'border-purple-100'
        }`}
      >
        <span
          className={`font-bold ${
            theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
          }`}
        >
          {data.timeLabel}
        </span>
        <span
          className={`text-[10px] ${
            theme === 'dark' ? 'text-slate-400' : 'text-stone-600 font-medium'
          }`}
        >
          {formatTimeOnly(data.fullTime)}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-stone-600'}>
            Condition:
          </span>
          <span className="font-sans font-medium text-right capitalize truncate max-w-[100px]">
            {data.condition}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-stone-600'}>
            Temp:
          </span>
          <span
            className={`font-bold ${
              theme === 'dark' ? 'text-cyan-400' : 'text-purple-700 font-bold'
            }`}
          >
            {data.temp}°{unit}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-stone-600'}>
            Feels Like:
          </span>
          <span className="font-semibold">
            {data.feelsLike}°{unit}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-stone-600'}>
            Rain %:
          </span>
          <span
            className={
              data.chanceOfRain > 30
                ? theme === 'dark'
                  ? 'text-cyan-400 font-bold'
                  : 'text-indigo-600 font-bold'
                : 'font-semibold'
            }
          >
            {data.chanceOfRain}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={theme === 'dark' ? 'text-slate-400' : 'text-stone-600'}>
            Wind:
          </span>
          <span className="font-semibold">
            {data.windSpeed} {unit === 'C' ? 'km/h' : 'mph'}
          </span>
        </div>
      </div>
    </div>
  );
};

