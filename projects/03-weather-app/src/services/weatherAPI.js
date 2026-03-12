import axios from 'axios'

const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

const CACHE_DURATION_MS = 10 * 60 * 1000 // 10 minutes

function getCacheKey(type, city, unit) {
  return `weather_${type}_${city.toLowerCase()}_${unit}`
}

function getFromCache(key) {
  try {
    const item = sessionStorage.getItem(key)
    if (!item) return null
    const { data, timestamp } = JSON.parse(item)
    if (Date.now() - timestamp > CACHE_DURATION_MS) {
      sessionStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function saveToCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // sessionStorage might be full; ignore
  }
}

export async function fetchCurrentWeather(city, unit = 'metric') {
  const key = getCacheKey('current', city, unit)
  const cached = getFromCache(key)
  if (cached) return cached

  const response = await axios.get(`${BASE_URL}/weather`, {
    params: { q: city, units: unit, appid: API_KEY },
  })
  saveToCache(key, response.data)
  return response.data
}

export async function fetchForecast(city, unit = 'metric') {
  const key = getCacheKey('forecast', city, unit)
  const cached = getFromCache(key)
  if (cached) return cached

  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: { q: city, units: unit, appid: API_KEY },
  })
  saveToCache(key, response.data)
  return response.data
}

export function getWeatherIconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}
