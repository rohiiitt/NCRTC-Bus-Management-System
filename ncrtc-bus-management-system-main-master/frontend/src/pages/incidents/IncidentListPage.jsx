import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { MOCK_INCIDENTS } from '../../mockData';

const SEV_BADGE  = { P1: 'badge-P1', P2: 'badge-P2', P3: 'badge-P3' };
const STAT_BADGE = { open:'badge-open', acknowledged:'badge-published', in_progress:'badge-in_progress', resolved:'badge-resolved', closed:'badge-closed' };

export default function IncidentListPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [filters, setFilters] = useState({ status: '', severity: '', type: '' });

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.status)   params.set('status',   filters.status);
        if (filters.severity) params.set('severity', filters.severity);
        if (filters.type)     params.set('type',     filters.type);
        const res = await api.get(`/incidents?${params}`);
        setIncidents(res.data.incidents || []);
        setIsDemo(false);
      } catch {
        let data = [...MOCK_INCIDENTS];
        if (filters.status)   data = data.filter(i => i.status   === filters.status);
        if (filters.severity) data = data.filter(i => i.severity === filters.severity);
        if (filters.type)     data = data.filter(i => i.type     === filters.type);
        setIncidents(data);
        setIsDemo(true);
      }
      setLoading(false);
    };
    fetchIncidents();
  }, [filters]);

  const stats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'open').length,
    inProgress: incidents.filter(i => i.status === 'in_progress').length,
    p1: incidents.filter(i => i.severity === 'P1').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Incident Management {isDemo && <span className="badge badge-P2" style={{fontSize:10,marginLeft:8}}>DEMO</span>}</div>
          <div className="page-sub">Track breakdowns and emergencies</div>
        </div>
        <button id="raise-incident-btn" className="btn btn-danger" onClick={() => navigate('/incidents/raise')}>⚠ Raise Incident</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card"><div className="stat-label">Open</div><div className="stat-value" style={{color:'var(--red)'}}>{stats.open}</div></div>
        <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value" style={{color:'var(--yellow)'}}>{stats.inProgress}</div></div>
        <div className="stat-card"><div className="stat-label">P1 Critical</div><div className="stat-value" style={{color:'var(--red)'}}>{stats.p1}</div></div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select id="filter-status"   className="form-control" value={filters.status}   onChange={e => setFilters({...filters, status:   e.target.value})}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select id="filter-severity" className="form-control" value={filters.severity} onChange={e => setFilters({...filters, severity: e.target.value})}>
            <option value="">All Severities</option>
            <option value="P1">P1 – Critical</option>
            <option value="P2">P2 – Major</option>
            <option value="P3">P3 – Minor</option>
          </select>
          <select id="filter-type"     className="form-control" value={filters.type}     onChange={e => setFilters({...filters, type:     e.target.value})}>
            <option value="">All Types</option>
            <option value="breakdown">Breakdown</option>
            <option value="accident">Accident</option>
            <option value="emergency">Emergency</option>
            <option value="other">Other</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({status:'',severity:'',type:''})}>Reset</button>
        </div>

        {loading && <div className="loading"><span className="spin">⟳</span> Loading incidents…</div>}
        {!loading && incidents.length === 0 && <div className="empty">No incidents found</div>}
        {incidents.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Type</th><th>Severity</th><th>Status</th><th>Vehicle</th><th>Raised By</th><th>Assigned To</th><th>Time</th></tr></thead>
              <tbody>
                {incidents.map(i => (
                  <tr key={i.id} onClick={() => navigate(`/incidents/${i.id}`)}>
                    <td style={{textTransform:'capitalize'}}>{i.type}</td>
                    <td><span className={`badge ${SEV_BADGE[i.severity]}`}>{i.severity}</span></td>
                    <td><span className={`badge ${STAT_BADGE[i.status] || 'badge-draft'}`}>{i.status.replace('_',' ')}</span></td>
                    <td>{i.vehicle?.regNo || '—'}</td>
                    <td className="muted">{i.raisedBy?.fullName}</td>
                    <td className="muted">{i.assignedTo?.fullName || 'Unassigned'}</td>
                    <td className="muted">{new Date(i.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
