import { SearchLocationResult, WeatherApiResponse } from '../types';

export class WeatherApiError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'WeatherApiError';
    this.status = status;
    this.code = code;
  }
}

export async function checkConfigStatus(): Promise<{ hasApiKey: boolean; message: string }> {
  try {
    const res = await fetch('/api/weather/config-status');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Could not check config status:', e);
  }
  return { hasApiKey: false, message: 'Server unreachable' };
}

export async function searchCities(
  query: string,
  signal?: AbortSignal
): Promise<SearchLocationResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const url = `/api/weather/search?q=${encodeURIComponent(trimmed)}`;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new WeatherApiError(
      errData.error || `Search failed with status ${res.status}`,
      res.status
    );
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data;
}

export async function getWeatherForecast(
  query: string,
  days: number = 5,
  signal?: AbortSignal
): Promise<WeatherApiResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new WeatherApiError('Location query cannot be empty');
  }

  const url = `/api/weather/forecast?q=${encodeURIComponent(trimmed)}&days=${days}`;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData.error || `Failed to fetch forecast (HTTP ${res.status})`;
    throw new WeatherApiError(message, res.status);
  }

  const data: WeatherApiResponse = await res.json();
  return data;
}
