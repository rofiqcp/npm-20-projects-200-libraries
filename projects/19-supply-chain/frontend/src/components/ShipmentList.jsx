import { useState } from 'react';

const STATUS_CONFIG = {
  in_transit:       { label: 'In Transit',       color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30' },
  delivered:        { label: 'Delivered',         color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30' },
  delayed:          { label: 'Delayed',           color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30' },
  out_for_delivery: { label: 'Out for Delivery',  color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  customs:          { label: 'Customs',           color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
  processing:       { label: 'Processing',        color: 'text-gray-400',   bg: 'bg-gray-400/10 border-gray-400/30' }
};

export default function ShipmentList({ shipments, onSelect }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statuses = ['all', ...Object.keys(STATUS_CONFIG)];
  const filtered = shipments.filter(s => {
    const matchSearch = !search || s.trackingId.toLowerCase().includes(search.toLowerCase()) ||
      s.origin.toLowerCase().includes(search.toLowerCase()) ||
      s.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex gap-2 mb-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by tracking ID, origin, destination..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50 text-slate-400 text-xs">
            <tr>
              <th className="text-left px-4 py-2">Tracking ID</th>
              <th className="text-left px-4 py-2 hidden md:table-cell">Origin → Destination</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2 hidden sm:table-cell">Progress</th>
              <th className="text-left px-4 py-2 hidden lg:table-cell">ETA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.processing;
              return (
                <tr key={s.id} onClick={() => onSelect?.(s)}
                  className="border-t border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-white">{s.trackingId}</span>
                    <br/>
                    <span className="text-xs text-slate-500">{s.carrier}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-xs text-slate-300">{s.origin}</div>
                    <div className="text-xs text-slate-500">→ {s.destination}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} whitespace-nowrap`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden w-16">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 w-8">{s.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">{s.eta}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-slate-500 text-sm">No shipments found</p>
        )}
      </div>
    </div>
  );
}
