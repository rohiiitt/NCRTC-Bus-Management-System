import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'driver' ? '/driver' : '/map');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleDemo = (role) => {
    const demoUsers = {
      admin:            { id: 1, username: 'admin1',    fullName: 'Rajesh Kumar',  role: 'admin',            depotId: null },
      depot_manager:    { id: 2, username: 'manager1',  fullName: 'Rakesh Verma',  role: 'depot_manager',    depotId: 1 },
      control_operator: { id: 3, username: 'operator1', fullName: 'Priya Mehta',   role: 'control_operator', depotId: null },
      driver:           { id: 4, username: 'driver1',   fullName: 'Amit Singh',    role: 'driver',           depotId: 1 },
    };
    const user = demoUsers[role];
    localStorage.setItem('token', 'demo-token');
    localStorage.setItem('user', JSON.stringify(user));
    window.location.href = user.role === 'driver' ? '/driver' : '/map';
  };

  return (
    <div className="login-page">
      {/* Background orbs */}
      <div className="login-bg-orb" style={{ width:700,height:700,top:-300,left:-200,background:'radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 65%)' }} />
      <div className="login-bg-orb" style={{ width:500,height:500,bottom:-200,right:-150,background:'radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 65%)' }} />
      <div className="login-bg-orb" style={{ width:300,height:300,top:'40%',right:'30%',background:'radial-gradient(circle,rgba(16,185,129,.06) 0%,transparent 65%)' }} />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🚌</div>
          <div className="login-logo-text">
            <h1>NCRTC BMS</h1>
            <p>Feeder Bus Management System</p>
          </div>
        </div>

        <h2 className="login-heading">Welcome back</h2>
        <p className="login-sub">Sign in to access the dashboard</p>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input id="username" type="text" className="form-control" placeholder="e.g. admin1"
              value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="password" type="password" className="form-control" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button id="login-btn" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <><span className="spin">⟳</span> Signing in…</> : '→ Sign In'}
          </button>
        </form>

        <div className="divider" />

        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            Quick Demo
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { role: 'admin',            emoji: '🛡', label: 'Admin',         sub: 'Full access' },
              { role: 'depot_manager',    emoji: '🏢', label: 'Depot Manager', sub: 'Noida depot' },
              { role: 'control_operator', emoji: '🖥', label: 'Operator',      sub: 'Live map' },
              { role: 'driver',           emoji: '🚌', label: 'Driver',        sub: 'Mobile view' },
            ].map(({ role, emoji, label, sub }) => (
              <button key={role} id={`demo-${role}`} type="button" onClick={() => handleDemo(role)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg3)'; }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{emoji} {label}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
