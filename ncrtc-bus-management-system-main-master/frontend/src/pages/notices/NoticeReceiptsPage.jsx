import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function NoticeReceiptsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/notices/${id}/receipts`)
      .then(r => setData(r.data))
      .catch(() => navigate('/notices'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading"><span className="spin">⟳</span> Loading receipts…</div>;
  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Read Receipts</div>
          <div className="page-sub">"{data.notice?.title}"</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notices')}>← Back</button>
      </div>

      <div className="card mb-4 card-sm">
        <span className="text-muted">Total reads: </span>
        <strong style={{ color: 'var(--green)' }}>{data.readCount}</strong>
      </div>

      <div className="card">
        <div className="card-title mb-4">Read By</div>
        {data.readBy?.length === 0 && <div className="empty">No one has read this notice yet</div>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Depot</th>
                <th>Read At</th>
              </tr>
            </thead>
            <tbody>
              {data.readBy?.map((r, i) => (
                <tr key={i}>
                  <td>{r.user?.fullName}</td>
                  <td className="muted">{r.user?.role}</td>
                  <td className="muted">{r.user?.depot?.name || '—'}</td>
                  <td className="muted">{new Date(r.readAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
