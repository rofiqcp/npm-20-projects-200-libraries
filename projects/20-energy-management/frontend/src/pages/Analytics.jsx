import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const TOOLTIP_STYLE = { backgroundColor: '#064e3b', border: '1px solid #065f46', borderRadius: '8px', color: '#ecfdf5' };

const MONTHLY_DATA = ['Jan','Feb','Mar','Apr','May','Jun'].map(m => ({
  month: m,
  consumption: Math.round(12000 + Math.random() * 3000),
  solar:       Math.round(2000 + Math.random() * 1500),
  wind:        Math.round(800 + Math.random() * 600),
  cost:        Math.round(1400 + Math.random() * 300)
}));

const BUILDING_BREAKDOWN = [
  { name: 'HQ Tower',        consumption: 1850, color: '#3b82f6' },
  { name: 'Research Campus', consumption: 920,  color: '#22c55e' },
  { name: 'Warehouse Alpha', consumption: 3200, color: '#f59e0b' },
  { name: 'Data Center',     consumption: 5400, color: '#ef4444' },
  { name: 'Retail Park',     consumption: 1100, color: '#8b5cf6' }
];

const FORECAST_DATA = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
  actual:   i < 6 ? Math.round(12000 + Math.random() * 3000) : null,
  forecast: Math.round(11500 + i * 100 + Math.random() * 1000),
  renewable: Math.round(3000 + i * 150 + Math.random() * 500)
}));

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">📊 Energy Analytics</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Monthly kWh',  value: '13,470', icon: '📊', color: 'text-blue-400' },
          { label: 'Cost Savings',     value: '$2,840', icon: '💰', color: 'text-green-400' },
          { label: 'Solar Capacity',   value: '1,850 kW', icon: '☀️', color: 'text-yellow-400' },
          { label: 'CO₂ Reduction',    value: '42.5 t', icon: '🌍', color: 'text-emerald-400' }
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
            <p className="text-xs text-emerald-300/70">{k.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{k.icon}</span>
              <span className={`text-lg font-bold ${k.color}`}>{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div className="rounded-xl p-5 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
        <h3 className="font-semibold text-white mb-4">📈 Monthly Energy Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={MONTHLY_DATA} margin={{ left: -10 }}>
            <defs>
              {[['c','#f59e0b'],['s','#fbbf24'],['w','#60a5fa']].map(([k,c]) => (
                <linearGradient key={k} id={`ag-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
            <XAxis dataKey="month" tick={{ fill: '#6ee7b7', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6ee7b7', fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: '#6ee7b7', fontSize: '12px' }} />
            <Area type="monotone" dataKey="consumption" stroke="#f59e0b" fill="url(#ag-c)" strokeWidth={2} dot={false} name="Consumption" />
            <Area type="monotone" dataKey="solar"       stroke="#fbbf24" fill="url(#ag-s)" strokeWidth={2} dot={false} name="Solar" />
            <Area type="monotone" dataKey="wind"        stroke="#60a5fa" fill="url(#ag-w)" strokeWidth={2} dot={false} name="Wind" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Building Consumption Breakdown */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
          <h3 className="font-semibold text-white mb-4">🏢 Consumption by Building</h3>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={BUILDING_BREAKDOWN} cx="50%" cy="50%" outerRadius={75} dataKey="consumption" paddingAngle={3}>
                  {BUILDING_BREAKDOWN.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v.toLocaleString()} kWh`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {BUILDING_BREAKDOWN.map(b => (
                <div key={b.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: b.color }} />
                  <span className="text-emerald-200 flex-1 truncate">{b.name}</span>
                  <span className="font-bold text-white">{b.consumption.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
          <h3 className="font-semibold text-white mb-4">💰 Monthly Cost Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHLY_DATA} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
              <XAxis dataKey="month" tick={{ fill: '#6ee7b7', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6ee7b7', fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`$${v.toLocaleString()}`]} />
              <Bar dataKey="cost" fill="#22c55e" name="Cost ($)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast */}
      <div className="rounded-xl p-5 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
        <h3 className="font-semibold text-white mb-4">🔮 12-Month Forecast & Renewable Target</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={FORECAST_DATA} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
            <XAxis dataKey="month" tick={{ fill: '#6ee7b7', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6ee7b7', fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: '#6ee7b7', fontSize: '12px' }} />
            <Line type="monotone" dataKey="actual"    stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="forecast"  stroke="#60a5fa" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Forecast" />
            <Line type="monotone" dataKey="renewable" stroke="#22c55e" strokeWidth={2} dot={false} name="Renewable Target" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
