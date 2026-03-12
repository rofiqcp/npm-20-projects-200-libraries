import { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_WAREHOUSES = [
  { id: 'w1', name: 'Los Angeles Hub',  location: 'Los Angeles, US', capacity: 10000, used: 7234, products: [{ name: 'Electronics', qty: 3400 }, { name: 'Apparel', qty: 2100 }] },
  { id: 'w2', name: 'Rotterdam Port',   location: 'Rotterdam, NL',   capacity: 15000, used: 9876, products: [{ name: 'Machinery',   qty: 4500 }, { name: 'Chemicals', qty: 3200 }] },
  { id: 'w3', name: 'Singapore Hub',    location: 'Singapore, SG',   capacity: 8000,  used: 5120, products: [{ name: 'Electronics', qty: 2800 }, { name: 'Rubber', qty: 1500 }] },
  { id: 'w4', name: 'Chicago Center',   location: 'Chicago, US',     capacity: 12000, used: 8100, products: [{ name: 'Auto Parts', qty: 4000 }, { name: 'Food', qty: 2500 }] },
  { id: 'w5', name: 'Dubai Logistics',  location: 'Dubai, AE',       capacity: 9500,  used: 6200, products: [{ name: 'Luxury', qty: 2800 }, { name: 'Textiles', qty: 1500 }] }
];

export default function WarehousePanel() {
  const [warehouses, setWarehouses] = useState(MOCK_WAREHOUSES);

  useEffect(() => {
    axios.get('/api/warehouses').then(r => setWarehouses(r.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">🏢 Warehouse Inventory</h3>
      <div className="space-y-4">
        {warehouses.map(wh => {
          const usagePct = Math.round((wh.used / wh.capacity) * 100);
          const alertLevel = usagePct >= 90 ? 'red' : usagePct >= 75 ? 'yellow' : 'green';
          return (
            <div key={wh.id} className="border border-slate-700 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">{wh.name}</p>
                  <p className="text-xs text-slate-400">📍 {wh.location}</p>
                </div>
                <span className={`text-xs font-bold ${alertLevel === 'red' ? 'text-red-400' : alertLevel === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {usagePct}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{wh.used.toLocaleString()} / {wh.capacity.toLocaleString()} units</span>
                {usagePct >= 90 && <span className="text-red-400">⚠ Near capacity</span>}
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${alertLevel === 'red' ? 'bg-red-500' : alertLevel === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {wh.products.map(p => (
                  <span key={p.name} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                    {p.name}: {p.qty.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
