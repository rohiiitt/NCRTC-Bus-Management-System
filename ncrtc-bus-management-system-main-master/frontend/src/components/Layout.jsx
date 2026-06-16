import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Administrator', depot_manager: 'Depot Manager',
  control_operator: 'Control Operator', driver: 'Driver', executive: 'Executive',
};

export default function Layout() {
  const { user } = useAuth();
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <header className="topbar">
          <div className="topbar-brand">
            <div className="topbar-brand-icon">🚌</div>
            NCRTC Bus Management System
          </div>
          <div className="topbar-right">
            <span className="topbar-user">{user?.fullName}</span>
            <span className="topbar-role">{ROLE_LABELS[user?.role] || user?.role}</span>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
