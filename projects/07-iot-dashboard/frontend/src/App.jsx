import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Dashboard from './components/Dashboard.jsx';

const socket = io({ path: '/socket.io', transports: ['websocket', 'polling'] });

export default function App() {
  const [sensors, setSensors] = useState([]);
  const [latestReadings, setLatestReadings] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [sensorsRes, latestRes, alertsRes] = await Promise.all([
        axios.get('/api/sensors'),
        axios.get('/api/readings/latest'),
        axios.get('/api/readings/alerts'),
      ]);

      setSensors(sensorsRes.data);

      const readingsMap = {};
      latestRes.data.forEach(r => { readingsMap[r.sensor_id] = r; });
      setLatestReadings(readingsMap);

      setAlerts(alertsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('new_reading', (reading) => {
      setLatestReadings(prev => ({
        ...prev,
        [reading.sensor_id]: reading,
      }));
    });

    socket.on('new_alerts', (newAlerts) => {
      setAlerts(prev => [...newAlerts.map(a => ({ ...a, id: Date.now() + Math.random() })), ...prev].slice(0, 50));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_reading');
      socket.off('new_alerts');
    };
  }, []);

  return (
    <Dashboard
      sensors={sensors}
      latestReadings={latestReadings}
      alerts={alerts}
      connected={connected}
      onRefresh={fetchInitialData}
    />
  );
}
