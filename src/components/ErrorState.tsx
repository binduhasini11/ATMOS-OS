import React from 'react';
import { AlertCircle, RefreshCw, MapPin } from 'lucide-react';
import { ThemeMode } from '../types';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
  onSelectPreset?: (lat: number, lon: number, name: string) => void;
  theme: ThemeMode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load weather data',
  message,
  onRetry,
  onSelectPreset,
  theme,
}) => {
  const isDark = theme === 'dark';

  const presets = [
    { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'India' },
    { name: 'London', lat: 51.5171, lon: -0.1062, country: 'UK' },
    { name: 'New York', lat: 40.7128, lon: -74.006, country: 'USA' },
    { name: 'Tokyo', lat: 35.6895, lon: 139.6917, country: 'Japan' },
  ];

  return (
    <div id="weather-error-state-card" className="py-16 max-w-lg mx-auto text-center px-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5 ${
          isDark ? 'bg-slate-800 text-slate-400' : 'bg-stone-200 text-stone-500'
        }`}
      >
        <AlertCircle className="w-6 h-6" />
      </div>

      <h2
        className={`text-xl font-light mb-2 ${
          isDark ? 'text-slate-200' : 'text-slate-800'
        }`}
      >
        {title}
      </h2>

      <p
        className={`text-sm font-light mb-8 leading-relaxed ${
          isDark ? 'text-slate-500' : 'text-stone-500'
        }`}
      >
        {message}
      </p>

      <button
        id="error-retry-btn"
        onClick={onRetry}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            : 'bg-stone-800 hover:bg-stone-900 text-white'
        }`}
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>

      {onSelectPreset && (
        <div className="mt-10">
          <p
            className={`text-[11px] font-mono tracking-widest uppercase mb-3 ${
              isDark ? 'text-slate-600' : 'text-stone-400'
            }`}
          >
            Or try a location
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onSelectPreset(preset.lat, preset.lon, `${preset.name}, ${preset.country}`)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-light border transition-colors ${
                  isDark
                    ? 'border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    : 'border-stone-300 text-stone-600 hover:text-slate-800 hover:border-stone-400'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
