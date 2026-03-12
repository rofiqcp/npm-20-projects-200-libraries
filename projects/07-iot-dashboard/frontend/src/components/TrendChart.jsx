import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b'];

export default function TrendChart({ sensors }) {
  const [readings, setReadings] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [hours, setHours] = useState(6);
  const [metric, setMetric] = useState('temperature');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sensors.length === 0) return;

    const fetchReadings = async () => {
      setLoading(true);
      try {
        const params = { hours, limit: 200 };
        if (selectedSensor !== 'all') params.sensor_id = selectedSensor;

        const { data } = await axios.get('/api/readings', { params });
        setReadings(data.reverse());
      } catch (err) {
        console.error('Failed to fetch readings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
    const interval = setInterval(fetchReadings, 10000);
    return () => clearInterval(interval);
  }, [sensors, selectedSensor, hours]);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const sensorIds = selectedSensor === 'all'
    ? [...new Set(readings.map(r => r.sensor_id))]
    : [parseInt(selectedSensor)];

  const groupedByTime = {};
  readings.forEach(r => {
    const key = new Date(r.recorded_at).toISOString();
    if (!groupedByTime[key]) groupedByTime[key] = { time: formatTime(r.recorded_at) };
    groupedByTime[key][`sensor_${r.sensor_id}`] = r[metric];
    groupedByTime[key][`name_${r.sensor_id}`] = r.sensor_name;
  });

  const chartData = Object.values(groupedByTime).slice(-60);

  const sensorName = (id) => {
    const r = readings.find(r => r.sensor_id === id);
    return r ? r.sensor_name : `Sensor ${id}`;
  };

  const metricUnit = { temperature: '°C', humidity: '%', pressure: ' hPa' };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-white">📈 Trend Analysis</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
            className="bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="all">All Sensors</option>
            {sensors.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="pressure">Pressure</option>
          </select>
          <select
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="bg-slate-700 text-slate-200 border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
          >
            <option value={1}>Last 1h</option>
            <option value={6}>Last 6h</option>
            <option value={24}>Last 24h</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">Loading chart...</div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          No readings available yet. Data will appear as sensors report.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => `${v}${metricUnit[metric] || ''}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            {sensorIds.map((id, i) => (
              <Line
                key={id}
                type="monotone"
                dataKey={`sensor_${id}`}
                name={sensorName(id)}
                stroke={COLORS[i % COLORS.length]}
                dot={false}
                strokeWidth={2}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
