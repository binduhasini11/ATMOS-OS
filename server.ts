import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Config status endpoint
  app.get('/api/weather/config-status', (_req: Request, res: Response) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const hasApiKey = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_WEATHER_API_KEY');
    res.json({
      hasApiKey,
      message: hasApiKey
        ? 'WeatherAPI key configured successfully.'
        : 'WEATHER_API_KEY is not configured yet. Fallback data will be available.',
    });
  });

  // Search Endpoint
  app.get('/api/weather/search', async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const isApiKeyConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_WEATHER_API_KEY');

    if (isApiKeyConfigured) {
      try {
        const response = await fetch(
          `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query.trim())}`
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return res.status(response.status).json({
            error: errData.error?.message || `WeatherAPI returned status ${response.status}`,
          });
        }

        const data = await response.json();
        return res.json(data);
      } catch (err: any) {
        console.error('Weather search API error:', err);
        return res.status(500).json({ error: 'Failed to fetch search results from WeatherAPI: ' + (err.message || '') });
      }
    }

    // Fallback search suggestions when API key is not configured
    const fallbackLocations = [
      { id: 1, name: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946, url: 'bengaluru-karnataka-india' },
      { id: 2, name: 'London', region: 'City of London, Greater London', country: 'United Kingdom', lat: 51.5171, lon: -0.1062, url: 'london-city-of-london-greater-london-united-kingdom' },
      { id: 3, name: 'New York', region: 'New York', country: 'United States of America', lat: 40.7128, lon: -74.006, url: 'new-york-new-york-united-states-of-america' },
      { id: 4, name: 'Tokyo', region: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917, url: 'tokyo-tokyo-japan' },
      { id: 5, name: 'Paris', region: 'Ile-de-France', country: 'France', lat: 48.8534, lon: 2.3488, url: 'paris-ile-de-france-france' },
      { id: 6, name: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093, url: 'sydney-new-south-wales-australia' },
      { id: 7, name: 'San Francisco', region: 'California', country: 'United States of America', lat: 37.7749, lon: -122.4194, url: 'san-francisco-california-united-states-of-america' },
      { id: 8, name: 'Singapore', region: 'Singapore', country: 'Singapore', lat: 1.2897, lon: 103.8501, url: 'singapore-singapore-singapore' },
      { id: 9, name: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, url: 'dubai-dubai-united-arab-emirates' },
      { id: 10, name: 'Berlin', region: 'Berlin', country: 'Germany', lat: 52.5244, lon: 13.4105, url: 'berlin-berlin-germany' },
      { id: 11, name: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.076, lon: 72.8777, url: 'mumbai-maharashtra-india' },
      { id: 12, name: 'Seattle', region: 'Washington', country: 'United States of America', lat: 47.6062, lon: -122.3321, url: 'seattle-washington-united-states-of-america' },
    ];

    const qLower = query.toLowerCase().trim();
    const filtered = fallbackLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(qLower) ||
        loc.region.toLowerCase().includes(qLower) ||
        loc.country.toLowerCase().includes(qLower)
    );

    if (filtered.length === 0 && qLower.length >= 2) {
      // Create a dynamic result for the query so search works smoothly
      filtered.push({
        id: Math.floor(Math.random() * 100000),
        name: query.charAt(0).toUpperCase() + query.slice(1),
        region: 'Observatory Region',
        country: 'Global Station',
        lat: 25.0,
        lon: 10.0,
        url: `${qLower}-station`,
      });
    }

    return res.json(filtered);
  });

  // Forecast Endpoint
  app.get('/api/weather/forecast', async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 5;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter "q" (city name or "lat,lon") is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const isApiKeyConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_WEATHER_API_KEY');

    if (isApiKeyConfigured) {
      try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query.trim())}&days=${days}&aqi=yes&alerts=yes`;
        const response = await fetch(url);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          return res.status(response.status).json({
            error: errData.error?.message || `WeatherAPI returned status ${response.status}`,
          });
        }

        const data = await response.json();
        return res.json(data);
      } catch (err: any) {
        console.error('Weather forecast API error:', err);
        return res.status(500).json({ error: 'Failed to fetch weather forecast from WeatherAPI: ' + (err.message || '') });
      }
    }

    // High fidelity fallback generator
    const fallbackData = generateFallbackWeatherData(query);
    return res.json(fallbackData);
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atmospheric Weather Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackWeatherData(query: string) {
  let cityName = 'Bengaluru';
  let regionName = 'Karnataka';
  let countryName = 'India';
  let lat = 12.9716;
  let lon = 77.5946;

  if (query.includes(',')) {
    const [qLat, qLon] = query.split(',').map((s) => parseFloat(s.trim()));
    if (!isNaN(qLat) && !isNaN(qLon)) {
      lat = qLat;
      lon = qLon;
      cityName = `Station (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
      regionName = 'Atmospheric Grid';
      countryName = 'Earth Coordinates';
    }
  } else if (query.toLowerCase().includes('london')) {
    cityName = 'London';
    regionName = 'City of London';
    countryName = 'United Kingdom';
    lat = 51.5171;
    lon = -0.1062;
  } else if (query.toLowerCase().includes('new york')) {
    cityName = 'New York';
    regionName = 'New York';
    countryName = 'United States of America';
    lat = 40.7128;
    lon = -74.006;
  } else if (query.toLowerCase().includes('tokyo')) {
    cityName = 'Tokyo';
    regionName = 'Tokyo';
    countryName = 'Japan';
    lat = 35.6895;
    lon = 139.6917;
  } else if (query.toLowerCase().includes('paris')) {
    cityName = 'Paris';
    regionName = 'Ile-de-France';
    countryName = 'France';
    lat = 48.8534;
    lon = 2.3488;
  } else {
    cityName = query.charAt(0).toUpperCase() + query.slice(1);
    regionName = 'Meteorological Station';
    countryName = 'Observatory';
  }

  const now = new Date();
  const currentHour = now.getHours();
  const baseTempC = 24;

  const forecastDays = [];
  for (let d = 0; d < 5; d++) {
    const dateObj = new Date(now);
    dateObj.setDate(now.getDate() + d);
    const dateStr = dateObj.toISOString().split('T')[0];
    const dayTempMax = Math.round(baseTempC + 4 + Math.sin(d) * 3);
    const dayTempMin = Math.round(baseTempC - 5 + Math.cos(d) * 2);

    const hours = [];
    for (let h = 0; h < 24; h++) {
      const timeStr = `${dateStr} ${String(h).padStart(2, '0')}:00`;
      const diurnalOffset = Math.sin(((h - 6) / 24) * 2 * Math.PI) * 6;
      const hourTempC = Math.round((dayTempMin + (dayTempMax - dayTempMin) * 0.7 + diurnalOffset) * 10) / 10;
      const isDay = h >= 6 && h <= 18 ? 1 : 0;
      const chanceOfRain = Math.max(5, Math.min(85, Math.round(20 + Math.sin(h + d) * 30)));

      hours.push({
        time_epoch: Math.floor(dateObj.getTime() / 1000) + h * 3600,
        time: timeStr,
        temp_c: hourTempC,
        temp_f: Math.round((hourTempC * 1.8 + 32) * 10) / 10,
        is_day: isDay,
        condition: {
          text: chanceOfRain > 50 ? 'Patchy light rain' : isDay ? 'Partly cloudy' : 'Clear',
          icon: chanceOfRain > 50 ? '//cdn.weatherapi.com/weather/64x64/day/176.png' : isDay ? '//cdn.weatherapi.com/weather/64x64/day/116.png' : '//cdn.weatherapi.com/weather/64x64/night/113.png',
          code: chanceOfRain > 50 ? 1063 : 1003,
        },
        wind_mph: Math.round((7 + Math.sin(h) * 4) * 10) / 10,
        wind_kph: Math.round((11 + Math.sin(h) * 6) * 10) / 10,
        wind_degree: (140 + h * 5) % 360,
        wind_dir: 'SE',
        pressure_mb: 1014 + Math.round(Math.cos(h) * 3),
        pressure_in: 29.94,
        precip_mm: chanceOfRain > 50 ? 0.8 : 0,
        precip_in: chanceOfRain > 50 ? 0.03 : 0,
        humidity: Math.round(62 + Math.cos(h) * 15),
        cloud: chanceOfRain > 50 ? 65 : 25,
        feelslike_c: Math.round((hourTempC + 1.2) * 10) / 10,
        feelslike_f: Math.round(((hourTempC + 1.2) * 1.8 + 32) * 10) / 10,
        windchill_c: hourTempC,
        windchill_f: Math.round((hourTempC * 1.8 + 32) * 10) / 10,
        heatindex_c: hourTempC + 1,
        heatindex_f: Math.round(((hourTempC + 1) * 1.8 + 32) * 10) / 10,
        dewpoint_c: 16.5,
        dewpoint_f: 61.7,
        will_it_rain: chanceOfRain > 50 ? 1 : 0,
        chance_of_rain: chanceOfRain,
        will_it_snow: 0,
        chance_of_snow: 0,
        vis_km: 10,
        vis_miles: 6,
        gust_mph: 12,
        gust_kph: 19.3,
        uv: isDay ? Math.max(1, Math.min(9, Math.round(7 * Math.sin(((h - 6) / 12) * Math.PI)))) : 0,
      });
    }

    forecastDays.push({
      date: dateStr,
      date_epoch: Math.floor(dateObj.getTime() / 1000),
      day: {
        maxtemp_c: dayTempMax,
        maxtemp_f: Math.round((dayTempMax * 1.8 + 32) * 10) / 10,
        mintemp_c: dayTempMin,
        mintemp_f: Math.round((dayTempMin * 1.8 + 32) * 10) / 10,
        avgtemp_c: Math.round(((dayTempMax + dayTempMin) / 2) * 10) / 10,
        avgtemp_f: Math.round((((dayTempMax + dayTempMin) / 2) * 1.8 + 32) * 10) / 10,
        maxwind_mph: 12.5,
        maxwind_kph: 20.1,
        totalprecip_mm: d % 2 === 0 ? 1.2 : 0,
        totalprecip_in: d % 2 === 0 ? 0.05 : 0,
        totalsnow_cm: 0,
        avgvis_km: 10,
        avgvis_miles: 6,
        avghumidity: 65,
        daily_will_it_rain: d % 2 === 0 ? 1 : 0,
        daily_chance_of_rain: d % 2 === 0 ? 45 : 15,
        daily_will_it_snow: 0,
        daily_chance_of_snow: 0,
        condition: {
          text: d % 2 === 0 ? 'Partly cloudy with isolated showers' : 'Sunny and clear',
          icon: d % 2 === 0 ? '//cdn.weatherapi.com/weather/64x64/day/176.png' : '//cdn.weatherapi.com/weather/64x64/day/113.png',
          code: d % 2 === 0 ? 1063 : 1000,
        },
        uv: 7,
      },
      astro: {
        sunrise: '06:12 AM',
        sunset: '06:34 PM',
        moonrise: '08:45 PM',
        moonset: '07:22 AM',
        moon_phase: 'Waxing Gibbous',
        moon_illumination: '78',
        is_moon_up: 1,
        is_sun_up: 1,
      },
      hour: hours,
    });
  }

  return {
    isFallbackDemo: true,
    location: {
      name: cityName,
      region: regionName,
      country: countryName,
      lat: lat,
      lon: lon,
      tz_id: 'Asia/Kolkata',
      localtime_epoch: Math.floor(now.getTime() / 1000),
      localtime: `${now.toISOString().split('T')[0]} ${String(currentHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    },
    current: {
      last_updated_epoch: Math.floor(now.getTime() / 1000),
      last_updated: `${now.toISOString().split('T')[0]} ${String(currentHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      temp_c: baseTempC,
      temp_f: Math.round((baseTempC * 1.8 + 32) * 10) / 10,
      is_day: currentHour >= 6 && currentHour <= 18 ? 1 : 0,
      condition: {
        text: 'Partly cloudy',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
        code: 1003,
      },
      wind_mph: 8.5,
      wind_kph: 13.7,
      wind_degree: 160,
      wind_dir: 'SSE',
      pressure_mb: 1013,
      pressure_in: 29.91,
      precip_mm: 0.2,
      precip_in: 0.01,
      humidity: 58,
      cloud: 35,
      feelslike_c: 25.2,
      feelslike_f: 77.4,
      vis_km: 10,
      vis_miles: 6,
      uv: 6,
      gust_mph: 11.2,
      gust_kph: 18.0,
      air_quality: {
        co: 245.3,
        no2: 12.8,
        o3: 45.2,
        so2: 4.1,
        pm2_5: 18.4,
        pm10: 34.6,
        'us-epa-index': 2,
        'gb-defra-index': 2,
      },
    },
    forecast: {
      forecastday: forecastDays,
    },
    alerts: {
      alert: [],
    },
  };
}

startServer();
