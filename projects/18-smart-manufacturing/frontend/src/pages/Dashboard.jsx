import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import MachineCard from '../components/MachineCard.jsx';
import SensorChart from '../components/SensorChart.jsx';
import ProductionOrders from '../components/ProductionOrders.jsx';

const MOCK_MACHINES = [
  { id: 'm1', name: 'CNC Mill A', type: 'CNC Mill', status: 'running', temperature: 65, vibration: 2.1, power: 18.5, oeeScore: 87, availability: 92, performance: 96, quality: 98, lastMaintenance: '2024-05-15', nextMaintenance: '2024-07-15' },
  { id: 'm2', name: 'Lathe B', type: 'Lathe', status: 'running', temperature: 72, vibration: 3.4, power: 22.0, oeeScore: 82, availability: 88, performance: 94, quality: 99, lastMaintenance: '2024-04-20', nextMaintenance: '2024-06-20' },
  { id: 'm3', name: 'Press C', type: 'Hydraulic Press', status: 'idle', temperature: 38, vibration: 0.5, power: 4.2, oeeScore: 91, availability: 95, performance: 97, quality: 99, lastMaintenance: '2024-06-01', nextMaintenance: '2024-08-01' },
  { id: 'm4', name: 'Welder D', type: 'Robotic Welder', status: 'running', temperature: 310, vibration: 1.8, power: 35.0, oeeScore: 78, availability: 84, performance: 93, quality: 100, lastMaintenance: '2024-03-10', nextMaintenance: '2024-06-10' },
  { id: 'm5', name: 'Conveyor E', type: 'Conveyor Belt', status: 'running', temperature: 42, vibration: 1.2, power: 8.5, oeeScore: 95, availability: 98, performance: 99, quality: 98, lastMaintenance: '2024-06-10', nextMaintenance: '2024-09-10' },
  { id: 'm6', name: 'Grinder F', type: 'Surface Grinder', status: 'maintenance', temperature: 55, vibration: 5.8, power: 0, oeeScore: 70, availability: 75, performance: 96, quality: 97, lastMaintenance: '2024-06-18', nextMaintenance: '2024-06-25' },
  { id: 'm7', name: 'Drill Press G', type: 'Drill Press', status: 'running', temperature: 58, vibration: 2.9, power: 12.0, oeeScore: 89, availability: 93, performance: 97, quality: 98, lastMaintenance: '2024-05-28', nextMaintenance: '2024-07-28' },
  { id: 'm8', name: 'Injection Mold H', type: 'Injection Mold', status: 'error', temperature: 185, vibration: 4.1, power: 45.0, oeeScore: 65, availability: 70, performance: 95, quality: 97, lastMaintenance: '2024-04-15', nextMaintenance: '2024-06-15' }
];

const MOCK_ORDERS = [
  { id: 'po1', partName: 'Shaft Assembly', machineId: 'm1', quantity: 500, completed: 312, status: 'in_progress', priority: 'high', dueDate: '2024-06-30' },
  { id: 'po2', partName: 'Gear Housing', machineId: 'm2', quantity: 200, completed: 198, status: 'in_progress', priority: 'medium', dueDate: '2024-06-25' },
  { id: 'po3', partName: 'Bracket Set', machineId: 'm3', quantity: 1000, completed: 0, status: 'scheduled', priority: 'low', dueDate: '2024-07-20' },
  { id: 'po5', partName: 'Conveyor Rollers', machineId: 'm5', quantity: 300, completed: 300, status: 'completed', priority: 'medium', dueDate: '2024-06-20' }
];

export default function Dashboard() {
  const [machines, setMachines] = useState(MOCK_MACHINES);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [alerts, setAlerts] = useState([]);
  const [oee, setOee] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/machines').then(r => setMachines(r.data)).catch(() => {}),
      axios.get('/api/production-orders').then(r => setOrders(r.data)).catch(() => {}),
      axios.get('/api/alerts').then(r => setAlerts(r.data)).catch(() => {}),
      axios.get('/api/oee').then(r => setOee(r.data)).catch(() => {})
    ]);

    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('machine_update', updated => setMachines(prev => prev.map(m => m.id === updated.id ? updated : m)));
    socket.on('alert_generated', alert => setAlerts(prev => [alert, ...prev.slice(0, 9)]));
    return () => socket.disconnect();
  }, []);

  const runningCount = machines.filter(m => m.status === 'running').length;
  const errorCount = machines.filter(m => m.status === 'error').length;
  const avgOEE = oee?.overall ?? Math.round(machines.reduce((s,m) => s+m.oeeScore, 0) / machines.length);
  const totalPower = machines.reduce((s, m) => s + (m.power || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Running', value: runningCount, icon: '⚙️', color: 'text-green-400' },
          { label: 'Overall OEE', value: `${avgOEE}%`, icon: '📊', color: 'text-cyan-400' },
          { label: 'Power Usage', value: `${totalPower.toFixed(1)}kW`, icon: '⚡', color: 'text-yellow-400' },
          { label: 'Errors', value: errorCount, icon: '🚨', color: 'text-red-400' }
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border" style={{backgroundColor:'#0f172a', borderColor:'#1e3a5f'}}>
            <p className="text-xs text-slate-400">{s.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live status */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className={connected ? 'text-green-400' : 'text-red-400'}>{connected ? 'Live sensor data active' : 'Using mock data'}</span>
      </div>

      {/* Machine Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">🏭 Factory Floor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {machines.map(m => (
            <div key={m.id} onClick={() => setSelectedMachine(m.id === selectedMachine ? null : m.id)} className="cursor-pointer">
              <MachineCard machine={m} />
            </div>
          ))}
        </div>
      </div>

      {/* Selected machine chart */}
      {selectedMachine && (
        <SensorChart machine={machines.find(m => m.id === selectedMachine)} />
      )}

      {/* Production Orders */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">📋 Production Orders</h2>
        <ProductionOrders orders={orders} machines={machines} />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">🚨 Active Alerts</h2>
          <div className="space-y-2">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                alert.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
              }`}>
                <span>{alert.type === 'error' ? '🔴' : '🟡'}</span>
                <div className="flex-1">
                  <span className="font-medium">{alert.machineName}: </span>
                  <span className="opacity-80">{alert.message}</span>
                </div>
                {alert.acknowledged && <span className="text-xs text-slate-500">Acknowledged</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
