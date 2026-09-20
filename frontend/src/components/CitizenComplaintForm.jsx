import { useState } from 'react';
import { apiClient } from '../api/config';

export default function CitizenComplaintForm({ onSuccess }) {
  const [formData, setFormData] = useState({ issueType: 'WASTE_ACCUMULATION', title: '', description: '', location: '', priority: 'NORMAL' });
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Filing complaint with authorities...' });
    try {
      await apiClient.createComplaint(formData);
      setStatus({ type: 'success', message: 'Complaint registered successfully.' });
      setTimeout(() => onSuccess(), 1500); // Auto-redirect after success
    } catch (err) {
      setStatus({ type: 'error', message: 'Submission failed. Please check connection.' });
    }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 4. CENTERED FORM CARD
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', border: '1px solid #e5e7eb', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', textAlign: 'center' }}>Report a Civic Issue</h2>
      <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '24px', fontSize: '14px' }}>Provide details below. Your request will be routed to the appropriate Mysuru authority.</p>
      
      {status.type === 'error' && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #fecaca' }}>{status.message}</div>}
      {status.type === 'success' && <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>{status.message}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>1. Issue Classification</label>
          <select name="issueType" value={formData.issueType} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb' }}>
            <option value="WASTE_ACCUMULATION">Waste Accumulation / Garbage</option>
            <option value="POTHOLE">Road Damage / Pothole</option>
            <option value="STREETLIGHT">Broken Streetlight</option>
            <option value="ILLEGAL_DUMPING">Illegal Dumping (C&D Waste)</option>
          </select>
        </div>

        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>2. Issue Details</label>
          <input required name="title" value={formData.title} onChange={handleChange} placeholder="Brief title (e.g., Overflowing bin on KD Road)" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '12px', boxSizing: 'border-box' }} />
          <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Please provide specific details..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '100px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#374151' }}>3. Location & Priority</label>
          <input required name="location" value={formData.location} onChange={handleChange} placeholder="Exact street name or nearby landmark" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '12px', boxSizing: 'border-box' }} />
          <select name="priority" value={formData.priority} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb' }}>
            <option value="LOW">Low (Not causing immediate disruption)</option>
            <option value="NORMAL">Normal (Standard civic issue)</option>
            <option value="URGENT">Urgent (Health or safety hazard)</option>
          </select>
        </div>

        <button type="submit" disabled={status.type === 'loading'} style={{ background: '#2563eb', color: 'white', padding: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '8px', transition: 'background 0.2s' }}>
          {status.type === 'loading' ? 'Processing...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}