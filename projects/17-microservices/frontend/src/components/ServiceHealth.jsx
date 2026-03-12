import { useState, useEffect } from 'react';
import axios from 'axios';

const SERVICES = [
  { key: 'user-service',    label: 'User Service',    port: 3011, icon: '👤', color: 'green' },
  { key: 'product-service', label: 'Product Service', port: 3012, icon: '📦', color: 'yellow' },
  { key: 'order-service',   label: 'Order Service',   port: 3013, icon: '🛒', color: 'orange' },
];

export default function ServiceHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/../health');
      setHealth(data);
    } catch {
      // Mock fallback
      setHealth({
        gateway: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          'user-service':    { status: 'unknown', port: 3011 },
          'product-service': { status: 'unknown', port: 3012 },
          'order-service':   { status: 'unknown', port: 3013 }
        }
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchHealth(); const i = setInterval(fetchHealth, 10000); return () => clearInterval(i); }, []);

  const getColor = (status) => {
    if (status === 'healthy') return 'text-green-400 bg-green-400/10 border-green-400/30';
    if (status === 'unhealthy') return 'text-red-400 bg-red-400/10 border-red-400/30';
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">🩺 Service Health</h3>
        <div className="flex items-center gap-2">
          {health && (
            <span className={`text-xs px-2 py-0.5 rounded border ${getColor(health.gateway)}`}>
              Gateway: {health.gateway}
            </span>
          )}
          <button onClick={fetchHealth} className="text-xs text-slate-400 hover:text-white border border-slate-600 px-2 py-1 rounded transition-colors">
            ↻ Refresh
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
          Checking services...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SERVICES.map(svc => {
            const status = health?.services?.[svc.key]?.status || 'unknown';
            return (
              <div key={svc.key} className={`border rounded-lg p-3 ${getColor(status)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{svc.icon}</span>
                  <span className="font-medium text-sm">{svc.label}</span>
                </div>
                <div className="flex items-center justify-between text-xs opacity-80">
                  <span>Port :{svc.port}</span>
                  <span className="capitalize font-medium">{status}</span>
                </div>
                <div className={`w-2 h-2 rounded-full mt-2 ${status === 'healthy' ? 'bg-green-400 animate-pulse' : status === 'unhealthy' ? 'bg-red-400' : 'bg-yellow-400'}`} />
              </div>
            );
          })}
        </div>
      )}
      {health?.timestamp && (
        <p className="text-xs text-slate-500 mt-3">Last checked: {new Date(health.timestamp).toLocaleTimeString()}</p>
      )}
    </div>
  );
}
