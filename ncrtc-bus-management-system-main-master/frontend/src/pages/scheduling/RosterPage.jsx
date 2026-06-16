import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { MOCK_DUTIES } from '../../mockData';

const STATUS_BADGE = { draft: 'badge-draft', published: 'badge-published', acknowledged: 'badge-acknowledged' };

export default function RosterPage() {
  const { isAdmin, isManager } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ vehicleId: '', driverId: '', routeId: '', startTime: '06:00', endTime: '14:00' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDuties = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/duties?date=${date}`);
      setDuties(res.data.duties || []);
      setIsDemo(false);
    } catch {
      setDuties(MOCK_DUTIES);
      setIsDemo(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDuties(); }, [date]);

  const openModal = async () => {
    try {
      const [vRes, dRes, rRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/duties/drivers'),
        api.get('/duties/routes'),
      ]);
      setVehicles(vRes.data.vehicles || []);
      setDrivers(dRes.data.drivers || []);
      setRoutes(rRes.data.routes || []);
    } catch {
      setVehicles([{ id: 1, regNo: 'DL 1P 0001' }, { id: 2, regNo: 'DL 1P 0002' }]);
      setDrivers([{ id: 4, fullName: 'Amit Singh' }, { id: 5, fullName: 'Ravi Sharma' }]);
      setRoutes([{ id: 1, name: 'NS52 → Noida Sec 51', code: 'R-101' }, { id: 2, name: 'GZB → Vaishali', code: 'R-201' }]);
    }
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.post('/duties', { ...form, date, vehicleId: +form.vehicleId, driverId: +form.driverId, routeId: +form.routeId });
      setShowModal(false);
      setSuccess('Duty created successfully');
      fetchDuties();
    } catch {
      if (isDemo) {
        setShowModal(false);
        setSuccess('(Demo) Duty created successfully');
        setDuties(prev => [...prev, { id: Date.now(), date, status: 'draft', startTime: form.startTime, endTime: form.endTime, driver: { fullName: 'Demo Driver' }, vehicle: { regNo: form.vehicleId }, route: { name: 'Demo Route', code: 'R-XXX' } }]);
      } else {
        setError('Failed to create duty');
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const publishDuty = async (id) => {
    try {
      await api.patch(`/duties/${id}/publish`);
    } catch {}
    setDuties(prev => prev.map(d => d.id === id ? { ...d, status: 'published' } : d));
  };

  const stats = {
    total: duties.length,
    published: duties.filter(d => d.status === 'published').length,
    acknowledged: duties.filter(d => d.status === 'acknowledged').length,
    draft: duties.filter(d => d.status === 'draft').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Duty Roster {isDemo && <span className="badge badge-P2" style={{fontSize:10,marginLeft:8}}>DEMO</span>}</div>
          <div className="page-sub">Manage daily bus assignments</div>
        </div>
        {(isAdmin || isManager) && <button id="create-duty-btn" className="btn btn-primary" onClick={openModal}>+ Create Duty</button>}
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card"><div className="stat-label">Draft</div><div className="stat-value" style={{color:'var(--text2)'}}>{stats.draft}</div></div>
        <div className="stat-card"><div className="stat-label">Published</div><div className="stat-value" style={{color:'var(--accent)'}}>{stats.published}</div></div>
        <div className="stat-card"><div className="stat-label">Acknowledged</div><div className="stat-value" style={{color:'var(--green)'}}>{stats.acknowledged}</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Duties for {date}</div>
          <input id="roster-date" type="date" className="form-control" style={{ width: 'auto' }} value={date} onChange={e => setDate(e.target.value)} />
        </div>
        {loading && <div className="loading"><span className="spin">⟳</span> Loading duties…</div>}
        {!loading && duties.length === 0 && <div className="empty">No duties scheduled for this date</div>}
        {duties.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Driver</th><th>Vehicle</th><th>Route</th><th>Start</th><th>End</th><th>Status</th>{(isAdmin || isManager) && <th>Actions</th>}</tr></thead>
              <tbody>
                {duties.map(d => (
                  <tr key={d.id}>
                    <td>{d.driver?.fullName || '—'}</td>
                    <td>{d.vehicle?.regNo || '—'}</td>
                    <td>{d.route?.name} <span className="text-muted text-sm">{d.route?.code}</span></td>
                    <td className="muted">{d.startTime}</td>
                    <td className="muted">{d.endTime}</td>
                    <td><span className={`badge ${STATUS_BADGE[d.status] || 'badge-draft'}`}>{d.status}</span></td>
                    {(isAdmin || isManager) && (
                      <td>
                        {d.status === 'draft'
                          ? <button className="btn btn-primary btn-sm" onClick={() => publishDuty(d.id)}>Publish</button>
                          : <span className="text-muted text-sm">—</span>}
                      </td>
                    )}
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
              <span className="modal-title">Create New Duty</span>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Vehicle</label>
                  <select id="duty-vehicle" className="form-control" value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})} required>
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Driver</label>
                  <select id="duty-driver" className="form-control" value={form.driverId} onChange={e => setForm({...form, driverId: e.target.value})} required>
                    <option value="">Select driver</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Route</label>
                  <select id="duty-route" className="form-control" value={form.routeId} onChange={e => setForm({...form, routeId: e.target.value})} required>
                    <option value="">Select route</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.code} — {r.name}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input id="duty-start" type="time" className="form-control" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <input id="duty-end" type="time" className="form-control" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="duty-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spin">⟳</span> Creating…</> : 'Create Duty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
