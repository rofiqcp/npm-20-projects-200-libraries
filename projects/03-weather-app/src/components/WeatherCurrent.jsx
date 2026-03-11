import { getWeatherIconUrl } from '../services/weatherAPI'

export default function WeatherCurrent({ weather, unit }) {
  const tempUnit = unit === 'metric' ? '°C' : '°F'
  const speedUnit = unit === 'metric' ? 'm/s' : 'mph'

  const {
    name,
    sys,
    weather: conditions,
    main,
    wind,
    visibility,
  } = weather

  const condition = conditions[0]

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
      {/* City & Country */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">{name}, {sys.country}</h2>
          <p className="text-blue-200 capitalize mt-1">{condition.description}</p>
        </div>
        <img
          src={getWeatherIconUrl(condition.icon)}
          alt={condition.description}
          className="w-20 h-20 -mt-2"
        />
      </div>

      {/* Temperature */}
      <div className="mt-4">
        <span className="text-7xl font-extrabold">
          {Math.round(main.temp)}{tempUnit}
        </span>
        <p className="text-blue-200 mt-2 text-lg">
          Feels like {Math.round(main.feels_like)}{tempUnit}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">Humidity</p>
          <p className="text-lg font-bold">💧 {main.humidity}%</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">Wind</p>
          <p className="text-lg font-bold">💨 {wind.speed} {speedUnit}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wide mb-1">Visibility</p>
          <p className="text-lg font-bold">👁 {visibility ? (visibility / 1000).toFixed(1) : 'N/A'} km</p>
        </div>
      </div>
    </div>
  )
}
