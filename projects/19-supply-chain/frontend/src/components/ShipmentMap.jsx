import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_COLORS = {
  in_transit: '#3b82f6',
  delivered: '#22c55e',
  delayed: '#ef4444',
  out_for_delivery: '#f59e0b',
  customs: '#8b5cf6',
  processing: '#6b7280'
};

const createIcon = (status) => L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${STATUS_COLORS[status] || '#6b7280'};border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export default function ShipmentMap({ shipments }) {
  const safeShipments = (shipments || []).filter(s => s.lat != null && s.lng != null && !isNaN(s.lat) && !isNaN(s.lng));

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700" style={{ height: '420px' }}>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} preferCanvas>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {safeShipments.map(shipment => (
          <Marker key={shipment.id} position={[shipment.lat, shipment.lng]} icon={createIcon(shipment.status)}>
            <Popup>
              <div style={{ minWidth: '180px', fontFamily: 'sans-serif' }}>
                <strong>{shipment.trackingId}</strong>
                <br />
                <span style={{ color: STATUS_COLORS[shipment.status] || '#888', fontWeight: 600, textTransform: 'capitalize' }}>
                  {shipment.status.replace('_', ' ')}
                </span>
                <br />
                <small>📦 {shipment.origin}</small><br />
                <small>📍 → {shipment.destination}</small><br />
                <small>🚢 {shipment.carrier}</small><br />
                <small>⚖️ {shipment.weight} kg</small><br />
                <small>📅 ETA: {shipment.eta}</small><br />
                <div style={{ marginTop: '6px', background: '#e5e7eb', borderRadius: '4px', height: '6px' }}>
                  <div style={{ width: `${shipment.progress}%`, background: STATUS_COLORS[shipment.status] || '#3b82f6', height: '100%', borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
                <small>{shipment.progress}% complete</small>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
