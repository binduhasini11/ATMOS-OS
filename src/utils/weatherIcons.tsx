import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Moon,
  CloudMoon,
  CloudDrizzle,
} from 'lucide-react';

interface WeatherIconProps {
  conditionText?: string;
  code?: number;
  isDay?: number | boolean;
  className?: string;
  iconUrl?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  conditionText = '',
  code,
  isDay = 1,
  className = 'w-8 h-8',
  iconUrl,
  size,
}) => {
  const isDaytime = Boolean(isDay);
  const text = (conditionText || '').toLowerCase();

  // If size is provided, construct style or override class
  const iconProps = {
    className,
    size: size || undefined,
    strokeWidth: 1.75,
  };

  // Thunderstorm
  if (text.includes('thunder') || text.includes('lightning') || (code && [1087, 1273, 1276, 1279, 1282].includes(code))) {
    return <CloudLightning {...iconProps} className={`${className} text-amber-400`} />;
  }

  // Snow & Sleet
  if (
    text.includes('snow') ||
    text.includes('sleet') ||
    text.includes('blizzard') ||
    text.includes('ice') ||
    (code && [1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264].includes(code))
  ) {
    return <CloudSnow {...iconProps} className={`${className} text-sky-200`} />;
  }

  // Heavy / Moderate Rain
  if (
    text.includes('heavy rain') ||
    text.includes('torrential') ||
    text.includes('shower') ||
    (code && [1189, 1192, 1195, 1243, 1246].includes(code))
  ) {
    return <CloudRain {...iconProps} className={`${className} text-cyan-400`} />;
  }

  // Drizzle / Light Rain
  if (
    text.includes('rain') ||
    text.includes('drizzle') ||
    (code && [1063, 1150, 1153, 1180, 1183, 1186, 1240].includes(code))
  ) {
    return <CloudDrizzle {...iconProps} className={`${className} text-cyan-300`} />;
  }

  // Fog / Mist / Haze
  if (
    text.includes('mist') ||
    text.includes('fog') ||
    text.includes('haze') ||
    text.includes('smoke') ||
    (code && [1030, 1135, 1147].includes(code))
  ) {
    return <CloudFog {...iconProps} className={`${className} text-slate-300`} />;
  }

  // Overcast / Cloudy
  if (text.includes('overcast') || (code && [1006, 1009].includes(code))) {
    return <Cloud {...iconProps} className={`${className} text-slate-300`} />;
  }

  // Partly Cloudy
  if (text.includes('partly') || text.includes('cloud') || (code && code === 1003)) {
    if (isDaytime) {
      return <CloudSun {...iconProps} className={`${className} text-sky-400`} />;
    }
    return <CloudMoon {...iconProps} className={`${className} text-indigo-300`} />;
  }

  // Windy
  if (text.includes('wind') || text.includes('gale')) {
    return <Wind {...iconProps} className={`${className} text-teal-300`} />;
  }

  // Clear / Sunny
  if (isDaytime) {
    return <Sun {...iconProps} className={`${className} text-amber-400`} />;
  }
  return <Moon {...iconProps} className={`${className} text-indigo-200`} />;
};
