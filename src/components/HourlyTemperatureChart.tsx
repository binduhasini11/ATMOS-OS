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
import { CloudRain, Thermometer, Wind } from 'lucide-react';
import { ForecastDay, HourlyChartDataPoint, TemperatureUnit, ThemeMode } from '../types';
import { WeatherIcon } from '../utils/weatherIcons';

interface HourlyTemperatureChartProps {
  forecastDays: ForecastDay[];
  localTimeString: string;
  unit: TemperatureUnit;
  theme: ThemeMode;
}

type ChartMetric = 'temp' | 'rain' | 'wind';

export const HourlyTemperatureChart: React.FC<HourlyTemperatureChartProps> = ({
  forecastDays, localTimeString, unit, theme,
}) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temp');
  const isDark = theme === 'dark';

  const chartData: HourlyChartDataPoint[] = useMemo(() => {
    if (!forecastDays || forecastDays.length === 0) return [];
    let currentHourIndex = 0;
    try {
      if (localTimeString?.includes(' ')) {
        const [h] = localTimeString.split(' ')[1].split(':');
        currentHourIndex = parseInt(h, 10) || 0;
      } else {
        currentHourIndex = new Date().getHours();
      }
    } catch { currentHourIndex = new Date().getHours(); }

    const todayHours = forecastDays[0]?.hour || [];
    const tomorrowHours = forecastDays[1]?.hour || [];
    const combinedHours = [
      ...todayHours.slice(currentHourIndex),
      ...tomorrowHours.slice(0, Math.max(0, 18 - (todayHours.length - currentHourIndex))),
    ].slice(0, 18);

    return combinedHours.map((h, idx) => {
      const tempVal = unit === 'C' ? h.temp_c : h.temp_f;
      const feelsLikeVal = unit === 'C' ? h.feelslike_c : h.feelslike_f;
      const windVal = unit === 'C' ? h.wind_kph : h.wind_mph;
      let timeLabel = idx === 0 ? 'Now' : (() => {
        const hourStr = h.time.split(' ')[1] || h.time;
        const hr = parseInt(hourStr.split(':')[0], 10);
        return `${hr % 12 === 0 ? 12 : hr % 12} ${hr >= 12 ? 'PM' : 'AM'}`;
      })();
      return {
        timeLabel, fullTime: h.time,
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

  const { minVal, maxVal } = useMemo(() => {
    if (chartData.length === 0) return { minVal: 0, maxVal: 100 };
    if (activeMetric === 'rain') return { minVal: 0, maxVal: 100 };
    const key = activeMetric === 'temp' ? 'temp' : 'windSpeed';
    const values = chartData.map((d) => d[key]);
    const padding = activeMetric === 'temp' ? 2 : 5;
    return {
      minVal: Math.floor(Math.min(...values) - padding),
      maxVal: Math.ceil(Math.max(...values) + padding),
    };
  }, [chartData, activeMetric]);

  // metric colours — richer in light mode
  const metricConfig = {
    temp: {
      dataKey: 'temp',
      stroke: isDark ? '#22D3EE' : '#3b82f6',
      fillStart: isDark ? 'rgba(34,211,238,0.15)' : 'rgba(59,130,246,0.14)',
      fillEnd: 'rgba(0,0,0,0)',
    },
    rain: {
      dataKey: 'chanceOfRain',
      stroke: isDark ? '#38BDF8' : '#6366f1',
      fillStart: isDark ? 'rgba(56,189,248,0.15)' : 'rgba(99,102,241,0.12)',
      fillEnd: 'rgba(0,0,0,0)',
    },
    wind: {
      dataKey: 'windSpeed',
      stroke: isDark ? '#34D399' : '#14b8a6',
      fillStart: isDark ? 'rgba(52,211,153,0.15)' : 'rgba(20,184,166,0.12)',
      fillEnd: 'rgba(0,0,0,0)',
    },
  }[activeMetric];

  const metrics: { key: ChartMetric; label: string; Icon: React.ElementType }[] = [
    { key: 'temp',  label: 'Temperature', Icon: Thermometer },
    { key: 'rain',  label: 'Rain %',      Icon: CloudRain   },
    { key: 'wind',  label: 'Wind',        Icon: Wind        },
  ];

  const metricLabels: Record<ChartMetric, string> = {
    temp: 'air temperature',
    rain: 'precipitation chance',
    wind: unit === 'C' ? 'wind speed km/h' : 'wind speed mph',
  };

  const tickFill   = isDark ? '#475569' : '#94a3b8';
  const gridStroke = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(99,130,190,0.1)';

  return (
    <div
      id="hourly-forecast-chart-card"
      className={`rounded-2xl border ${
        isDark
          ? 'atmos-card-dark border-white/[0.07] text-slate-100'
          : 'atmos-card-light border-blue-100 text-slate-900 shadow-md shadow-blue-100/50'
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <div className={`text-[9px] font-mono tracking-widest uppercase font-semibold mb-1.5 ${
              isDark ? 'text-slate-500' : 'text-indigo-400'
            }`}>
              THE NEXT 12 HOURS
            </div>
            <h2 className={`text-2xl sm:text-3xl font-light tracking-tight ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              {activeMetric === 'temp' ? 'Temperature trace'
                : activeMetric === 'rain' ? 'Precipitation chance'
                : 'Wind speed'}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* dot + label */}
            <div className="flex items-center gap-1.5 mr-1">
              <div className="w-2 h-2 rounded-full" style={{ background: metricConfig.stroke }} />
              <span className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {metricLabels[activeMetric]}
              </span>
            </div>

            {/* metric pill selector */}
            <div
              id="chart-metric-selector"
              className={`flex items-center gap-0.5 p-0.5 rounded-lg border text-[11px] font-mono ${
                isDark
                  ? 'bg-slate-900/60 border-slate-700/60'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {metrics.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  id={`metric-${key}-btn`}
                  onClick={() => setActiveMetric(key)}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
                    activeMetric === key
                      ? isDark
                        ? 'bg-slate-700 text-slate-100'
                        : 'bg-white text-indigo-700 shadow-sm border border-blue-200 font-semibold'
                      : isDark
                      ? 'text-slate-500 hover:text-slate-300'
                      : 'text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-52 sm:h-64 w-full">
          {chartData.length === 0 ? (
            <div className={`h-full flex items-center justify-center text-sm font-mono ${
              isDark ? 'text-slate-600' : 'text-slate-400'
            }`}>No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={metricConfig.fillStart} />
                    <stop offset="100%" stopColor={metricConfig.fillEnd}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="timeLabel" stroke="transparent" tickLine={false} axisLine={false}
                  tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: tickFill }}
                />
                <YAxis
                  domain={[minVal, maxVal]} stroke="transparent" tickLine={false} axisLine={false}
                  unit={activeMetric === 'rain' ? '%' : '°'}
                  tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', fill: tickFill }}
                />
                <Tooltip content={<CustomTooltip unit={unit} theme={theme} activeMetric={activeMetric} />} />
                <Area
                  type="monotone" dataKey={metricConfig.dataKey}
                  stroke={metricConfig.stroke} strokeWidth={2}
                  fillOpacity={1} fill="url(#chartGrad)"
                  dot={{ r: 2.5, fill: metricConfig.stroke, strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: metricConfig.stroke, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Hourly strip */}
        <div className={`mt-4 pt-4 border-t flex items-end gap-4 overflow-x-auto pb-1 scrollbar-none ${
          isDark ? 'border-slate-800/60' : 'border-blue-100'
        }`}>
          {chartData.map((item, idx) => (
            <div
              key={idx}
              className={`shrink-0 flex flex-col items-center gap-1.5 min-w-[44px] transition-opacity ${
                idx === 0 ? 'opacity-100'
                  : isDark ? 'opacity-55 hover:opacity-90' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {item.timeLabel}
              </span>
              <WeatherIcon conditionText={item.condition} isDay={item.isDay} className="w-4 h-4" />
              <span className={`text-[11px] font-mono font-medium ${
                idx === 0
                  ? isDark ? 'text-slate-100' : 'text-indigo-700'
                  : isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {activeMetric === 'temp' && `${item.temp}°`}
                {activeMetric === 'rain' && `${item.chanceOfRain}%`}
                {activeMetric === 'wind' && `${item.windSpeed}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Tooltip ──────────────────────────────────────── */
interface CustomTooltipProps {
  active?: boolean; payload?: any[]; label?: string;
  unit: TemperatureUnit; theme: ThemeMode; activeMetric: ChartMetric;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, unit, theme }) => {
  if (!active || !payload?.length) return null;
  const data: HourlyChartDataPoint = payload[0].payload;
  const isDark = theme === 'dark';
  return (
    <div className={`p-3 rounded-xl border shadow-lg text-xs font-mono min-w-[160px] ${
      isDark
        ? 'bg-slate-900 border-slate-700 text-slate-200'
        : 'bg-white border-blue-200 text-slate-800 shadow-blue-100'
    }`}>
      <div className={`font-semibold mb-2 pb-1.5 border-b text-sm ${
        isDark ? 'border-slate-700 text-slate-100' : 'border-blue-100 text-indigo-700'
      }`}>{data.timeLabel}</div>
      <div className="space-y-1">
        {[
          ['Temp',  `${data.temp}°${unit}`],
          ['Feels', `${data.feelsLike}°${unit}`],
          ['Rain',  `${data.chanceOfRain}%`],
          ['Wind',  `${data.windSpeed} ${unit === 'C' ? 'km/h' : 'mph'}`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{k}</span>
            <span className="font-semibold">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
