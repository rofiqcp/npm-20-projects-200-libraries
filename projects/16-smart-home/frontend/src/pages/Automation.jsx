import { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_RULES = [
  { id: 'r1', name: 'Morning Lights',   condition: 'time == 07:00', action: 'turn_on_lights',    enabled: true,  triggerCount: 42 },
  { id: 'r2', name: 'Night Mode',       condition: 'time == 23:00', action: 'turn_off_lights',   enabled: true,  triggerCount: 38 },
  { id: 'r3', name: 'Hot Day AC',       condition: 'temp > 28°C',   action: 'set_thermostat_20', enabled: true,  triggerCount: 12 },
  { id: 'r4', name: 'Motion Security',  condition: 'motion == true', action: 'start_recording',  enabled: false, triggerCount: 7 },
  { id: 'r5', name: 'Away Lock',        condition: 'presence == false', action: 'lock_all',      enabled: true,  triggerCount: 20 }
];

export default function Automation() {
  const [rules, setRules] = useState(MOCK_RULES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', condition: '', action: '', enabled: true });

  useEffect(() => {
    axios.get('/api/automation-rules').then(r => setRules(r.data)).catch(() => {});
  }, []);

  const toggleRule = async (rule) => {
    const updated = { ...rule, enabled: !rule.enabled };
    try {
      await axios.put(`/api/automation-rules/${rule.id}`, updated);
    } catch {}
    setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
  };

  const deleteRule = async (id) => {
    try { await axios.delete(`/api/automation-rules/${id}`); } catch {}
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const addRule = async (e) => {
    e.preventDefault();
    if (!form.name || !form.condition || !form.action) return;
    try {
      const { data } = await axios.post('/api/automation-rules', form);
      setRules(prev => [...prev, data]);
    } catch {
      setRules(prev => [...prev, { ...form, id: `r${Date.now()}`, triggerCount: 0 }]);
    }
    setForm({ name: '', condition: '', action: '', enabled: true });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">⚙️ Automation Rules</h2>
          <p className="text-gray-400 text-sm mt-1">Configure smart automation triggers and actions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
          + New Rule
        </button>
      </div>

      {showForm && (
        <form onSubmit={addRule} className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-white">Create Automation Rule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Rule Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Morning Routine"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Condition</label>
              <input value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}
                placeholder="e.g. time == 07:00"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Action</label>
              <input value={form.action} onChange={e => setForm({...form, action: e.target.value})}
                placeholder="e.g. turn_on_living_room_light"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enabled} onChange={e => setForm({...form, enabled: e.target.checked})}
                  className="w-4 h-4 accent-blue-500" />
                <span className="text-sm text-gray-300">Enable immediately</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">Save Rule</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {rules.map(rule => (
          <div key={rule.id} className={`bg-gray-800 border rounded-xl p-4 transition-all ${rule.enabled ? 'border-blue-500/30' : 'border-gray-700 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                  <h4 className="font-semibold text-white">{rule.name}</h4>
                  <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">{rule.triggerCount} triggers</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded">
                    IF: {rule.condition}
                  </span>
                  <span className="text-xs text-gray-400">→</span>
                  <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded">
                    THEN: {rule.action}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => toggleRule(rule)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${rule.enabled ? 'bg-blue-500' : 'bg-gray-600'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => deleteRule(rule.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-sm">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">⚙️</p>
          <p>No automation rules yet. Create your first rule above.</p>
        </div>
      )}
    </div>
  );
}
