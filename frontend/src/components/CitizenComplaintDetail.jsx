import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';

export default function CitizenComplaintDetail({ complaintId, onBack }) {
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    Promise.all([
      apiClient.getComplaint(complaintId),
      apiClient.getHistory(complaintId)
    ]).then(([compData, histData]) => {
      setComplaint(compData);
      setHistory(histData);
    });
  }, [complaintId]);

  if (!complaint) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading complaint details...</div>;

  const getStatusStyles = (status) => {
    const styles = {
      SUBMITTED: { bg: '#dbeafe', text: '#1e40af' },
      ASSIGNED: { bg: '#f3e8ff', text: '#6b21a8' },
      ACKNOWLEDGED: { bg: '#fef3c7', text: '#92400e' },
      IN_PROGRESS: { bg: '#ffedd5', text: '#c2410c' },
      RESOLVED: { bg: '#dcfce7', text: '#166534' },
      REJECTED: { bg: '#fee2e2', text: '#991b1b' }
    };
    return styles[status] || { bg: '#f3f4f6', text: '#374151' };
  };

  const statusStyle = getStatusStyles(complaint.status);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <button onClick={onBack} style={{ marginBottom: '24px', background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontWeight: 'bold' }}>
        ← Back to My Complaints
      </button>
      
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '0.5px' }}>
              {complaint.id} • {complaint.issueType.replace('_', ' ')}
            </div>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', color: '#111827' }}>{complaint.title}</h2>
          </div>
          <span style={{ background: statusStyle.bg, color: statusStyle.text, padding: '6px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: '900', letterSpacing: '0.5px' }}>
            {complaint.status}
          </span>
        </div>
        
        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #f3f4f6', marginTop: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Description</strong>
            <span style={{ color: '#111827', fontSize: '16px', lineHeight: '1.5' }}>{complaint.description}</span>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Location</strong>
            <span style={{ color: '#111827', fontSize: '16px' }}>{complaint.location}</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#111827' }}>Progress Tracking</h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>Timeline of actions taken by authorities.</p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {history.slice().reverse().map((log, index) => (
            <li key={log.id} style={{ position: 'relative', paddingLeft: '28px', paddingBottom: index === history.length - 1 ? '0' : '24px', borderLeft: index === history.length - 1 ? '2px solid transparent' : '2px solid #e5e7eb' }}>
              <div style={{ position: 'absolute', left: '-7px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: index === 0 ? '#2563eb' : '#d1d5db', border: '2px solid #fff' }}></div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                {new Date(log.createdAt).toLocaleString()}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '900', color: '#111827' }}>
                {log.newStatus}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}