import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const generateMockData = () => {
  const data = [];
  for (let i = 23; i >= 0; i--) {
    const h = new Date(); h.setHours(h.getHours() - i, 0, 0, 0);
    data.push({
      time: h.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      kwh: +(Math.random() * 2 + 0.5).toFixed(2)
    });
  }
  return data;
};

export default function EnergyChart() {
  const [data, setData] = useState(generateMockData());
  const [currentPower, setCurrentPower] = useState(null);

  useEffect(() => {
    axios.get('/api/energy/current').then(r => setCurrentPower(r.data)).catch(() => {});
    axios.get('/api/energy/history').then(r => {
      if (r.data && r.data.length) {
        setData(r.data.map(d => ({
          time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          kwh: d.kwh
        })));
      }
    }).catch(() => {});
  }, []);

  const totalKwh = data.reduce((s, d) => s + d.kwh, 0).toFixed(1);
  const estimatedCost = (totalKwh * 0.12).toFixed(2);

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">⚡ Energy Usage (24h)</h3>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-lg font-bold text-yellow-400">{totalKwh} kWh</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Est. Cost</p>
            <p className="text-lg font-bold text-green-400">${estimatedCost}</p>
          </div>
          {currentPower && (
            <div>
              <p className="text-xs text-gray-400">Now</p>
              <p className="text-lg font-bold text-blue-400">{currentPower.totalPower}W</p>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 10 }} interval={3} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
          <Area type="monotone" dataKey="kwh" stroke="#3b82f6" fill="url(#energyGrad)" strokeWidth={2} dot={false} name="kWh" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
