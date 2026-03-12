import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateMockHistory = (type) => {
  const base = type === 'Robotic Welder' ? 310 : type === 'Injection Mold' ? 185 : 65;
  return Array.from({ length: 20 }, (_, i) => ({
    t: `${i}s`,
    temperature: +(base + (Math.random() - 0.5) * 10).toFixed(1),
    vibration: +(2 + Math.random() * 2).toFixed(2),
    power: +(18 + (Math.random() - 0.5) * 4).toFixed(1)
  }));
};

export default function SensorChart({ machine, history }) {
  const data = (history && history.length > 0)
    ? history.map((h, i) => ({
        t: `${i * 2}s`,
        temperature: h.temperature,
        vibration: h.vibration,
        power: h.power
      }))
    : generateMockHistory(machine?.type || '');

  const TEMP_THRESHOLD = machine?.type === 'Robotic Welder' ? 350 : machine?.type === 'Injection Mold' ? 200 : 90;
  const VIB_THRESHOLD = 5;

  return (
    <div className="rounded-xl p-4 border" style={{backgroundColor:'#0f172a', borderColor:'#1e3a5f'}}>
      <h4 className="text-sm font-semibold text-white mb-3">{machine?.name || 'Machine'} — Live Sensors</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
          <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 10 }} interval={4} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e3a5f', borderRadius: '8px', color: '#e2e8f0' }}
            formatter={(value, name) => [
              `${value}${name === 'temperature' ? '°C' : name === 'vibration' ? 'g' : 'kW'}`,
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={1.5} dot={false} name="Temperature" />
          <Line type="monotone" dataKey="vibration"   stroke="#a855f7" strokeWidth={1.5} dot={false} name="Vibration" />
          <Line type="monotone" dataKey="power"       stroke="#06b6d4" strokeWidth={1.5} dot={false} name="Power" />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-3 mt-2 text-xs text-slate-500">
        <span>⚠ Temp threshold: {TEMP_THRESHOLD}°C</span>
        <span>⚠ Vib threshold: {VIB_THRESHOLD}g</span>
      </div>
    </div>
  );
}
