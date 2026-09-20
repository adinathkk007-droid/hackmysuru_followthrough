import { useState, useEffect } from 'react';
import { apiClient, RISK_LEVEL } from '../api/config';
import StaffComplaintDetail from './StaffComplaintDetail';

export default function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    apiClient.getComplaints().then(setComplaints);
  }, []);

  if (selectedId) {
    return <StaffComplaintDetail complaintId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const highRisk = complaints.filter(c => c.riskLevel === RISK_LEVEL.HIGH || c.riskLevel === RISK_LEVEL.CRITICAL);
  const standard = complaints.filter(c => c.riskLevel !== RISK_LEVEL.HIGH && c.riskLevel !== RISK_LEVEL.CRITICAL);
  const resolved = complaints.filter(c => c.status === 'RESOLVED');

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '24px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Complaints</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#111827', marginTop: '8px' }}>{complaints.length - resolved.length}</div>
        </div>
        <div style={{ padding: '24px', background: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)', border: '1px solid #fca5a5', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1)' }}>
          <div style={{ color: '#b91c1c', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>High-Risk / Stagnant</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#991b1b', marginTop: '8px' }}>{highRisk.length}</div>
        </div>
        <div style={{ padding: '24px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved (Total)</div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#16a34a', marginTop: '8px' }}>{resolved.length}</div>
        </div>
      </div>

      {highRisk.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#dc2626', borderBottom: '2px solid #fecaca', paddingBottom: '12px', fontSize: '20px' }}>⚠️ Require Immediate Attention</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            {highRisk.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedId(c.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f87171', padding: '20px', borderRadius: '12px', background: '#fef2f2', cursor: 'pointer', userSelect: 'none', boxShadow: '0 2px 4px rgba(220,38,38,0.05)', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(220,38,38,0.15)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(220,38,38,0.05)'; }}
              >
                <div>
                  <div style={{ fontWeight: '900', color: '#991b1b', fontSize: '18px' }}>{c.id} - {c.issueType.replace('_', ' ')}</div>
                  <div style={{ fontSize: '14px', color: '#b91c1c', marginTop: '6px', fontWeight: '600' }}>Risk Score: {c.riskScore}/100 | Stagnant at: {c.status}</div>
                </div>
                <button style={{ background: '#dc2626', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', pointerEvents: 'none' }}>Review & Act</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 style={{ color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px', fontSize: '20px' }}>Standard Operations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {standard.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedId(c.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '12px', background: '#fff', cursor: 'pointer', userSelect: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.08)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
            >
              <div>
                <div style={{ fontWeight: '800', color: '#111827', fontSize: '18px' }}>{c.id} - {c.issueType.replace('_', ' ')}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px', fontWeight: '500' }}>Current Status: <span style={{ color: '#374151', fontWeight: 'bold' }}>{c.status}</span></div>
              </div>
              <button style={{ background: '#f3f4f6', color: '#374151', padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', pointerEvents: 'none' }}>View Details</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}