import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const MONTHLY = ['Jan','Feb','Mar','Apr','May','Jun'].map(m => ({
  month: m, shipped: Math.round(80 + Math.random() * 40), delivered: Math.round(70 + Math.random() * 38)
}));

const DELAY_REASONS = [
  { name: 'Customs', value: 35, color: '#8b5cf6' },
  { name: 'Weather', value: 28, color: '#3b82f6' },
  { name: 'Capacity', value: 20, color: '#f59e0b' },
  { name: 'Other', value: 17, color: '#6b7280' }
];

const COST_DATA = ['Jan','Feb','Mar','Apr','May','Jun'].map(m => ({
  month: m,
  ocean: Math.round(40000 + Math.random() * 20000),
  air: Math.round(15000 + Math.random() * 10000),
  road: Math.round(8000 + Math.random() * 5000)
}));

const TOOLTIP_STYLE = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' };

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    axios.get('/api/analytics').then(r => setAnalytics(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">📊 Supply Chain Analytics</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'On-Time Rate',     value: analytics ? `${analytics.deliveryRate}%` : '87.3%', icon: '⏱', color: 'text-green-400' },
          { label: 'Avg Transit',      value: '8.4 days', icon: '🗓', color: 'text-blue-400' },
          { label: 'Avg Progress',     value: analytics ? `${analytics.avgProgress}%` : '56%', icon: '📊', color: 'text-cyan-400' },
          { label: 'Total Shipments',  value: analytics?.totalShipments || 15, icon: '📦', color: 'text-purple-400' }
        ].map(k => (
          <div key={k.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p className="text-xs text-slate-400">{k.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{k.icon}</span>
              <span className={`text-xl font-bold ${k.color}`}>{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Volume */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold text-white mb-4">📈 Monthly Shipment Volume</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={MONTHLY}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            <Bar dataKey="shipped"   fill="#3b82f6" name="Shipped"   radius={[4,4,0,0]} />
            <Bar dataKey="delivered" fill="#22c55e" name="Delivered" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Cost Breakdown */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold text-white mb-4">💰 Shipping Cost by Mode</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={COST_DATA} margin={{ left: -20 }}>
              <defs>
                {[['ocean','#3b82f6'],['air','#f59e0b'],['road','#22c55e']].map(([key, color]) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`$${v.toLocaleString()}`]} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              <Area type="monotone" dataKey="ocean" stroke="#3b82f6" fill="url(#grad-ocean)" strokeWidth={2} name="Ocean" />
              <Area type="monotone" dataKey="air"   stroke="#f59e0b" fill="url(#grad-air)"   strokeWidth={2} name="Air" />
              <Area type="monotone" dataKey="road"  stroke="#22c55e" fill="url(#grad-road)"  strokeWidth={2} name="Road" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Delay Reasons */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="font-semibold text-white mb-4">⏰ Delay Causes</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={DELAY_REASONS} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3}>
                  {DELAY_REASONS.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {DELAY_REASONS.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-slate-300 flex-1">{d.name}</span>
                  <span className="font-bold" style={{ color: d.color }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Performance Trend */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="font-semibold text-white mb-4">📉 On-Time Delivery Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={['Jan','Feb','Mar','Apr','May','Jun'].map(m => ({ month: m, rate: Math.round(82 + Math.random() * 12) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis domain={[75, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'On-Time Rate']} />
            <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="On-Time Rate" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
