import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';

export default function RiskDisplay({ complaintId }) {
  const [riskData, setRiskData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient.getRisk(complaintId)
      .then(setRiskData)
      .catch(() => setError(true));
  }, [complaintId]);

  if (error) return <div style={{ color: 'red' }}>Failed to load risk data</div>;
  if (!riskData) return <div>Loading risk assessment...</div>;

  const getRiskColor = (level) => {
    switch(level) {
      case 'CRITICAL': return '#dc2626'; // Red
      case 'HIGH': return '#ea580c'; // Orange
      case 'MEDIUM': return '#ca8a04'; // Yellow
      case 'LOW': return '#16a34a'; // Green
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ border: `2px solid ${getRiskColor(riskData.level)}`, padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 12px 0', color: getRiskColor(riskData.level) }}>
        Follow-Through Risk: {riskData.level}
      </h3>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
        Score: {riskData.score} / 100
      </div>
      <div>
        <strong>Attention Reasons:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          {riskData.reasons.map((reason, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>{reason}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}