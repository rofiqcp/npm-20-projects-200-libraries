import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import DeviceCard from '../components/DeviceCard.jsx';
import SceneManager from '../components/SceneManager.jsx';
import EnergyChart from '../components/EnergyChart.jsx';

const MOCK_DEVICES = [
  { id: 'd1',  name: 'Living Room Light',  type: 'light',      room: 'Living Room', status: 'on',  brightness: 80, power: 12 },
  { id: 'd2',  name: 'Bedroom Light',      type: 'light',      room: 'Bedroom',     status: 'off', brightness: 60, power: 0 },
  { id: 'd3',  name: 'Kitchen Light',      type: 'light',      room: 'Kitchen',     status: 'on',  brightness: 100, power: 15 },
  { id: 'd4',  name: 'Living Room Thermo', type: 'thermostat', room: 'Living Room', status: 'on',  temperature: 22, targetTemp: 22, power: 8 },
  { id: 'd5',  name: 'Bedroom Thermo',     type: 'thermostat', room: 'Bedroom',     status: 'off', temperature: 20, targetTemp: 20, power: 0 },
  { id: 'd6',  name: 'Front Camera',       type: 'camera',     room: 'Entrance',    status: 'on',  recording: true, power: 5 },
  { id: 'd7',  name: 'Back Camera',        type: 'camera',     room: 'Backyard',    status: 'on',  recording: false, power: 5 },
  { id: 'd8',  name: 'Front Door Lock',    type: 'lock',       room: 'Entrance',    status: 'on',  locked: true, power: 2 },
  { id: 'd9',  name: 'Garage Lock',        type: 'lock',       room: 'Garage',      status: 'on',  locked: true, power: 2 },
  { id: 'd10', name: 'Ceiling Fan',        type: 'fan',        room: 'Living Room', status: 'off', speed: 0, power: 0 },
  { id: 'd11', name: 'Bedroom Fan',        type: 'fan',        room: 'Bedroom',     status: 'off', speed: 0, power: 0 },
  { id: 'd12', name: 'Smart Plug',         type: 'plug',       room: 'Kitchen',     status: 'on',  voltage: 230, power: 45 }
];

export default function Dashboard() {
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('/api/devices').then(r => setDevices(r.data)).catch(() => {});
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('device_update', updated => {
      setDevices(prev => prev.map(d => d.id === updated.id ? updated : d));
    });
    socket.on('sensor_reading', reading => setLastEvent(`Sensor update: ${reading.sensors?.length || 0} readings`));
    socket.on('automation_triggered', e => setLastEvent(`Automation: ${e.ruleName} triggered`));
    return () => socket.disconnect();
  }, []);

  const handleDeviceUpdate = useCallback(updated => {
    setDevices(prev => prev.map(d => d.id === updated.id ? updated : d));
  }, []);

  const types = ['all', 'light', 'thermostat', 'camera', 'lock', 'fan', 'plug'];
  const filtered = filter === 'all' ? devices : devices.filter(d => d.type === filter);
  const onCount = devices.filter(d => d.status === 'on').length;
  const totalPower = devices.reduce((s, d) => s + (d.power || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Devices', value: devices.length, icon: '📱', color: 'text-blue-400' },
          { label: 'Online', value: onCount, icon: '✅', color: 'text-green-400' },
          { label: 'Power Usage', value: `${totalPower}W`, icon: '⚡', color: 'text-yellow-400' },
          { label: 'Offline', value: devices.length - onCount, icon: '💤', color: 'text-gray-400' }
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">{stat.icon}</span>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Socket status */}
      <div className="flex items-center gap-3 text-sm">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        <span className={connected ? 'text-green-400' : 'text-red-400'}>{connected ? 'Live — Real-time updates active' : 'Offline — Using mock data'}</span>
        {lastEvent && <span className="text-gray-500 ml-2">| {lastEvent}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devices panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${filter === t ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(device => (
              <DeviceCard key={device.id} device={device} onUpdate={handleDeviceUpdate} />
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <SceneManager />
          <EnergyChart />
        </div>
      </div>
    </div>
  );
}
