import { useState } from 'react';
import StaffDashboard from './components/StaffDashboard';
import CitizenPortal from './components/CitizenPortal';

function App() {
  const [role, setRole] = useState(null); // null means we are on the landing page

  // --- LANDING PAGE (MOCK LOGIN) ---
  if (!role) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: 'system-ui, sans-serif',
        userSelect: 'none' // Fixes the text cursor bug
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '48px', animation: 'fadeIn 0.5s ease-in-out' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 12px 0', color: '#0f172a', letterSpacing: '-1px', fontWeight: '900' }}>
            Clean Mysuru
          </h1>
          <p style={{ color: '#475569', fontSize: '18px', margin: 0, fontWeight: '500', letterSpacing: '0.5px' }}>
            Follow-Through & Civic Governance System
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 20px' }}>
          
          {/* Citizen Login Card */}
          <div 
            onClick={() => setRole('CITIZEN')}
            style={{ 
              background: '#ffffff',
              border: '1px solid #e2e8f0', 
              borderTop: '4px solid #16a34a', // Green accent
              padding: '40px 32px', 
              borderRadius: '16px', 
              cursor: 'pointer', 
              width: '260px', 
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
          >
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧑‍🤝‍🧑</div>
            <h2 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '24px' }}>Citizen Portal</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
              Report civic issues and track resolution progress directly.
            </p>
          </div>

          {/* Staff Login Card */}
          <div 
            onClick={() => setRole('STAFF')}
            style={{ 
              background: '#ffffff',
              border: '1px solid #e2e8f0', 
              borderTop: '4px solid #2563eb', // Blue accent
              padding: '40px 32px', 
              borderRadius: '16px', 
              cursor: 'pointer', 
              width: '260px', 
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)'; }}
          >
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏢</div>
            <h2 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '24px' }}>Staff Authority</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
              Manage operational complaints and monitor delay risks.
            </p>
          </div>

        </div>
      </div>
    );
  }

  // --- MAIN APPLICATION PORTALS ---
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Secured Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '20px', marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px', userSelect: 'none' }}>
          Clean Mysuru 
          <span style={{ fontSize: '16px', color: '#64748b', fontWeight: '600', marginLeft: '12px', borderLeft: '2px solid #e2e8f0', paddingLeft: '12px' }}>
            {role === 'CITIZEN' ? 'Citizen Portal' : 'Operational Dashboard'}
          </span>
        </h1>
        
        {/* Mock Logout Button */}
        <button 
          onClick={() => setRole(null)} 
          style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 'bold', transition: 'all 0.2s' }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; }}
        >
          Sign Out
        </button>
      </div>

      {/* Render the correct dashboard based on role */}
      {role === 'CITIZEN' ? <CitizenPortal /> : <StaffDashboard />}
      
    </div>
  );
}

export default App;
