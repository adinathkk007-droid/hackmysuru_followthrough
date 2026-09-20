import { useEffect, useState } from 'react';
import { apiClient } from '../api/config';

export default function CitizenComplaintDetail({ complaintId, onBack }) {
  const [complaint, setComplaint] = useState(null); const [history, setHistory] = useState([]); const [error, setError] = useState('');
  useEffect(() => { Promise.all([apiClient.getComplaint(complaintId), apiClient.getHistory(complaintId)]).then(([c,h]) => { setComplaint(c); setHistory(h); }).catch(e => setError(e.message)); }, [complaintId]);
  if (error) return <div><button onClick={onBack} style={back}>← Back</button><div style={err}>{error}</div></div>;
  if (!complaint) return <div style={{ padding: 40, textAlign: 'center' }}>Loading complaint details…</div>;
  return <div><button onClick={onBack} style={back}>← Back to My Complaints</button><div style={panel}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><div><div style={meta}>{complaint.id} · {complaint.issueType}</div><h2>{complaint.title}</h2></div><span style={badge}>{complaint.status}</span></div><Info label="Description" value={complaint.description} /><Info label="Location" value={complaint.location?.text} /><Info label="Priority" value={complaint.priority} /></div><div style={{ ...panel, marginTop: 20 }}><h3>Progress Tracking</h3>{history.length === 0 ? <p>No history yet.</p> : history.map(log => <div key={log.id} style={{ borderLeft: '2px solid #e5e7eb', padding: '0 0 18px 14px', marginBottom: 8 }}><div style={{ fontSize: 12, color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</div><strong>{log.newStatus}</strong><div style={{ fontSize: 13, color: '#64748b' }}>{log.remarks || ''}</div></div>)}</div></div>;
}
function Info({label,value}) { return <div style={{ marginTop: 18 }}><strong style={{ display: 'block', color: '#64748b', fontSize: 12, textTransform: 'uppercase', marginBottom: 4 }}>{label}</strong><span>{value || '—'}</span></div>; }
const panel = { background: '#fff', border: '1px solid #e5e7eb', padding: 28, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,.04)' };
const back = { marginBottom: 20, background: 'transparent', border: 0, color: '#475569', cursor: 'pointer', fontWeight: 800 };
const meta = { fontSize: 12, color: '#64748b', fontWeight: 800 };
const badge = { background: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 900, height: 'fit-content' };
const err = { background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 8 };
