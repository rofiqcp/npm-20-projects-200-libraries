import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import BuildingCard from '../components/BuildingCard.jsx';
import EnergyMeter from '../components/EnergyMeter.jsx';
import RenewableChart from '../components/RenewableChart.jsx';
import SustainabilityReport from '../components/SustainabilityReport.jsx';

const MOCK_BUILDINGS = [
  { id: 'b1', name: 'HQ Tower',        type: 'Office',      floors: 28, area: 45000, consumption: 1850, solar: 280, wind: 0,   grid: 1570, efficiency: 'B', targetKwh: 1700 },
  { id: 'b2', name: 'Research Campus', type: 'R&D',         floors: 6,  area: 22000, consumption: 920,  solar: 420, wind: 150, grid: 350,  efficiency: 'A', targetKwh: 900 },
  { id: 'b3', name: 'Warehouse Alpha', type: 'Industrial',  floors: 3,  area: 80000, consumption: 3200, solar: 800, wind: 200, grid: 2200, efficiency: 'C', targetKwh: 2800 },
  { id: 'b4', name: 'Data Center',     type: 'Data Center', floors: 4,  area: 8000,  consumption: 5400, solar: 0,   wind: 0,   grid: 5400, efficiency: 'D', targetKwh: 5000 },
  { id: 'b5', name: 'Retail Park',     type: 'Retail',      floors: 2,  area: 35000, consumption: 1100, solar: 350, wind: 80,  grid: 670,  efficiency: 'A', targetKwh: 1000 }
];

const generateChartData = () => Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  solar: i >= 6 && i <= 18 ? Math.round(200 + Math.random() * 300) : Math.round(Math.random() * 20),
  wind:  Math.round(80 + Math.random() * 120),
  grid:  Math.round(300 + Math.random() * 400)
}));

export default function Dashboard() {
  const [buildings, setBuildings] = useState(MOCK_BUILDINGS);
  const [current, setCurrent] = useState(null);
  const [chartData, setChartData] = useState(generateChartData());
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [updatingBuildings, setUpdatingBuildings] = useState(new Set());

  useEffect(() => {
    axios.get('/api/buildings').then(r => setBuildings(r.data)).catch(() => {});
    axios.get('/api/energy/current').then(r => setCurrent(r.data)).catch(() => {});
    axios.get('/api/energy/history').then(r => {
      if (r.data?.length) setChartData(r.data.map(d => ({
        time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        solar: d.solar, wind: d.wind, grid: d.grid
      })));
    }).catch(() => {});
    axios.get('/api/alerts').then(r => setAlerts(r.data)).catch(() => {});

    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('energy_reading', reading => {
      setBuildings(prev => prev.map(b => b.id === reading.buildingId
        ? { ...b, consumption: reading.consumption, solar: reading.solar, wind: reading.wind, grid: reading.grid }
        : b
      ));
      setUpdatingBuildings(prev => { const s = new Set(prev); s.add(reading.buildingId); return s; });
      setTimeout(() => setUpdatingBuildings(prev => { const s = new Set(prev); s.delete(reading.buildingId); return s; }), 1200);
      axios.get('/api/energy/current').then(r => setCurrent(r.data)).catch(() => {});
    });
    socket.on('alert_generated', alert => setAlerts(prev => [alert, ...prev.slice(0, 9)]));
    return () => socket.disconnect();
  }, []);

  const totalConsumption = buildings.reduce((s, b) => s + b.consumption, 0);
  const totalSolar = buildings.reduce((s, b) => s + b.solar, 0);
  const totalWind  = buildings.reduce((s, b) => s + b.wind, 0);
  const totalRenewablePct = totalConsumption > 0 ? Math.round((totalSolar + totalWind) / totalConsumption * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Consumption', value: `${totalConsumption.toLocaleString()} kWh`, icon: '⚡', color: 'text-yellow-400' },
          { label: 'Solar Generation',  value: `${totalSolar} kWh`, icon: '☀️', color: 'text-orange-400' },
          { label: 'Wind Generation',   value: `${totalWind} kWh`,  icon: '💨', color: 'text-blue-400' },
          { label: 'Renewable Mix',     value: `${totalRenewablePct}%`, icon: '🌱', color: 'text-green-400' }
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
            <p className="text-xs text-emerald-300/70">{s.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live status */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        <span className={connected ? 'text-green-400' : 'text-emerald-300/50'}>{connected ? 'Live energy monitoring active' : 'Using mock data'}</span>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Energy Mix Chart */}
          <RenewableChart data={chartData} />

          {/* Building Grid */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">🏢 Buildings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {buildings.map(b => (
                <BuildingCard key={b.id} building={b} isUpdating={updatingBuildings.has(b.id)} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <EnergyMeter
            label="⚡ Total Consumption"
            current={current?.totalConsumption || totalConsumption}
            previous={Math.round(totalConsumption * 0.97)}
            costPerHour={current?.costPerHour || +(totalConsumption / 1000 * 0.12).toFixed(2)}
          />
          <SustainabilityReport />

          {/* Alerts */}
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <div className="rounded-xl p-4 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
              <h3 className="font-semibold text-white mb-3">🚨 Alerts</h3>
              <div className="space-y-2">
                {alerts.filter(a => !a.acknowledged).slice(0, 4).map(alert => (
                  <div key={alert.id} className={`p-2 rounded-lg border text-xs ${
                    alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                  }`}>
                    <span className="font-medium">{alert.buildingName}: </span>
                    <span className="opacity-80">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
