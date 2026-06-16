import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { MOCK_INCIDENT_DETAIL } from '../../mockData';

const SEV_BADGE  = { P1:'badge-P1', P2:'badge-P2', P3:'badge-P3' };
const STAT_BADGE = { open:'badge-open', acknowledged:'badge-published', in_progress:'badge-in_progress', resolved:'badge-resolved', closed:'badge-closed' };
const TRANSITIONS = { open:['acknowledged'], acknowledged:['in_progress'], in_progress:['resolved'], resolved:['closed'] };

export default function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager, isOperator } = useAuth();
  const canUpdate = isAdmin || isManager || isOperator;
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [assignId, setAssignId] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchIncident = async () => {
    try {
      const res = await api.get(`/incidents/${id}`);
      setIncident(res.data.incident);
    } catch {
      setIncident({ ...MOCK_INCIDENT_DETAIL, id: +id });
      setIsDemo(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchIncident(); }, [id]);

  const updateStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status) return;
    setUpdating(true);
    try {
      await api.patch(`/incidents/${id}/status`, statusForm);
    } catch {}
    // Apply locally
    setIncident(prev => ({
      ...prev, status: statusForm.status,
      events: [...(prev.events || []), { ts: new Date().toISOString(), fromStatus: prev.status, toStatus: statusForm.status, note: statusForm.note, actor: { fullName: 'You', role: 'admin' } }],
    }));
    setStatusForm({ status: '', note: '' });
    setUpdating(false);
  };

  if (loading) return <div className="loading"><span className="spin">⟳</span> Loading incident…</div>;
  if (!incident) return null;

  const nextStatuses = TRANSITIONS[incident.status] || [];

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/incidents')}>← Back</button>
          <div>
            <div className="page-title">Incident #{incident.id} {isDemo && <span className="badge badge-P2" style={{fontSize:10,marginLeft:8}}>DEMO</span>}</div>
            <div className="page-sub">{new Date(incident.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <span className={`badge ${SEV_BADGE[incident.severity]}`}>{incident.severity}</span>
          <span className={`badge ${STAT_BADGE[incident.status] || 'badge-draft'}`}>{incident.status.replace('_',' ')}</span>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card mb-4">
            <div className="card-title mb-4">Incident Details</div>
            {[['Type', <span style={{textTransform:'capitalize'}}>{incident.type}</span>],
              ['Vehicle', incident.vehicle?.regNo || '—'],
              ['Raised By', `${incident.raisedBy?.fullName} (${incident.raisedBy?.role})`],
              ['Assigned To', incident.assignedTo?.fullName || 'Unassigned'],
              ['Resolved At', incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : '—'],
            ].map(([label, val]) => (
              <div key={label} className="duty-row">
                <span className="duty-row-label">{label}</span>
                <span className="duty-row-val">{val}</span>
              </div>
            ))}
            {incident.description && (
              <div style={{ marginTop:14, padding:12, background:'var(--bg3)', borderRadius:6, fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>
                {incident.description}
              </div>
            )}
          </div>

          {canUpdate && (
            <div className="card mb-4">
              <div className="card-title mb-4">Update Status</div>
              <form onSubmit={updateStatus}>
                <div className="form-group">
                  <label className="form-label">New Status</label>
                  <select id="status-select" className="form-control" value={statusForm.status} onChange={e => setStatusForm({...statusForm, status:e.target.value})} required>
                    <option value="">Select next status</option>
                    {nextStatuses.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <textarea id="status-note" className="form-control" placeholder="Add a note…" value={statusForm.note} onChange={e => setStatusForm({...statusForm, note:e.target.value})} />
                </div>
                <button id="update-status-btn" type="submit" className="btn btn-primary" disabled={updating || nextStatuses.length === 0}>
                  {updating ? <><span className="spin">⟳</span> Updating…</> : 'Update Status'}
                </button>
                {nextStatuses.length === 0 && <span className="text-muted text-sm" style={{marginLeft:10}}>No further transitions</span>}
              </form>
            </div>
          )}

          {canUpdate && (
            <div className="card">
              <div className="card-title mb-4">Assign Incident</div>
              <form onSubmit={e => { e.preventDefault(); setIncident(prev => ({...prev, assignedTo:{fullName:`User #${assignId}`}})); setAssignId(''); }} style={{display:'flex',gap:10}}>
                <input id="assign-user-id" type="number" className="form-control" placeholder="User ID to assign" value={assignId} onChange={e => setAssignId(e.target.value)} />
                <button id="assign-btn" type="submit" className="btn btn-ghost" disabled={!assignId}>Assign</button>
              </form>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title mb-4">Event Timeline</div>
          {!incident.events?.length && <div className="empty">No events yet</div>}
          <div className="timeline">
            {incident.events?.map((ev, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" style={{background: ev.toStatus==='resolved'?'var(--green)':ev.toStatus==='open'?'var(--red)':'var(--accent)'}} />
                <div className="timeline-content">
                  <div className="timeline-ts">{new Date(ev.ts).toLocaleString()}</div>
                  <div className="timeline-actor">
                    {ev.actor?.fullName}
                    {ev.fromStatus && <span style={{color:'var(--text3)',fontWeight:400,fontSize:12}}> · {ev.fromStatus} → {ev.toStatus}</span>}
                  </div>
                  {ev.note && <div className="timeline-note">{ev.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
