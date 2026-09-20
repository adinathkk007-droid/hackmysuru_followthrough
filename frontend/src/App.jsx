import { useEffect, useState } from 'react';
import StaffDashboard from './components/StaffDashboard';
import CitizenPortal from './components/CitizenPortal';
import { getStoredUser, signIn, signOut } from './api/config';

const DEMO = {
  CITIZEN: { email: 'citizen.demo@civicmysuru.local', password: 'CivicDemo123!' },
  AUTHORITY: { email: 'authority.demo@civicmysuru.local', password: 'CivicDemo123!' }
};

function Login({ role, onLogin }) {
  const demo = DEMO[role];
  const [email, setEmail] = useState(demo.email);
  const [password, setPassword] = useState(demo.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await signIn(email.trim(), password);
      onLogin(user, role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 10px 30px rgba(15,23,42,.10)', border: '1px solid #e2e8f0' }}>
        <button type="button" onClick={() => onLogin(null, null)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b', marginBottom: 16 }}>← Back</button>
        <h1 style={{ margin: 0, color: '#0f172a' }}>{role === 'CITIZEN' ? 'Citizen Portal' : 'Authority Portal'}</h1>
        <p style={{ color: '#64748b', marginTop: 8 }}>Use the demo account to explore the working MVP.</p>
        {error && <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
        <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={inputStyle} />
        <label style={{ display: 'block', fontWeight: 700, margin: '16px 0 6px' }}>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={inputStyle} />
        <button disabled={loading} type="submit" style={{ width: '100%', marginTop: 20, padding: 13, border: 0, borderRadius: 8, background: role === 'CITIZEN' ? '#16a34a' : '#2563eb', color: '#fff', fontWeight: 800, cursor: loading ? 'wait' : 'pointer' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <button type="button" onClick={() => { setEmail(demo.email); setPassword(demo.password); }} style={{ width: '100%', marginTop: 10, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8, background: '#f8fafc', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>
          Use demo {role.toLowerCase()} account
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: 11, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 15 };

function Landing({ onRole }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 760, textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, margin: '0 0 12px', color: '#0f172a', fontWeight: 900 }}>Clean Mysuru</h1>
        <p style={{ color: '#475569', fontSize: 18, marginBottom: 42 }}>Follow-through & Civic Governance System</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <RoleCard title="Citizen Portal" icon="🧑‍🤝‍🧑" color="#16a34a" text="Report civic issues and track resolution progress." onClick={() => onRole('CITIZEN')} />
          <RoleCard title="Staff Authority" icon="🏢" color="#2563eb" text="Manage complaints, status transitions and risk." onClick={() => onRole('AUTHORITY')} />
        </div>
        <p style={{ marginTop: 28, color: '#64748b', fontSize: 13 }}>Demo accounts are built into this MVP for the hackathon demo.</p>
      </div>
    </div>
  );
}

function RoleCard({ title, icon, color, text, onClick }) {
  return <button onClick={onClick} style={{ width: 280, padding: '36px 28px', borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', borderTop: `4px solid ${color}`, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,.06)' }}>
    <div style={{ fontSize: 48 }}>{icon}</div>
    <h2 style={{ color: '#1e293b', margin: '16px 0 10px' }}>{title}</h2>
    <p style={{ color: '#64748b', lineHeight: 1.5, margin: 0 }}>{text}</p>
  </button>;
}

function App() {
  const [role, setRole] = useState(null);
  const [loginRole, setLoginRole] = useState(null);
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    if (!user) return;
    // Role is a UI mode. The backend still validates the Supabase token for protected actions.
  }, [user]);

  if (!user && loginRole) {
    return <Login role={loginRole} onLogin={(nextUser, nextRole) => { setUser(nextUser); setRole(nextRole); setLoginRole(null); }} />;
  }

  if (!user) return <Landing onRole={setLoginRole} />;

  if (!role) return <Landing onRole={(selectedRole) => setRole(selectedRole)} />;

  function logout() {
    signOut();
    setUser(null);
    setRole(null);
    setLoginRole(null);
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: 20, marginBottom: 32, gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, color: '#0f172a', fontWeight: 900 }}>Clean Mysuru</h1>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{role === 'CITIZEN' ? 'Citizen Portal' : 'Operational Dashboard'} · {user.email}</div>
        </div>
        <button onClick={logout} style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 700 }}>Sign Out</button>
      </div>
      {role === 'CITIZEN' ? <CitizenPortal userId={user.id} /> : <StaffDashboard />}
    </div>
  );
}

export default App;
