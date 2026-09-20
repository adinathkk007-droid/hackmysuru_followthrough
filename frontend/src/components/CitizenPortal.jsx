import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';
import CitizenComplaintForm from './CitizenComplaintForm';
import CitizenComplaintDetail from './CitizenComplaintDetail';

export default function CitizenPortal() {
  const [complaints, setComplaints] = useState([]);
  const [view, setView] = useState('LIST');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (view === 'LIST') apiClient.getComplaints().then(setComplaints);
  }, [view]);

  if (view === 'FORM') return (
    <div>
      <button onClick={() => setView('LIST')} style={{ marginBottom: '20px', background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', fontWeight: 'bold' }}>← Cancel Submission</button>
      <CitizenComplaintForm onSuccess={() => setView('LIST')} />
    </div>
  );

  if (view === 'DETAIL') return <CitizenComplaintDetail complaintId={selectedId} onBack={() => setView('LIST')} />;

  const getStepNumber = (status) => {
    const steps = { 'SUBMITTED': 1, 'ASSIGNED': 2, 'ACKNOWLEDGED': 3, 'IN_PROGRESS': 4, 'RESOLVED': 5, 'REJECTED': 5 };
    return steps[status] || 1;
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      SUBMITTED: { bg: '#dbeafe', text: '#1e40af' },
      ASSIGNED: { bg: '#f3e8ff', text: '#6b21a8' },
      ACKNOWLEDGED: { bg: '#fef3c7', text: '#92400e' },
      IN_PROGRESS: { bg: '#ffedd5', text: '#c2410c' },
      RESOLVED: { bg: '#dcfce7', text: '#166534' },
      REJECTED: { bg: '#fee2e2', text: '#991b1b' }
    };
    const style = styles[status] || { bg: '#f3f4f6', text: '#374151' };
    return (
      <span style={{ background: style.bg, color: style.text, padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#111827' }}>My Reported Issues</h2>
        <button onClick={() => setView('FORM')} style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)', transition: 'background 0.2s' }} onMouseOver={e => e.target.style.background = '#15803d'} onMouseOut={e => e.target.style.background = '#16a34a'}>
          + File New Complaint
        </button>
      </div>
      
      {complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed #d1d5db', borderRadius: '12px', color: '#6b7280', background: '#f9fafb' }}>
          No civic issues reported yet. Help keep Mysuru clean!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {complaints.map(c => (
            <div 
              key={c.id} 
              onClick={() => { setSelectedId(c.id); setView('DETAIL'); }}
              style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '12px', cursor: 'pointer', userSelect: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', transition: 'all 0.2s ease-in-out' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#d1d5db'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '0.5px' }}>{c.id} • {new Date(c.createdAt).toLocaleDateString()}</div>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: '#111827', marginBottom: '4px' }}>{c.issueType.replace('_', ' ')}</div>
                  <div style={{ fontSize: '15px', color: '#4b5563' }}>{c.title}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map(step => (
                  <div key={step} style={{ height: '8px', flex: 1, borderRadius: '4px', transition: 'background 0.3s', background: getStepNumber(c.status) >= step ? (c.status === 'RESOLVED' ? '#16a34a' : '#2563eb') : '#f3f4f6' }}></div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginTop: '8px', fontWeight: '600' }}>
                <span style={{ color: getStepNumber(c.status) >= 1 ? '#374151' : '#9ca3af' }}>Submitted</span>
                <span style={{ color: getStepNumber(c.status) >= 2 ? '#374151' : '#9ca3af' }}>Assigned</span>
                <span style={{ color: getStepNumber(c.status) >= 3 ? '#374151' : '#9ca3af' }}>Acknowledged</span>
                <span style={{ color: getStepNumber(c.status) >= 4 ? '#374151' : '#9ca3af' }}>In Progress</span>
                <span style={{ color: getStepNumber(c.status) >= 5 ? '#374151' : '#9ca3af' }}>Resolved</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}