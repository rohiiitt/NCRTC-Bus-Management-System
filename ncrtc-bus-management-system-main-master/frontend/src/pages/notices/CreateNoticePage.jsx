import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function CreateNoticePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', body: '', audience: 'all', publishAt: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const body = { ...form };
      if (!body.publishAt) delete body.publishAt;
      await api.post('/notices', body);
      navigate('/notices');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create notice');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Create Notice</div>
          <div className="page-sub">Send a notice to drivers and staff</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/notices')}>← Back</button>
      </div>

      <div className="card">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              id="notice-title"
              type="text"
              className="form-control"
              placeholder="Notice title"
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              id="notice-body"
              className="form-control"
              rows={6}
              placeholder="Write your message here…"
              value={form.body}
              onChange={e => setForm({...form, body: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Audience</label>
            <select
              id="notice-audience"
              className="form-control"
              value={form.audience}
              onChange={e => setForm({...form, audience: e.target.value})}
            >
              <option value="all">Everyone</option>
              <option value="role:driver">Drivers only</option>
              <option value="depot:1">Depot 1</option>
              <option value="depot:2">Depot 2</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Schedule Publish At (optional)</label>
            <input
              id="notice-publish-at"
              type="datetime-local"
              className="form-control"
              value={form.publishAt}
              onChange={e => setForm({...form, publishAt: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button id="notice-submit-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spin">⟳</span> Publishing…</> : '📢 Publish Notice'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/notices')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
