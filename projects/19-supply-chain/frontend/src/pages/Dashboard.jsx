import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import ShipmentMap from '../components/ShipmentMap.jsx';
import ShipmentList from '../components/ShipmentList.jsx';
import WarehousePanel from '../components/WarehousePanel.jsx';

const MOCK_SHIPMENTS = [
  { id: 's1',  trackingId: 'TRK-001', origin: 'Shanghai, CN',    destination: 'Los Angeles, US', status: 'in_transit',       lat: 35.2,  lng: 170.5, carrier: 'OceanFreight Co', weight: 2400, eta: '2024-07-10', progress: 62 },
  { id: 's2',  trackingId: 'TRK-002', origin: 'Rotterdam, NL',   destination: 'New York, US',    status: 'in_transit',       lat: 47.8,  lng: -35.2, carrier: 'Atlantic Lines',  weight: 850,  eta: '2024-06-28', progress: 78 },
  { id: 's3',  trackingId: 'TRK-003', origin: 'Mumbai, IN',      destination: 'Dubai, AE',       status: 'delivered',        lat: 25.2,  lng: 55.3,  carrier: 'IndoArabia Ship', weight: 1200, eta: '2024-06-20', progress: 100 },
  { id: 's4',  trackingId: 'TRK-004', origin: 'Guangzhou, CN',   destination: 'Hamburg, DE',     status: 'in_transit',       lat: 28.5,  lng: 90.2,  carrier: 'EuroAsia Lines',  weight: 3100, eta: '2024-07-15', progress: 35 },
  { id: 's5',  trackingId: 'TRK-005', origin: 'Chicago, US',     destination: 'Toronto, CA',     status: 'out_for_delivery', lat: 43.5,  lng: -79.8, carrier: 'FedEx Ground',    weight: 45,   eta: '2024-06-22', progress: 90 },
  { id: 's6',  trackingId: 'TRK-006', origin: 'Tokyo, JP',       destination: 'Sydney, AU',      status: 'customs',          lat: 20.3,  lng: 155.8, carrier: 'Pacific Airways', weight: 380,  eta: '2024-06-25', progress: 55 },
  { id: 's11', trackingId: 'TRK-011', origin: 'Seoul, KR',       destination: 'Chicago, US',     status: 'delayed',          lat: 40.2,  lng: -155.0,carrier: 'Korean Air Cargo',weight: 420,  eta: '2024-07-03', progress: 45 }
];

export default function Dashboard() {
  const [shipments, setShipments] = useState(MOCK_SHIPMENTS);
  const [connected, setConnected] = useState(false);
  const [selected, setSelected] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get('/api/shipments').then(r => setShipments(r.data)).catch(() => {});
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('shipment_location_update', upd => {
      setShipments(prev => prev.map(s => s.id === upd.id ? { ...s, lat: upd.lat, lng: upd.lng, progress: upd.progress } : s));
    });
    socket.on('delivery_alert', alert => {
      setAlerts(prev => [alert, ...prev.slice(0, 4)]);
    });
    return () => socket.disconnect();
  }, []);

  const inTransit  = shipments.filter(s => s.status === 'in_transit').length;
  const delivered  = shipments.filter(s => s.status === 'delivered').length;
  const delayed    = shipments.filter(s => s.status === 'delayed').length;
  const totalWeight = shipments.reduce((s, sh) => s + (sh.weight || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: shipments.length, icon: '📦', color: 'text-blue-400' },
          { label: 'In Transit',      value: inTransit,        icon: '🚢', color: 'text-cyan-400' },
          { label: 'Delivered',       value: delivered,        icon: '✅', color: 'text-green-400' },
          { label: 'Delayed',         value: delayed,          icon: '⚠️', color: 'text-red-400' }
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400">{s.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live status */}
      <div className="flex items-center gap-2 flex-wrap text-sm">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
        <span className={connected ? 'text-green-400' : 'text-gray-400'}>{connected ? 'Live GPS tracking active' : 'Using mock data'}</span>
        {alerts.map((a, i) => (
          <span key={i} className="text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-0.5 rounded-full text-xs">
            ✅ {a.trackingId} delivered!
          </span>
        ))}
      </div>

      {/* Map */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">🗺️ Live Shipment Map</h2>
        <ShipmentMap shipments={shipments} />
      </div>

      {/* List + Warehouses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-3">📋 Shipments</h2>
          <ShipmentList shipments={shipments} onSelect={setSelected} />
          {selected && (
            <div className="mt-3 bg-slate-800 border border-blue-500/30 rounded-xl p-4 text-sm">
              <h4 className="font-semibold text-blue-400 mb-2">📦 {selected.trackingId} Details</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <span>Origin: {selected.origin}</span>
                <span>Destination: {selected.destination}</span>
                <span>Carrier: {selected.carrier}</span>
                <span>Weight: {selected.weight} kg</span>
                <span>ETA: {selected.eta}</span>
                <span>Progress: {selected.progress}%</span>
              </div>
            </div>
          )}
        </div>
        <WarehousePanel />
      </div>
    </div>
  );
}
