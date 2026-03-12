import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const generateProductionData = () =>
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({
    day,
    target: 400,
    actual: Math.round(350 + Math.random() * 100),
    defects: Math.round(Math.random() * 20)
  }));

const generateEnergyData = () =>
  Array.from({length: 24}, (_, i) => ({
    hour: `${i}:00`,
    consumption: +(15 + Math.random() * 30).toFixed(1),
    cost: +(0.12 * (15 + Math.random() * 30)).toFixed(2)
  }));

const OEE_DATA = [
  { name: 'CNC Mill A',       oee: 87, availability: 92, performance: 96, quality: 98 },
  { name: 'Lathe B',          oee: 82, availability: 88, performance: 94, quality: 99 },
  { name: 'Press C',          oee: 91, availability: 95, performance: 97, quality: 99 },
  { name: 'Welder D',         oee: 78, availability: 84, performance: 93, quality: 100 },
  { name: 'Conveyor E',       oee: 95, availability: 98, performance: 99, quality: 98 },
  { name: 'Grinder F',        oee: 70, availability: 75, performance: 96, quality: 97 },
  { name: 'Drill Press G',    oee: 89, availability: 93, performance: 97, quality: 98 },
  { name: 'Injection Mold H', oee: 65, availability: 70, performance: 95, quality: 97 }
];

const DOWNTIME_DATA = [
  { name: 'Planned Maint.', value: 40, color: '#06b6d4' },
  { name: 'Breakdown',      value: 25, color: '#ef4444' },
  { name: 'Changeover',     value: 20, color: '#f59e0b' },
  { name: 'Quality Check',  value: 15, color: '#8b5cf6' }
];

const TOOLTIP_STYLE = { backgroundColor: '#0f172a', border: '1px solid #1e3a5f', borderRadius: '8px', color: '#e2e8f0' };

export default function Analytics() {
  const [prodData] = useState(generateProductionData);
  const [energyData] = useState(generateEnergyData);

  const totalProd = prodData.reduce((s, d) => s + d.actual, 0);
  const totalDefects = prodData.reduce((s, d) => s + d.defects, 0);
  const qualityRate = (((totalProd - totalDefects) / totalProd) * 100).toFixed(1);
  const totalEnergy = energyData.reduce((s, d) => s + d.consumption, 0).toFixed(1);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">📊 Manufacturing Analytics</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Week Production', value: totalProd.toLocaleString(), icon: '🔩', color: 'text-cyan-400' },
          { label: 'Quality Rate',    value: `${qualityRate}%`,          icon: '✅', color: 'text-green-400' },
          { label: 'Total Defects',   value: totalDefects,               icon: '❌', color: 'text-red-400' },
          { label: 'Energy (kWh)',    value: totalEnergy,                 icon: '⚡', color: 'text-yellow-400' }
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4 border" style={{backgroundColor:'#0f172a', borderColor:'#1e3a5f'}}>
            <p className="text-xs text-slate-400">{k.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl">{k.icon}</span>
              <span className={`text-xl font-bold ${k.color}`}>{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Production Chart */}
      <div className="rounded-xl p-5 border" style={{backgroundColor:'#0f172a', borderColor:'#1e3a5f'}}>
        <h3 className="font-semibold text-white mb-4">📈 Daily Production vs Target</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={prodData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            <Bar dataKey="target" fill="#1e3a5f" name="Target" radius={[4,4,0,0]} />
            <Bar dataKey="actual" fill="#06b6d4" name="Actual" radius={[4,4,0,0]} />
            <Bar dataKey="defects" fill="#ef4444" name="Defects" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* OEE Chart */}
      <div className="rounded-xl p-5 border" style={{backgroundColor:'#0f172a', borderColor:'#1e3a5f'}}>
        <h3 className="font-semibold text-white mb-4">🎯 OEE by Machine</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={OEE_DATA} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}%`} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={80} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`]} />
            <Bar dataKey="oee" name="OEE" radius={[0,4,4,0]}
              fill="#06b6d4"
              label={{ position: 'right', fill: '#94a3b8', fontSize: 11, formatter: v => `${v}%` }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Chart */}
        <div className="rounded-xl p-5 border" style={{backgroundColor:'#0f172a', borderColor:'#1e3a5f'}}>
          <h3 className="font-semibold text-white mb-4">⚡ Energy Consumption (24h)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={energyData} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="energyG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="consumption" stroke="#f59e0b" fill="url(#energyG)" strokeWidth={2} dot={false} name="kWh" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Downtime Pie */}
        <div className="rounded-xl p-5 border" style={{backgroundColor:'#0f172a', borderColor:'#1e3a5f'}}>
          <h3 className="font-semibold text-white mb-4">⏱ Downtime Analysis</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={DOWNTIME_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {DOWNTIME_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {DOWNTIME_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-sm" style={{backgroundColor: d.color}} />
                  <span className="text-slate-300 flex-1">{d.name}</span>
                  <span className="text-slate-400 font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
