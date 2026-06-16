import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const startIcon = L.divIcon({
  className: '',
  html: `<div style="background:#22c55e;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">S</div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});
const endIcon = L.divIcon({
  className: '',
  html: `<div style="background:#ef4444;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">E</div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

export default function HistoryPage() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [pings, setPings] = useState([]);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/vehicles').then(r => setVehicles(r.data.vehicles || [])).catch(() => {});
  }, []);

  const fetchHistory = async () => {
    if (!vehicleId) return;
    setLoading(true); setError('');
    try {
      const res = await api.get(`/avls/history/${vehicleId}?date=${date}`);
      setPings(res.data.pings || []);
      setVehicleInfo(res.data.vehicle);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch history');
    } finally { setLoading(false); }
  };

  const path = pings.map(p => [p.lat, p.lng]);
  const center = path.length > 0 ? path[Math.floor(path.length / 2)] : [28.6139, 77.2090];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Route History</div>
          <div className="page-sub">View a vehicle's full-day GPS trace</div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Vehicle</label>
            <select id="history-vehicle" className="form-control" value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
              <option value="">-- Select vehicle --</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Date</label>
            <input id="history-date" type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button id="history-search-btn" className="btn btn-primary" onClick={fetchHistory} disabled={!vehicleId || loading}>
              {loading ? <><span className="spin">⟳</span> Loading…</> : '🔍 Search'}
            </button>
          </div>
        </div>
        {vehicleInfo && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text2)' }}>
            <strong style={{ color: 'var(--text)' }}>{vehicleInfo.regNo}</strong> · {vehicleInfo.depot?.name} · {pings.length} pings recorded
          </div>
        )}
        {error && <div className="alert alert-error mt-4">{error}</div>}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', height: 480 }}>
        <MapContainer center={center} zoom={12} style={{ width: '100%', height: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {path.length > 1 && (
            <>
              <Polyline positions={path} color="#3b82f6" weight={3} />
              <Marker position={path[0]} icon={startIcon} />
              <Marker position={path[path.length - 1]} icon={endIcon} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
