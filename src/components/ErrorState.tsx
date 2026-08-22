import React from 'react';
import { AlertCircle, RefreshCw, Compass, MapPin, Globe } from 'lucide-react';
import { ThemeMode } from '../types';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
  onSelectPreset?: (lat: number, lon: number, name: string) => void;
  theme: ThemeMode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Meteorological Station Telemetry Error',
  message,
  onRetry,
  onSelectPreset,
  theme,
}) => {
  const presets = [
    { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'India' },
    { name: 'London', lat: 51.5171, lon: -0.1062, country: 'UK' },
    { name: 'New York', lat: 40.7128, lon: -74.006, country: 'USA' },
    { name: 'Tokyo', lat: 35.6895, lon: 139.6917, country: 'Japan' },
  ];

  return (
    <div
      id="weather-error-state-card"
      className="max-w-3xl mx-auto px-4 py-12"
    >
      <div
        className={`rounded-2xl border p-8 text-center transition-all shadow-xl ${
          theme === 'dark'
            ? 'bg-[#10192B]/95 border-rose-500/30 text-slate-100 shadow-2xl'
            : 'bg-gradient-to-br from-[#faf7ff] via-[#f5efff] to-[#fcf9fe] border-rose-200 text-slate-900 shadow-md'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-5">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2
          className={`text-xl font-bold font-sans tracking-tight mb-2 ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-950 font-extrabold'
          }`}
        >
          {title}
        </h2>

        <p
          className={`text-sm font-sans max-w-lg mx-auto mb-6 leading-relaxed ${
            theme === 'dark' ? 'text-slate-400' : 'text-stone-700 font-medium'
          }`}
        >
          {message}
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="error-retry-btn"
            onClick={onRetry}
            className={`px-5 py-2.5 rounded-xl font-bold font-sans text-sm flex items-center gap-2 transition-all shadow-md ${
              theme === 'dark'
                ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                : 'bg-purple-900 hover:bg-purple-950 text-white shadow-purple-900/20'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Observation</span>
          </button>
        </div>

        {/* Recommended Stations Fallback */}
        {onSelectPreset && (
          <div
            className={`mt-8 pt-6 border-t ${
              theme === 'dark' ? 'border-slate-800/80' : 'border-purple-200/80'
            }`}
          >
            <div
              className={`text-xs font-mono mb-3 flex items-center justify-center gap-1.5 font-semibold ${
                theme === 'dark' ? 'text-slate-400' : 'text-stone-700'
              }`}
            >
              <Globe
                className={`w-3.5 h-3.5 ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-700'
                }`}
              />
              <span>Or connect to a verified global observatory:</span>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    onSelectPreset(
                      preset.lat,
                      preset.lon,
                      `${preset.name}, ${preset.country}`
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium font-sans flex items-center gap-1.5 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300'
                      : 'bg-white border-purple-200 text-slate-900 hover:border-purple-400 hover:bg-purple-50 shadow-xs'
                  }`}
                >
                  <MapPin
                    className={`w-3 h-3 ${
                      theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'
                    }`}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
