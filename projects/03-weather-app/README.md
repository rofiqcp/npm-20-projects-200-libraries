# Project 3: Weather App (API Integration)

**Complexity:** ⭐⭐  
**Duration:** 1-2 weeks  
**Database:** No Backend (API Only)  
**Level:** Mudah (Beginner)

## Overview
Build a weather application that fetches real-time weather data from OpenWeatherMap API. Learn API integration, async/await, and data visualization in React.

## Tech Stack
- **Frontend:** React + Hooks
- **API Client:** Axios
- **State Management:** useState + useEffect
- **Caching:** Browser sessionStorage
- **Charts:** Chart.js + react-chartjs-2
- **Styling:** Tailwind CSS
- **External API:** OpenWeatherMap (free tier)

## Key Features
- ✅ Current weather display
- ✅ 5-day forecast
- ✅ City search functionality
- ✅ Temperature unit toggle (°C/°F)
- ✅ Temperature trend charts
- ✅ Cache API results in sessionStorage
- ✅ Weather icons & animations
- ✅ Responsive mobile design

## Tech Dependencies
```bash
npm install react axios chart.js react-chartjs-2
npm install -D tailwindcss
```

## API Setup
- Sign up at [OpenWeatherMap](https://openweathermap.org/api) for free API key
- Free tier includes: current weather, 5-day forecast, geolocation

```javascript
// Example API call
const fetchWeather = async (city) => {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
  );
  // Cache results
  sessionStorage.setItem(`weather:${city}`, JSON.stringify(response.data));
  return response.data;
};
```

## Learning Outcomes
- API integration with Axios
- Async/await patterns
- Data caching strategies
- Chart.js for visualization
- Error handling & loading states
- Environment variables (.env)
- Temperature/weather data manipulation

## Project Structure
```
src/
├── components/
│   ├── WeatherCurrent.jsx
│   ├── WeatherForecast.jsx
│   ├── SearchBar.jsx
│   └── TemperatureChart.jsx
├── services/
│   └── weatherAPI.js
├── App.jsx
└── index.css
```

## Getting Started
```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_WEATHER_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

## Features to Add
- Geolocation API (auto-detect user location)
- Weather alerts for extreme conditions
- Save favorite cities
- Multiple language support
- Historical weather data

## Resources
- See `docs/200_POPULAR_LIBRARIES.md` for API alternatives
- OpenWeatherMap API documentation
- Axios guide for HTTP requests
- Chart.js documentation
