import { useState } from 'react';
import { apiClient } from '../api/config';

const DEFAULT_LOCATION = { lat: 12.2958, lng: 76.6394, text: 'Mysuru, Karnataka' };

export default function CitizenComplaintForm({ onSuccess }) {
  const [formData, setFormData] = useState({ issueType: 'GARBAGE', title: '', description: '', locationText: '', priority: 'MEDIUM' });
  const [coords, setCoords] = useState(DEFAULT_LOCATION);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'Location is not supported by this browser. You can enter the location manually.' });
      return;
    }
    setStatus({ type: 'loading', message: 'Getting your location…' });
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude, text: formData.locationText || 'Current location' });
        setStatus({ type: 'idle', message: '' });
      },
      () => setStatus({ type: 'error', message: 'Could not access your location. The default Mysuru coordinates will be used.' }),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Filing complaint with authorities…' });
    try {
      const locationText = formData.locationText.trim();
      if (locationText.length < 2) throw new Error('Please enter a location or landmark.');
      await apiClient.createComplaint({
        issueType: formData.issueType,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: { lat: coords.lat, lng: coords.lng, text: locationText },
        priority: formData.priority
      });
      setStatus({ type: 'success', message: 'Complaint registered successfully.' });
      setTimeout(onSuccess, 900);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Submission failed. Please check the backend connection and login.' });
    }
  }

  return (
    <div style={{ maxWidth: 650, margin: '0 auto', background: '#fff', border: '1px solid #e5e7eb', padding: 32, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,.08)' }}>
      <h2 style={{ margin: '0 0 8px', textAlign: 'center' }}>Report a Civic Issue</h2>
      <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: 24 }}>Submit a complaint and track it through the follow-through lifecycle.</p>
      {status.message && <div style={{ background: status.type === 'error' ? '#fef2f2' : status.type === 'success' ? '#f0fdf4' : '#eff6ff', color: status.type === 'error' ? '#b91c1c' : status.type === 'success' ? '#15803d' : '#1d4ed8', padding: 12, borderRadius: 8, marginBottom: 16 }}>{status.message}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label>Issue type<select name="issueType" value={formData.issueType} onChange={e => setFormData(p => ({ ...p, issueType: e.target.value }))} style={inputStyle}><option value="GARBAGE">Garbage / Waste</option><option value="POTHOLE">Pothole / Road Damage</option><option value="STREETLIGHT">Broken Streetlight</option><option value="ILLEGAL_DUMPING">Illegal Dumping</option><option value="DRAINAGE">Drainage</option><option value="WATER">Water Leakage</option></select></label>
        <label>Title<input required minLength={3} maxLength={180} value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="Brief issue title" style={inputStyle} /></label>
        <label>Description<textarea required minLength={10} maxLength={5000} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the issue" style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }} /></label>
        <label>Location / landmark<input required minLength={2} maxLength={300} value={formData.locationText} onChange={e => { setFormData(p => ({ ...p, locationText: e.target.value })); setCoords(p => ({ ...p, text: e.target.value || p.text })); }} placeholder="e.g. Vijayanagar, Mysuru" style={inputStyle} /></label>
        <button type="button" onClick={useMyLocation} style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700 }}>Use my current GPS location</button>
        <div style={{ fontSize: 12, color: '#64748b' }}>Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</div>
        <label>Priority<select value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value }))} style={inputStyle}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
        <button type="submit" disabled={status.type === 'loading'} style={{ background: '#2563eb', color: '#fff', padding: 14, border: 0, borderRadius: 8, cursor: status.type === 'loading' ? 'wait' : 'pointer', fontWeight: 800 }}>{status.type === 'loading' ? 'Processing…' : 'Submit Complaint'}</button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: 11, marginTop: 6, borderRadius: 7, border: '1px solid #d1d5db', background: '#fff', fontSize: 15 };
