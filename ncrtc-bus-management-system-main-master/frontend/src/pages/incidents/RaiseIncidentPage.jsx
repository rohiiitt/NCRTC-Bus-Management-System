import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function RaiseIncidentPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ type: 'breakdown', severity: 'P2', description: '', vehicleId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/vehicles').then(r => setVehicles(r.data.vehicles || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const body = { ...form };
      if (!body.vehicleId) delete body.vehicleId;
      else body.vehicleId = +body.vehicleId;
      await api.post('/incidents', body);
      navigate('/incidents');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to raise incident');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Raise Incident</div>
          <div className="page-sub">Report a breakdown or emergency</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/incidents')}>← Back</button>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Incident Type</label>
            <select id="inc-type" className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})} required>
              <option value="breakdown">Breakdown</option>
              <option value="accident">Accident</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Severity</label>
            <select id="inc-severity" className="form-control" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} required>
              <option value="P1">P1 – Critical / Life Safety</option>
              <option value="P2">P2 – Major Disruption</option>
              <option value="P3">P3 – Minor</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle (optional)</label>
            <select id="inc-vehicle" className="form-control" value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})}>
              <option value="">No specific vehicle</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="inc-description"
              className="form-control"
              rows={4}
              placeholder="Describe what happened…"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button id="inc-submit-btn" type="submit" className="btn btn-danger" disabled={saving}>
              {saving ? <><span className="spin">⟳</span> Raising…</> : '⚠ Raise Incident'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/incidents')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
