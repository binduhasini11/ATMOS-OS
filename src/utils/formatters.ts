import { TemperatureUnit } from '../types';

export function formatTemperature(
  tempC: number | undefined,
  tempF: number | undefined,
  unit: TemperatureUnit,
  includeSymbol: boolean | 'deg' | 'full' | 'raw' = 'full'
): string {
  if (tempC === undefined && tempF === undefined) return '--';
  const val = unit === 'C' ? (tempC ?? ((tempF! - 32) * 5) / 9) : (tempF ?? (tempC! * 1.8 + 32));
  const rounded = Math.round(val);
  
  if (includeSymbol === false || includeSymbol === 'raw') {
    return `${rounded}`;
  }
  if (includeSymbol === 'deg' || includeSymbol === true) {
    // If includeSymbol is boolean true, return standard 24°
    return `${rounded}°`;
  }
  // 'full' mode: 24°C or 75°F
  return `${rounded}°${unit}`;
}

export function formatPressure(mb: number | undefined, unit: TemperatureUnit): string {
  if (mb === undefined) return '--';
  if (unit === 'C') {
    return `${Math.round(mb)} hPa`;
  }
  const inHg = (mb * 0.02953).toFixed(2);
  return `${inHg} inHg`;
}

export function formatWindSpeed(kph: number | undefined, mph: number | undefined, unit: TemperatureUnit): string {
  if (kph === undefined && mph === undefined) return '--';
  if (unit === 'C') {
    const val = kph ?? (mph! * 1.60934);
    return `${Math.round(val)} km/h`;
  }
  const val = mph ?? (kph! * 0.621371);
  return `${Math.round(val)} mph`;
}

export function formatDayName(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return 'Today';

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow =
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear();

    if (isTomorrow) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatTimeOnly(timeString: string): string {
  try {
    if (timeString.includes(' ')) {
      const parts = timeString.split(' ');
      const timePart = parts[1];
      const [h, m] = timePart.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${formattedHour}:${m} ${ampm}`;
    }
    return timeString;
  } catch {
    return timeString;
  }
}

export function getUvCategory(uv: number): { label: string; color: string; bg: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500/15' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/15' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/15' };
  if (uv <= 10) return { label: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500/15' };
  return { label: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500/15' };
}

export function getAirQualityCategory(usEpaIndex?: number): { label: string; color: string; desc: string } {
  switch (usEpaIndex) {
    case 1:
      return { label: 'Good', color: 'text-emerald-400', desc: 'Air quality is satisfactory and poses little to no risk.' };
    case 2:
      return { label: 'Moderate', color: 'text-amber-400', desc: 'Acceptable; may affect sensitive individuals.' };
    case 3:
      return { label: 'Unhealthy for Sensitive', color: 'text-orange-400', desc: 'Sensitive groups may experience health effects.' };
    case 4:
      return { label: 'Unhealthy', color: 'text-rose-400', desc: 'Everyone may begin to experience health effects.' };
    case 5:
      return { label: 'Very Unhealthy', color: 'text-purple-400', desc: 'Health alert: risk of more serious health effects.' };
    case 6:
      return { label: 'Hazardous', color: 'text-red-500', desc: 'Emergency conditions for the entire population.' };
    default:
      return { label: 'Normal', color: 'text-sky-400', desc: 'Standard atmospheric composition.' };
  }
}
