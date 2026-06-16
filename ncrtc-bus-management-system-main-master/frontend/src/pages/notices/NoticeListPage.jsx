import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { MOCK_NOTICES } from '../../mockData';

export default function NoticeListPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/notices')
      .then(r => setNotices(r.data.notices || []))
      .catch(() => setNotices(MOCK_NOTICES))
      .finally(() => setLoading(false));
  }, []);

  const toggleNotice = async (notice) => {
    if (expanded === notice.id) { setExpanded(null); return; }
    setExpanded(notice.id);
    if (!notice.isRead) {
      try { await api.post(`/notices/${notice.id}/read`); } catch {}
      setNotices(prev => prev.map(n => n.id === notice.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
    }
  };

  const unreadCount = notices.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            Notices
            {unreadCount > 0 && <span className="badge badge-red" style={{ marginLeft:10, fontSize:11 }}>{unreadCount} unread</span>}
          </div>
          <div className="page-sub">Official communications from management</div>
        </div>
        {isAdmin && (
          <button id="create-notice-btn" className="btn btn-primary" onClick={() => navigate('/notices/create')}>+ Create Notice</button>
        )}
      </div>

      {loading && <div className="loading"><span className="spin">⟳</span> Loading notices…</div>}
      {!loading && notices.length === 0 && <div className="empty">No notices yet</div>}

      {notices.map(notice => (
        <div key={notice.id} className={`notice-item${!notice.isRead ? ' unread' : ''}`} onClick={() => toggleNotice(notice)}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div className="notice-title">{notice.title}</div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0, marginLeft:12 }}>
              {!notice.isRead ? <span className="badge badge-blue">New</span> : <span className="badge badge-draft">Read</span>}
              <span style={{fontSize:12}}>{expanded===notice.id ? '▲' : '▼'}</span>
            </div>
          </div>
          <div className="notice-meta">
            <span>To: {notice.audience} · </span>
            {notice.publishAt ? new Date(notice.publishAt).toLocaleString() : ''}
            {notice.readAt && <span style={{color:'var(--green)'}}> · Read {new Date(notice.readAt).toLocaleTimeString()}</span>}
          </div>
          {expanded === notice.id && <div className="notice-body">{notice.body}</div>}
          {expanded === notice.id && isAdmin && (
            <div style={{marginTop:10}} onClick={e => e.stopPropagation()}>
              <button id={`receipts-btn-${notice.id}`} className="btn btn-ghost btn-sm" onClick={() => navigate(`/notices/${notice.id}/receipts`)}>
                View Receipts
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
