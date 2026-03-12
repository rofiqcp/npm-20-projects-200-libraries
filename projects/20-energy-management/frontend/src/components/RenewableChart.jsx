import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TOOLTIP_STYLE = { backgroundColor: '#064e3b', border: '1px solid #065f46', borderRadius: '8px', color: '#ecfdf5' };

export default function RenewableChart({ data }) {
  const safeData = data || Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    solar: i >= 6 && i <= 18 ? Math.round(200 + Math.random() * 300) : Math.round(Math.random() * 20),
    wind:  Math.round(80 + Math.random() * 120),
    grid:  Math.round(300 + Math.random() * 400)
  }));

  const totalSolar = safeData.reduce((s, d) => s + (d.solar || 0), 0);
  const totalWind  = safeData.reduce((s, d) => s + (d.wind || 0), 0);
  const totalGrid  = safeData.reduce((s, d) => s + (d.grid || 0), 0);
  const total = totalSolar + totalWind + totalGrid;
  const renewablePct = total > 0 ? +((totalSolar + totalWind) / total * 100).toFixed(1) : 0;

  return (
    <div className="rounded-xl p-5 border" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">🌱 Energy Mix (24h)</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-400">{renewablePct}%</span>
          <span className="text-xs text-emerald-300">Renewable</span>
        </div>
      </div>
      <div className="flex gap-3 mb-3 text-xs">
        {[['☀️ Solar', totalSolar, '#fbbf24'], ['💨 Wind', totalWind, '#60a5fa'], ['🔌 Grid', totalGrid, '#6b7280']].map(([lbl, val, color]) => (
          <div key={lbl} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span style={{ color: '#6ee7b7' }}>{lbl}</span>
            <span className="font-bold text-white">{val.toLocaleString()} kWh</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={safeData} margin={{ left: -20 }}>
          <defs>
            {[['solarGrad','#fbbf24'], ['windGrad','#60a5fa'], ['gridGrad','#6b7280']].map(([id, color]) => (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
          <XAxis dataKey="time" tick={{ fill: '#6ee7b7', fontSize: 10 }} interval={3} />
          <YAxis tick={{ fill: '#6ee7b7', fontSize: 10 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ color: '#6ee7b7', fontSize: '11px' }} />
          <Area type="monotone" dataKey="solar" stroke="#fbbf24" fill="url(#solarGrad)" strokeWidth={2} dot={false} name="Solar" stackId="1" />
          <Area type="monotone" dataKey="wind"  stroke="#60a5fa" fill="url(#windGrad)"  strokeWidth={2} dot={false} name="Wind"  stackId="1" />
          <Area type="monotone" dataKey="grid"  stroke="#6b7280" fill="url(#gridGrad)"  strokeWidth={2} dot={false} name="Grid"  stackId="1" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
