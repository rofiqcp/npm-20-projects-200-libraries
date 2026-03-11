import { getWeatherIconUrl } from '../services/weatherAPI'

function getDayName(dtTxt) {
  const date = new Date(dtTxt)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function WeatherForecast({ forecast, unit }) {
  const tempUnit = unit === 'metric' ? '°C' : '°F'

  // Group by day (use noon entry or first of each day)
  const days = {}
  forecast.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0]
    if (!days[date]) {
      days[date] = { items: [] }
    }
    days[date].items.push(item)
  })

  const dailyForecasts = Object.entries(days).slice(0, 5).map(([date, { items }]) => {
    const temps = items.map(i => i.main.temp)
    const high = Math.round(Math.max(...temps))
    const low = Math.round(Math.min(...temps))
    // Prefer noon entry for icon/description
    const noonItem = items.find(i => i.dt_txt.includes('12:00:00')) || items[Math.floor(items.length / 2)]
    return {
      date,
      label: getDayName(date),
      icon: noonItem.weather[0].icon,
      description: noonItem.weather[0].description,
      high,
      low,
    }
  })

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-4">📅 5-Day Forecast</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {dailyForecasts.map(day => (
          <div
            key={day.date}
            className="flex-shrink-0 bg-white/10 rounded-xl p-4 text-center min-w-[100px]"
          >
            <p className="text-blue-200 text-xs font-medium mb-2">{day.label}</p>
            <img
              src={getWeatherIconUrl(day.icon)}
              alt={day.description}
              className="w-12 h-12 mx-auto"
            />
            <p className="text-xs text-blue-200 capitalize mb-2">{day.description}</p>
            <div className="flex justify-center gap-2 text-sm font-semibold">
              <span className="text-white">{day.high}{tempUnit}</span>
              <span className="text-blue-300">{day.low}{tempUnit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
