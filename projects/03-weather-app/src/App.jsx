import { useState } from 'react'
import { fetchCurrentWeather, fetchForecast } from './services/weatherAPI'
import SearchBar from './components/SearchBar'
import WeatherCurrent from './components/WeatherCurrent'
import WeatherForecast from './components/WeatherForecast'
import TemperatureChart from './components/TemperatureChart'

export default function App() {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [unit, setUnit] = useState('metric')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [city, setCity] = useState('')

  async function handleSearch(searchCity) {
    if (!searchCity.trim()) return
    setCity(searchCity)
    setLoading(true)
    setError('')
    try {
      const [weatherData, forecastData] = await Promise.all([
        fetchCurrentWeather(searchCity, unit),
        fetchForecast(searchCity, unit),
      ])
      setWeather(weatherData)
      setForecast(forecastData)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch weather data.'
      setError(`Error: ${msg}. Please check the city name and your API key.`)
      setWeather(null)
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleUnitToggle() {
    const newUnit = unit === 'metric' ? 'imperial' : 'metric'
    setUnit(newUnit)
    if (city) {
      setLoading(true)
      setError('')
      try {
        const [weatherData, forecastData] = await Promise.all([
          fetchCurrentWeather(city, newUnit),
          fetchForecast(city, newUnit),
        ])
        setWeather(weatherData)
        setForecast(forecastData)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update weather data.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2">🌤 Weather App</h1>
          <p className="text-blue-200 text-sm">Get real-time weather information for any city</p>
        </div>

        {/* Search & Unit Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} />
          </div>
          <button
            onClick={handleUnitToggle}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-colors backdrop-blur-sm"
          >
            {unit === 'metric' ? '°C → °F' : '°F → °C'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/40 rounded-xl text-red-200 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="ml-4 text-blue-200 text-lg">Fetching weather data...</span>
          </div>
        )}

        {/* Weather Data */}
        {!loading && weather && (
          <div className="space-y-6">
            <WeatherCurrent weather={weather} unit={unit} />
            {forecast && <WeatherForecast forecast={forecast} unit={unit} />}
            {forecast && <TemperatureChart forecast={forecast} unit={unit} />}
          </div>
        )}

        {/* Empty State */}
        {!loading && !weather && !error && (
          <div className="text-center py-20 text-blue-200">
            <div className="text-7xl mb-4">🌍</div>
            <p className="text-xl font-medium">Search for a city to get started</p>
            <p className="text-sm mt-2 text-blue-300">Try "London", "New York", or "Tokyo"</p>
          </div>
        )}
      </div>
    </div>
  )
}
