import { useState, useEffect } from 'react';
import { apiClient, STATUS } from '../api/config';
import RiskDisplay from './RiskDisplay';

export default function StaffComplaintDetail({ complaintId, onBack }) {
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    Promise.all([apiClient.getComplaint(complaintId), apiClient.getHistory(complaintId)])
      .then(([comp, hist]) => { setComplaint(comp); setHistory(hist); });
  }, [complaintId]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    const updated = await apiClient.updateStatus(complaintId, newStatus);
    const newHist = await apiClient.getHistory(complaintId);
    setComplaint({ ...updated });
    setHistory(newHist);
    setUpdating(false);
  };

  if (!complaint) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading operational details...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <button onClick={onBack} style={{ marginBottom: '24px', background: '#f3f4f6', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', color: '#374151', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = '#e5e7eb'} onMouseOut={e => e.target.style.background = '#f3f4f6'}>
        ← Back to Operational Dashboard
      </button>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'inline-block', background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '900', marginBottom: '16px', letterSpacing: '0.5px' }}>{complaint.priority} PRIORITY</div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#111827' }}>{complaint.id} - {complaint.issueType.replace('_', ' ')}</h2>
            <h3 style={{ margin: '0 0 24px 0', color: '#4b5563', fontSize: '18px', fontWeight: '500' }}>"{complaint.title}"</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #f3f4f6', marginBottom: '32px' }}>
              <div><strong style={{ color: '#6b7280', display: 'block', fontSize: '13px', textTransform: 'uppercase', marginBottom: '4px' }}>Description</strong> <span style={{ color: '#111827', fontSize: '16px', lineHeight: '1.5' }}>{complaint.description}</span></div>
              <div><strong style={{ color: '#6b7280', display: 'block', fontSize: '13px', textTransform: 'uppercase', marginBottom: '4px' }}>Location</strong> <span style={{ color: '#111827', fontSize: '16px' }}>{complaint.location}</span></div>
              <div><strong style={{ color: '#6b7280', display: 'block', fontSize: '13px', textTransform: 'uppercase', marginBottom: '4px' }}>Assigned Authority</strong> <span style={{ color: '#111827', fontSize: '16px' }}>{complaint.assignedAuthority || 'Unassigned'}</span></div>
            </div>
            
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Operational Action: Update Status</h3>
              <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>Current Status: <strong style={{ color: '#111827', background: '#e5e7eb', padding: '4px 8px', borderRadius: '4px' }}>{complaint.status}</strong></p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {Object.values(STATUS).map(s => (
                  <button 
                    key={s} 
                    onClick={() => handleStatusChange(s)}
                    disabled={complaint.status === s || updating}
                    style={{ padding: '12px 20px', background: complaint.status === s ? '#f3f4f6' : '#2563eb', color: complaint.status === s ? '#9ca3af' : 'white', border: complaint.status === s ? '1px solid #d1d5db' : 'none', borderRadius: '8px', cursor: complaint.status === s ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: 'all 0.2s', boxShadow: complaint.status === s ? 'none' : '0 2px 4px rgba(37,99,235,0.2)' }}
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 30%', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <RiskDisplay complaintId={complaintId} />
          
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Audit Timeline</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {history.slice().reverse().map((log, index) => (
                <li key={log.id} style={{ position: 'relative', paddingLeft: '28px', paddingBottom: index === history.length - 1 ? '0' : '24px', borderLeft: index === history.length - 1 ? '2px solid transparent' : '2px solid #e5e7eb' }}>
                  <div style={{ position: 'absolute', left: '-7px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: index === 0 ? '#2563eb' : '#d1d5db', border: '2px solid #fff' }}></div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>{new Date(log.createdAt).toLocaleString()}</div>
                  <div style={{ fontSize: '15px', fontWeight: '900', color: '#111827', marginBottom: '2px' }}>{log.newStatus}</div>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>Action by: {log.changedBy}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}