# ATMOS-OS 🌤️
### Atmospheric Observation System

Live Site link: https://atmos-os.onrender.com/

ATMOS-OS is a modern, responsive weather dashboard that provides real-time weather information through a clean and minimal interface. It allows users to search for locations, view detailed weather conditions and forecasts, save favorite locations, and personalize their experience.

## ✨ Features

* 🌡️ **Current Weather** — Temperature, weather condition, humidity, wind, pressure, visibility, and other atmospheric details.
* 📊 **Hourly Temperature Chart** — Interactive visualization of upcoming temperature changes.
* 🌧️ **Rain & Precipitation Data** — View precipitation-related weather information.
* 💨 **Wind Information** — Monitor wind speed and direction.
* 📅 **5-Day Forecast** — View upcoming weather conditions and temperatures.
* 🔍 **Location Search** — Search for cities and locations to view their weather.
* 📍 **Current Location** — Get weather information based on your current location.
* ⭐ **Favorite Cities** — Pin frequently accessed locations for quick access.
* 🌡️ **Temperature Units** — Switch between Celsius and Fahrenheit.
* 🌙 **Dark & Light Mode** — Choose between dark and warm muted light themes.
* 💾 **Persistent Preferences** — Favorites and display preferences are stored locally and retained after refresh.
* 📱 **Responsive Design** — Works across desktop, tablet, and mobile devices.
* ⚡ **Loading & Error States** — Clear feedback while data is loading or when an error occurs.

## 🛠️ Tech Stack

* **React 19**
* **TypeScript**
* **Vite**
* **Express**
* **Tailwind CSS**
* **Recharts**
* **Lucide React**
* **Motion**
* **WeatherAPI**
* **Google Gemini API**

## 📁 Project Structure

```text
ATMOS-OS/
│
├── .aistudio/
│   └── .gitignore
│
├── dist/
│   ├── assets/
│   ├── index.html
│   ├── server.cjs
│   └── server.cjs.map
│
├── src/
│   ├── components/
│   │   ├── AtmosphericDetails.tsx
│   │   ├── CurrentWeatherCard.tsx
│   │   ├── ErrorState.tsx
│   │   ├── FavoritesBar.tsx
│   │   ├── FiveDayForecast.tsx
│   │   ├── Header.tsx
│   │   ├── HourlyTemperatureChart.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── services/
│   │   └── weatherApi.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── weatherIcons.tsx
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── .env
├── .env.example
├── .gitignore
├── bun.lock
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

## 🧩 Project Architecture

### Components

The `src/components/` directory contains the main UI components:

* **CurrentWeatherCard** — Displays current weather conditions.
* **AtmosphericDetails** — Displays additional atmospheric information.
* **HourlyTemperatureChart** — Visualizes hourly temperature trends.
* **FiveDayForecast** — Displays the upcoming five-day forecast.
* **FavoritesBar** — Manages and displays favorite locations.
* **Header** — Main application header and controls.
* **Sidebar** — Navigation and additional controls.
* **LoadingSkeleton** — Loading-state UI.
* **ErrorState** — Error and retry UI.

### Services

`src/services/weatherApi.ts` handles communication with the weather service and keeps API-related logic separate from the UI components.

### Utilities

`src/utils/` contains reusable helpers for:

* Weather icon mapping
* Data formatting
* Display transformations

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* [Node.js](https://nodejs.org/)
* npm
* A WeatherAPI API key
* A Google Gemini API key if Gemini functionality is enabled

### 1. Clone the repository

```bash
git clone https://github.com/binduhasini11/ATMOS-OS.git
cd ATMOS-OS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the required API keys.

```env
WEATHER_API_KEY=your_weather_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Refer to `.env.example` for the required configuration.

**Never commit your `.env` file or expose API keys publicly.**

### 4. Run the application locally

```bash
npm run dev
```

The application will be available at the local development URL shown in the terminal.

## 📦 Production Build

Create an optimized production build with:

```bash
npm run build
```

To run the production application:

```bash
npm start
```

## 🌐 Deployment

ATMOS-OS can be deployed using platforms such as **Render**.

For deployment:

1. Connect the GitHub repository to your hosting platform.
2. Configure the required environment variables.
3. Use the appropriate Node.js build and start commands.
4. Enable automatic deployment from the `main` branch if desired.

Every new commit pushed to the configured branch can then trigger a new deployment.

## 🔐 Environment Variables

Environment variables should be configured locally through `.env` and through the hosting platform's environment-variable settings.

Example:

```env
WEATHER_API_KEY=your_weather_api_key
GEMINI_API_KEY=your_gemini_api_key
```

The `.env` file should **never be committed to GitHub**.

## 🎨 Design Philosophy

ATMOS-OS focuses on a clean and distraction-free weather experience.

The interface uses:

* Minimal visual clutter
* Clear information hierarchy
* Responsive layouts
* Subtle animations
* Dark and muted light themes
* Interactive weather visualizations
* Consistent typography and spacing

The goal is to present detailed weather information without overwhelming the user.

## 🔮 Future Improvements

Potential future enhancements include:

* Extended hourly forecasts
* Weather alerts and severe-weather notifications
* Air-quality monitoring
* More detailed precipitation and wind visualizations
* Weather maps
* Historical weather analysis
* Progressive Web App support
* Improved accessibility

## 👩‍💻 Author

**Bindu Hasini B**

B.tech Computer Science & Engineering , VIT Vellore

GitHub: [@binduhasini11](https://github.com/binduhasini11)

