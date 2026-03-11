import React from 'react';

export default function SensorCard({ sensor, reading }) {
  if (!reading) {
    return (
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white">{sensor.name}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{sensor.location}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-slate-500" />
        </div>
        <p className="text-slate-400 text-sm">No readings yet...</p>
      </div>
    );
  }

  const temp = Number(reading.temperature);
  const humidity = Number(reading.humidity);
  const pressure = Number(reading.pressure);
  const battery = Number(reading.battery_level);

  const tempWarning = temp > sensor.temp_max_alert || temp < sensor.temp_min_alert;
  const humidityWarning = humidity > sensor.humidity_max_alert;

  const tempColor = tempWarning ? 'text-red-400' : 'text-emerald-400';
  const humidityColor = humidityWarning ? 'text-red-400' : 'text-blue-400';

  const batteryColor = battery > 50 ? 'text-green-400' : battery > 20 ? 'text-yellow-400' : 'text-red-400';

  const timeStr = reading.recorded_at
    ? new Date(reading.recorded_at).toLocaleTimeString()
    : 'Unknown';

  return (
    <div className={`bg-slate-800 rounded-xl p-5 border ${tempWarning || humidityWarning ? 'border-red-500/50' : 'border-slate-700'} transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">{sensor.name}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{sensor.location}</p>
        </div>
        <div className="flex items-center gap-2">
          {(tempWarning || humidityWarning) && (
            <span className="text-red-400 text-xs font-medium bg-red-400/10 px-2 py-0.5 rounded">⚠ Alert</span>
          )}
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Temperature</p>
          <p className={`text-2xl font-bold ${tempColor}`}>{temp.toFixed(1)}°C</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Humidity</p>
          <p className={`text-2xl font-bold ${humidityColor}`}>{humidity.toFixed(1)}%</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Pressure</p>
          <p className="text-lg font-semibold text-purple-400">{pressure.toFixed(0)} hPa</p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Battery</p>
          <p className={`text-lg font-semibold ${batteryColor}`}>{battery.toFixed(1)}%</p>
        </div>
      </div>

      <p className="text-slate-500 text-xs mt-3 text-right">Updated: {timeStr}</p>
    </div>
  );
}
