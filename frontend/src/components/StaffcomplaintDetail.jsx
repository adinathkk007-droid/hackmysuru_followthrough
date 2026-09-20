import { useEffect, useMemo, useState } from 'react';
import { apiClient, STATUS } from '../api/config';
import RiskDisplay from './RiskDisplay';

const NEXT = { SUBMITTED: ['ASSIGNED', 'REJECTED'], ASSIGNED: ['ACKNOWLEDGED', 'REJECTED'], ACKNOWLEDGED: ['IN_PROGRESS', 'REJECTED'], IN_PROGRESS: ['RESOLVED', 'REJECTED'], RESOLVED: [], REJECTED: [] };

export default function StaffComplaintDetail({ complaintId, onBack }) {
  const [complaint, setComplaint] = useState(null); const [history, setHistory] = useState([]); const [updating, setUpdating] = useState(false); const [error, setError] = useState('');
  async function load() { try { const [c,h] = await Promise.all([apiClient.getComplaint(complaintId), apiClient.getHistory(complaintId)]); setComplaint(c); setHistory(h); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, [complaintId]);
  async function handleStatusChange(status) { try { setUpdating(true); setError(''); await apiClient.updateStatus(complaintId, status); await load(); } catch (e) { setError(e.message); } finally { setUpdating(false); } }
  const nextStatuses = useMemo(() => NEXT[complaint?.status] || [], [complaint?.status]);
  if (!complaint) return <div style={{ padding: 40, textAlign: 'center' }}>{error || 'Loading operational details…'}</div>;
  return <div>
    <button onClick={onBack} style={back}>← Back to dashboard</button>
    {error && <div style={err}>{error}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(280px,1fr)', gap: 22 }}>
      <div style={panel}><div style={pill}>{complaint.priority} PRIORITY</div><h2>{complaint.title}</h2><p style={{ color: '#64748b' }}>{complaint.id} · {complaint.issueType}</p><Info label="Description" value={complaint.description} /><Info label="Location" value={complaint.location?.text} /><Info label="Assigned Authority" value={complaint.assignedAuthority || 'Unassigned'} /><div style={{ borderTop: '1px solid #e5e7eb', marginTop: 24, paddingTop: 22 }}><h3>Update Status</h3><p>Current: <strong>{complaint.status}</strong></p>{nextStatuses.length === 0 ? <p style={{ color: '#64748b' }}>No further status transition is available.</p> : <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{nextStatuses.map(s => <button key={s} disabled={updating} onClick={() => handleStatusChange(s)} style={action}>{updating ? 'Updating…' : `Mark ${s}`}</button>)}</div>}</div></div>
      <div><RiskDisplay complaintId={complaintId} /><div style={panel}><h3>Audit Timeline</h3>{history.slice().reverse().map(log => <div key={log.id} style={{ borderLeft: '2px solid #e5e7eb', padding: '0 0 18px 14px', marginBottom: 8 }}><div style={{ fontSize: 12, color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</div><strong>{log.newStatus}</strong><div style={{ fontSize: 13, color: '#64748b' }}>{log.remarks || ''}</div></div>)}</div></div>
    </div>
  </div>;
}
function Info({label,value}) { return <div style={{ marginTop: 16 }}><strong style={{ display: 'block', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>{label}</strong><span>{value || '—'}</span></div>; }
const panel = { background: '#fff', border: '1px solid #e5e7eb', padding: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,.04)' };
const back = { marginBottom: 20, background: 'transparent', border: 0, color: '#475569', cursor: 'pointer', fontWeight: 800 };
const pill = { display: 'inline-block', background: '#e0e7ff', color: '#4338ca', padding: '6px 10px', borderRadius: 6, fontSize: 12, fontWeight: 900 };
const action = { padding: '10px 14px', border: 0, borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' };
const err = { background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 16 };
