import { useEffect, useState } from 'react';
import { apiClient, RISK_LEVEL } from '../api/config';
import StaffComplaintDetail from './StaffcomplaintDetail';

export default function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const [items, dashboard] = await Promise.all([apiClient.getComplaints(), apiClient.getDashboardSummary()]);
      setComplaints(items); setSummary(dashboard);
    } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  if (selectedId) return <StaffComplaintDetail complaintId={selectedId} onBack={() => { setSelectedId(null); load(); }} />;

  const highRisk = complaints.filter(c => c.riskLevel === RISK_LEVEL.HIGH || c.riskLevel === RISK_LEVEL.CRITICAL);
  const resolved = complaints.filter(c => c.status === 'RESOLVED');
  const active = summary ? summary.total - (summary.byStatus?.RESOLVED || 0) : complaints.length - resolved.length;

  return <div>
    {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 20 }}>{error}</div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 18, marginBottom: 36 }}>
      <Stat label="Active Complaints" value={active} />
      <Stat label="High-Risk" value={summary?.highRisk ?? highRisk.length} danger />
      <Stat label="Resolved" value={summary?.byStatus?.RESOLVED ?? resolved.length} good />
      <Stat label="Total" value={summary?.total ?? complaints.length} />
    </div>
    {highRisk.length > 0 && <Section title="⚠️ Require Immediate Attention" danger items={highRisk} onSelect={setSelectedId} />}
    <Section title="Standard Operations" items={complaints.filter(c => !highRisk.includes(c))} onSelect={setSelectedId} />
  </div>;
}

function Stat({ label, value, danger, good }) { return <div style={{ padding: 22, background: '#fff', border: `1px solid ${danger ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 12 }}><div style={{ color: danger ? '#b91c1c' : '#64748b', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{label}</div><div style={{ fontSize: 36, fontWeight: 900, color: danger ? '#991b1b' : good ? '#16a34a' : '#111827', marginTop: 6 }}>{value}</div></div>; }
function Section({ title, items, onSelect, danger }) { return <section style={{ marginBottom: 36 }}><h3 style={{ color: danger ? '#dc2626' : '#111827', borderBottom: `2px solid ${danger ? '#fecaca' : '#e5e7eb'}`, paddingBottom: 12 }}>{title}</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>{items.map(c => <button key={c.id} onClick={() => onSelect(c.id)} style={{ textAlign: 'left', padding: 18, borderRadius: 10, border: `1px solid ${danger ? '#fca5a5' : '#e5e7eb'}`, background: danger ? '#fef2f2' : '#fff', cursor: 'pointer' }}><div style={{ fontWeight: 900, color: '#111827' }}>{c.title}</div><div style={{ color: '#64748b', fontSize: 13, marginTop: 5 }}>{c.id} · {c.issueType} · {c.status} · Risk {c.riskScore ?? '—'}</div></button>)}</div></section>; }
