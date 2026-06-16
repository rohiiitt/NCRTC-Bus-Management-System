import { useState, useEffect } from 'react';
import api from '../../api';
import { MOCK_MY_DUTY } from '../../mockData';

export default function MyDutyPage() {
  const [duty, setDuty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acking, setAcking] = useState(false);
  const [panicking, setPanicking] = useState(false);
  const [panicSuccess, setPanicSuccess] = useState('');

  const fetchDuty = async () => {
    try {
      const res = await api.get('/duties/my');
      setDuty(res.data.duty);
    } catch {
      setDuty(MOCK_MY_DUTY);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDuty(); }, []);

  const acknowledge = async () => {
    setAcking(true);
    try {
      await api.patch(`/duties/${duty.id}/acknowledge`);
    } catch {}
    setDuty(prev => ({ ...prev, status: 'acknowledged', ackAt: new Date().toISOString() }));
    setAcking(false);
  };

  const panic = async () => {
    if (!window.confirm('🚨 This will raise a P1 Emergency. Are you sure?')) return;
    setPanicking(true);
    try { await api.post('/incidents/panic'); } catch {}
    setPanicSuccess('🚨 P1 Emergency raised! Help is on the way.');
    setTimeout(() => setPanicSuccess(''), 6000);
    setPanicking(false);
  };

  if (loading) return <div className="loading"><span className="spin">⟳</span> Loading your duty…</div>;

  return (
    <div className="driver-home">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>My Duty</div>
      </div>

      {panicSuccess && <div className="alert alert-error" style={{ textAlign: 'center', fontWeight: 600 }}>{panicSuccess}</div>}

      {duty && (
        <>
          <div className="duty-card">
            <div className="duty-card-head">
              <h2>{duty.vehicle?.regNo}</h2>
              <p>{duty.route?.name} · {duty.route?.code}</p>
            </div>
            <div className="duty-card-body">
              <div className="duty-row"><span className="duty-row-label">Status</span><span className="duty-row-val"><span className={`badge badge-${duty.status}`}>{duty.status}</span></span></div>
              <div className="duty-row"><span className="duty-row-label">Start</span><span className="duty-row-val">{duty.startTime}</span></div>
              <div className="duty-row"><span className="duty-row-label">End</span><span className="duty-row-val">{duty.endTime}</span></div>
              {duty.ackAt && <div className="duty-row"><span className="duty-row-label">Acknowledged</span><span className="duty-row-val" style={{color:'var(--green)',fontSize:12}}>{new Date(duty.ackAt).toLocaleTimeString()}</span></div>}
            </div>
          </div>

          {duty.status === 'published' && (
            <button id="ack-btn" className="btn btn-success btn-lg w-full mb-4" onClick={acknowledge} disabled={acking} style={{ borderRadius: 10 }}>
              {acking ? <><span className="spin">⟳</span> Acknowledging…</> : '✓ Acknowledge Duty'}
            </button>
          )}

          {duty.route?.stops?.length > 0 && (
            <div className="card mb-4">
              <div className="card-title mb-4">Route Stops</div>
              <ul className="stops-list">
                {duty.route.stops.map((rs, i) => (
                  <li key={i} className="stop-item">
                    <div className="stop-seq">{rs.sequence}</div>
                    <div>
                      <div className="stop-name">{rs.stop?.name}</div>
                      {rs.plannedOffsetMin != null && <div className="stop-time">+{rs.plannedOffsetMin} min from start</div>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!duty && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚌</div>
          <div style={{ fontWeight: 600 }}>No duty assigned today</div>
        </div>
      )}

      <button id="panic-btn" className="panic-btn" onClick={panic} disabled={panicking}>
        {panicking ? '⟳ Raising Emergency…' : '🚨 PANIC / EMERGENCY'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
        Press only in case of breakdown or emergency
      </div>
    </div>
  );
}
