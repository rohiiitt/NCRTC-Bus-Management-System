import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LINKS = {
  driver:           [{ to:'/driver',    icon:'🚌', label:'My Duty' }, { to:'/notices', icon:'📢', label:'Notices' }],
  depot_manager:    [{ to:'/map',       icon:'🗺️',  label:'Live Map' }, { to:'/roster', icon:'📅', label:'Roster' }, { to:'/incidents', icon:'⚠️', label:'Incidents' }, { to:'/notices', icon:'📢', label:'Notices' }],
  control_operator: [{ to:'/map',       icon:'🗺️',  label:'Live Map' }, { to:'/incidents', icon:'⚠️', label:'Incidents' }, { to:'/notices', icon:'📢', label:'Notices' }],
  admin:            [{ to:'/map',       icon:'🗺️',  label:'Live Map' }, { to:'/roster', icon:'📅', label:'Roster' }, { to:'/incidents', icon:'⚠️', label:'Incidents' }, { to:'/notices', icon:'📢', label:'Notices' }, { to:'/vehicles', icon:'🚍', label:'Vehicles' }],
  executive:        [{ to:'/map',       icon:'🗺️',  label:'Live Map' }, { to:'/incidents', icon:'⚠️', label:'Incidents' }, { to:'/notices', icon:'📢', label:'Notices' }],
};

const ROLE_LABELS = {
  admin:'Administrator', depot_manager:'Depot Manager',
  control_operator:'Control Operator', driver:'Driver', executive:'Executive',
};

const ROLE_COLORS = {
  admin: '#3b82f6', depot_manager: '#10b981',
  control_operator: '#8b5cf6', driver: '#f59e0b', executive: '#64748b',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = ROLE_LINKS[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <div className="logo-icon">🚌</div>
          <div>
            <div className="sidebar-brand-name">NCRTC BMS</div>
            <div className="sidebar-brand-sub">Fleet Operations</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Menu</div>
        {links.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="link-icon">{icon}</span>
            <span className="link-label">{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="depot-chip" style={{ borderLeft: `3px solid ${ROLE_COLORS[user?.role] || 'var(--accent)'}` }}>
          <strong>{user?.fullName}</strong>
          <span style={{ color: ROLE_COLORS[user?.role], fontSize: 11, fontWeight: 600 }}>{ROLE_LABELS[user?.role]}</span>
          {user?.depotId && <span style={{ display:'block', fontSize:10, color:'var(--text3)', marginTop:2 }}>Depot #{user.depotId}</span>}
        </div>
        <button className="btn btn-ghost btn-sm w-full mt-2" onClick={() => { logout(); navigate('/login'); }}>
          ⎋ Sign Out
        </button>
      </div>
    </aside>
  );
}
