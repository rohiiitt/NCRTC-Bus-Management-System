import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_VEHICLES } from '../mockData';

export default function VehiclesPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ regNo: '', depotId: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.vehicles || []);
    } catch {
      setVehicles(MOCK_VEHICLES);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/vehicles', { ...form, depotId: +form.depotId });
    } catch {}
    // Add locally for demo
    setVehicles(prev => [...prev, { id: Date.now(), regNo: form.regNo, status: form.status, depot: { name: `Depot ${form.depotId}` } }]);
    setShowModal(false);
    setForm({ regNo: '', depotId: '', status: 'active' });
    setSaving(false);
  };

  if (!isAdmin) { navigate('/'); return null; }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Vehicles</div>
          <div className="page-sub">Fleet management — {vehicles.length} registered</div>
        </div>
        <button id="add-vehicle-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Vehicle</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{vehicles.length}</div></div>
        <div className="stat-card"><div className="stat-label">Active</div><div className="stat-value" style={{color:'var(--green)'}}>{vehicles.filter(v=>v.status==='active').length}</div></div>
        <div className="stat-card"><div className="stat-label">Maintenance</div><div className="stat-value" style={{color:'var(--yellow)'}}>{vehicles.filter(v=>v.status==='maintenance').length}</div></div>
        <div className="stat-card"><div className="stat-label">Retired</div><div className="stat-value" style={{color:'var(--text3)'}}>{vehicles.filter(v=>v.status==='retired').length}</div></div>
      </div>

      <div className="card">
        {loading && <div className="loading"><span className="spin">⟳</span> Loading vehicles…</div>}
        {!loading && vehicles.length === 0 && <div className="empty">No vehicles registered</div>}
        {vehicles.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Reg No</th><th>Depot</th><th>Status</th></tr></thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td className="muted">{v.id}</td>
                    <td><strong>{v.regNo}</strong></td>
                    <td className="muted">{v.depot?.name || '—'}</td>
                    <td>
                      <span className={`badge ${v.status==='active'?'badge-green':v.status==='maintenance'?'badge-in_progress':'badge-draft'}`}>{v.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Vehicle</span>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Registration Number</label>
                  <input id="vehicle-regno" type="text" className="form-control" placeholder="DL 1P 1234" value={form.regNo} onChange={e => setForm({...form, regNo:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Depot ID</label>
                  <input id="vehicle-depot" type="number" className="form-control" placeholder="1" value={form.depotId} onChange={e => setForm({...form, depotId:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select id="vehicle-status" className="form-control" value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="vehicle-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spin">⟳</span> Adding…</> : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
