import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';
import CitizenComplaintForm from './CitizenComplaintForm';
import CitizenComplaintDetail from './CitizenComplaintDetail';

export default function CitizenPortal({ userId }) {
  const [complaints, setComplaints] = useState([]);
  const [view, setView] = useState('LIST');
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try { setError(''); setComplaints(await apiClient.getComplaints({ citizenId: userId })); }
    catch (err) { setError(err.message); }
  }

  useEffect(() => { if (view === 'LIST') load(); }, [view, userId]);

  if (view === 'FORM') return <div><button onClick={() => setView('LIST')} style={backStyle}>← Back</button><CitizenComplaintForm onSuccess={() => setView('LIST')} /></div>;
  if (view === 'DETAIL') return <CitizenComplaintDetail complaintId={selectedId} onBack={() => setView('LIST')} />;

  return <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
      <div><h2 style={{ margin: 0, fontSize: 28, color: '#111827' }}>My Reported Issues</h2><p style={{ color: '#64748b', margin: '6px 0 0' }}>Track complaints and follow-through status in the MVP.</p></div>
      <button onClick={() => setView('FORM')} style={buttonGreen}>+ File New Complaint</button>
    </div>
    {error && <div style={errorStyle}>{error}</div>}
    {complaints.length === 0 && !error ? <div style={emptyStyle}>No complaints found for this account.</div> : <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {complaints.map(c => <button key={c.id} onClick={() => { setSelectedId(c.id); setView('DETAIL'); }} style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, textAlign: 'left' }}><div><div style={meta}>{c.id} · {new Date(c.createdAt).toLocaleDateString()}</div><div style={title}>{c.title}</div><div style={meta}>{c.issueType.replaceAll('_', ' ')}</div></div><span style={badge}>{c.status}</span></div>
        <div style={{ display: 'flex', gap: 5, marginTop: 18 }}>{[1,2,3,4,5].map(step => <div key={step} style={{ flex: 1, height: 7, borderRadius: 4, background: getStep(c.status) >= step ? '#2563eb' : '#e5e7eb' }} />)}</div>
      </button>)}
    </div>}
  </div>;
}

function getStep(status) { return ({ SUBMITTED: 1, ASSIGNED: 2, ACKNOWLEDGED: 3, IN_PROGRESS: 4, RESOLVED: 5, REJECTED: 5 })[status] || 1; }
const backStyle = { marginBottom: 20, background: 'transparent', border: 0, color: '#475569', cursor: 'pointer', fontWeight: 800 };
const buttonGreen = { background: '#16a34a', color: '#fff', padding: '10px 20px', border: 0, borderRadius: 8, cursor: 'pointer', fontWeight: 800 };
const cardStyle = { width: '100%', boxSizing: 'border-box', textAlign: 'left', background: '#fff', border: '1px solid #e5e7eb', padding: 22, borderRadius: 12, cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,0,0,.04)' };
const badge = { background: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 900, height: 'fit-content' };
const meta = { fontSize: 12, color: '#64748b', fontWeight: 700 };
const title = { fontSize: 18, fontWeight: 900, color: '#111827', margin: '6px 0' };
const emptyStyle = { textAlign: 'center', padding: 60, border: '2px dashed #cbd5e1', borderRadius: 12, color: '#64748b' };
const errorStyle = { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: 12, borderRadius: 8, marginBottom: 16 };
