import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout               from './components/Layout';
import LoginPage            from './pages/LoginPage';
import LiveMapPage          from './pages/avls/LiveMapPage';
import HistoryPage          from './pages/avls/HistoryPage';
import RosterPage           from './pages/scheduling/RosterPage';
import MyDutyPage           from './pages/scheduling/MyDutyPage';
import IncidentListPage     from './pages/incidents/IncidentListPage';
import IncidentDetailPage   from './pages/incidents/IncidentDetailPage';
import RaiseIncidentPage    from './pages/incidents/RaiseIncidentPage';
import NoticeListPage       from './pages/notices/NoticeListPage';
import CreateNoticePage     from './pages/notices/CreateNoticePage';
import NoticeReceiptsPage   from './pages/notices/NoticeReceiptsPage';
import VehiclesPage         from './pages/VehiclesPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        {/* Root redirect based on role */}
        <Route index element={
          user?.role === 'driver'
            ? <Navigate to="/driver" replace />
            : <Navigate to="/map" replace />
        } />

        {/* AVLS */}
        <Route path="map"     element={<LiveMapPage />} />
        <Route path="history" element={<HistoryPage />} />

        {/* Scheduling */}
        <Route path="roster" element={<RosterPage />} />
        <Route path="driver" element={
          <RoleRoute roles={['driver']}><MyDutyPage /></RoleRoute>
        } />

        {/* Incidents */}
        <Route path="incidents"        element={<IncidentListPage />} />
        <Route path="incidents/raise"  element={<RaiseIncidentPage />} />
        <Route path="incidents/:id"    element={<IncidentDetailPage />} />

        {/* Notices */}
        <Route path="notices"             element={<NoticeListPage />} />
        <Route path="notices/create"      element={
          <RoleRoute roles={['admin']}><CreateNoticePage /></RoleRoute>
        } />
        <Route path="notices/:id/receipts" element={
          <RoleRoute roles={['admin']}><NoticeReceiptsPage /></RoleRoute>
        } />

        {/* Vehicles — admin only */}
        <Route path="vehicles" element={
          <RoleRoute roles={['admin']}><VehiclesPage /></RoleRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
