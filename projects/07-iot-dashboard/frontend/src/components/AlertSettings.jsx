import React, { useState } from 'react';
import axios from 'axios';

export default function AlertSettings({ sensors, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const startEdit = (sensor) => {
    setEditingId(sensor.id);
    setForm({
      temp_min_alert: sensor.temp_min_alert,
      temp_max_alert: sensor.temp_max_alert,
      humidity_max_alert: sensor.humidity_max_alert,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const saveThresholds = async (sensorId) => {
    setSaving(true);
    try {
      await axios.put(`/api/sensors/${sensorId}`, form);
      setEditingId(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update thresholds:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-lg font-bold text-white mb-4">⚙️ Alert Thresholds</h2>
      <div className="space-y-4">
        {sensors.map(sensor => (
          <div key={sensor.id} className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-white">{sensor.name}</p>
                <p className="text-slate-400 text-xs">{sensor.location}</p>
              </div>
              {editingId === sensor.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => saveThresholds(sensor.id)}
                    disabled={saving}
                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(sensor)}
                  className="text-xs bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-500 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {editingId === sensor.id ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Min Temp (°C)</label>
                  <input
                    type="number"
                    value={form.temp_min_alert}
                    onChange={(e) => setForm({ ...form, temp_min_alert: parseFloat(e.target.value) })}
                    className="w-full bg-slate-600 text-white border border-slate-500 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Max Temp (°C)</label>
                  <input
                    type="number"
                    value={form.temp_max_alert}
                    onChange={(e) => setForm({ ...form, temp_max_alert: parseFloat(e.target.value) })}
                    className="w-full bg-slate-600 text-white border border-slate-500 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Max Humidity (%)</label>
                  <input
                    type="number"
                    value={form.humidity_max_alert}
                    onChange={(e) => setForm({ ...form, humidity_max_alert: parseFloat(e.target.value) })}
                    className="w-full bg-slate-600 text-white border border-slate-500 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Min Temp</p>
                  <p className="text-blue-400 font-medium">{sensor.temp_min_alert}°C</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Max Temp</p>
                  <p className="text-red-400 font-medium">{sensor.temp_max_alert}°C</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Max Humidity</p>
                  <p className="text-yellow-400 font-medium">{sensor.humidity_max_alert}%</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
