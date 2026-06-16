import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../../api';
import { MOCK_LIVE_VEHICLES } from '../../mockData';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const busIcon = (speed) => L.divIcon({
  className: '',
  html: `<div style="background:${speed > 0 ? '#3b82f6' : '#64748b'};color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,.5);border:2px solid #fff;">🚌</div>`,
  iconSize: [30, 30], iconAnchor: [15, 15],
});

// Jitter coordinates slightly to simulate movement in demo mode
const jitter = (val) => val + (Math.random() - 0.5) * 0.002;

export default function LiveMapPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [recentPath, setRecentPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const intervalRef = useRef(null);
  const mockVehiclesRef = useRef(MOCK_LIVE_VEHICLES.map(v => ({ ...v })));

  const fetchLive = useCallback(async () => {
    try {
      const res = await api.get('/avls/live');
      setVehicles(res.data.vehicles || []);
      setIsDemo(false);
    } catch {
      // Demo mode: jitter positions to simulate movement
      mockVehiclesRef.current = mockVehiclesRef.current.map(v => ({
        ...v, lat: jitter(v.lat), lng: jitter(v.lng),
        speed: Math.max(0, Math.min(80, v.speed + (Math.random() - 0.5) * 10)),
        lastSeen: new Date().toISOString(),
      }));
      setVehicles([...mockVehiclesRef.current]);
      setIsDemo(true);
    }
    setLoading(false);
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchLive]);

  const selectVehicle = async (v) => {
    setSelected(v);
    try {
      const res = await api.get(`/avls/vehicle/${v.vehicleId}/recent`);
      setRecentPath((res.data.pings || []).map(p => [p.lat, p.lng]));
    } catch {
      // Demo: generate a fake path around the vehicle
      const path = Array.from({ length: 8 }, (_, i) => [v.lat + i * 0.003, v.lng + i * 0.002]);
      setRecentPath(path);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', margin: '-24px' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ width: '100%', height: '100%' }}>
          <TileLayer attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {vehicles.map(v => (
            <Marker key={v.vehicleId} position={[v.lat, v.lng]} icon={busIcon(v.speed || 0)} eventHandlers={{ click: () => selectVehicle(v) }}>
              <Popup>
                <strong>{v.regNo}</strong><br />
                {v.driver || 'No driver'}<br />
{v.route || ''}<br />
                <span style={{ color: '#3b82f6' }}>{Math.round(v.speed || 0)} km/h</span>
              </Popup>
            </Marker>
          ))}
          {recentPath.length > 1 && <Polyline positions={recentPath} color="#3b82f6" weight={3} opacity={0.75} />}
        </MapContainer>

        {/* Status bar */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 999, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: 'var(--text2)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          {loading ? 'Loading…' : `${vehicles.length} buses active · ${lastUpdate?.toLocaleTimeString()}`}
          {isDemo && <span style={{ background: 'rgba(245,158,11,.2)', color: '#fbbf24', padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>DEMO</span>}
        </div>
      </div>

      {/* Side panel */}
      <div style={{ width: 300, background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Live Vehicles</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{vehicles.length} online · refreshes every 5s</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {vehicles.map(v => (
            <div
              key={v.vehicleId}
              onClick={() => selectVehicle(v)}
              style={{
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${selected?.vehicleId === v.vehicleId ? 'var(--accent)' : 'var(--border)'}`,
                background: selected?.vehicleId === v.vehicleId ? 'rgba(59,130,246,.1)' : 'transparent',
                marginBottom: 8, transition: 'all .15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{v.regNo}</span>
                <span style={{ color: v.speed > 0 ? 'var(--accent)' : 'var(--text3)', fontWeight: 600, fontSize: 12 }}>{Math.round(v.speed || 0)} km/h</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{v.driver} · {v.routeCode}</div>
            </div>
          ))}
        </div>
        {selected && (
          <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{selected.regNo} — Path</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{recentPath.length} pings shown</div>
            <button className="btn btn-ghost btn-sm mt-4" onClick={() => { setSelected(null); setRecentPath([]); }}>Clear</button>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}
