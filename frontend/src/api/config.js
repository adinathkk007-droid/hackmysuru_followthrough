export const STATUS = {
  SUBMITTED: 'SUBMITTED',
  ASSIGNED: 'ASSIGNED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED'
};

export const RISK_LEVEL = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// Demo mode is deliberately self-contained so the MVP can be deployed as a single
// static frontend when the external database/auth service is unavailable.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const TOKEN_KEY = 'civic_follow_through_access_token';
const USER_KEY = 'civic_follow_through_user';
const MOCK_KEY = 'civic_follow_through_mock_data_v1';

const DEMO_USERS = {
  'citizen.demo@civicmysuru.local': { id: 'citizen-demo-001', email: 'citizen.demo@civicmysuru.local' },
  'authority.demo@civicmysuru.local': { id: 'authority-demo-001', email: 'authority.demo@civicmysuru.local' }
};
const DEMO_PASSWORD = 'CivicDemo123!';

function hoursAgo(hours) { return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(); }

function initialMockData() {
  return {
    complaints: [
      {
        id: 'CMP-001', citizenId: 'citizen-demo-001', issueType: 'WASTE_ACCUMULATION',
        title: 'Garbage dump near main road',
        description: 'Waste has not been collected for 4 days. Starting to block the footpath.',
        location: { lat: 12.2958, lng: 76.6394, text: 'KD Road, Near Signal' },
        priority: 'HIGH', status: STATUS.SUBMITTED, assignedAuthority: null,
        createdAt: hoursAgo(48), updatedAt: hoursAgo(48), resolvedAt: null,
        riskScore: 85, riskLevel: RISK_LEVEL.HIGH
      },
      {
        id: 'CMP-002', citizenId: 'citizen-demo-001', issueType: 'POTHOLE',
        title: 'Deep pothole on ring road',
        description: 'Dangerous pothole causing traffic slowdowns.',
        location: { lat: 12.31, lng: 76.65, text: 'Outer Ring Road, Block 3' },
        priority: 'NORMAL', status: STATUS.IN_PROGRESS, assignedAuthority: 'Ward 4 Team',
        createdAt: hoursAgo(5), updatedAt: hoursAgo(1), resolvedAt: null,
        riskScore: 12, riskLevel: RISK_LEVEL.LOW
      }
    ],
    history: {
      'CMP-001': [
        { id: 1, oldStatus: null, newStatus: STATUS.SUBMITTED, changedBy: 'Citizen', createdAt: hoursAgo(48), remarks: '' }
      ],
      'CMP-002': [
        { id: 2, oldStatus: null, newStatus: STATUS.SUBMITTED, changedBy: 'Citizen', createdAt: hoursAgo(5), remarks: '' },
        { id: 3, oldStatus: STATUS.SUBMITTED, newStatus: STATUS.ASSIGNED, changedBy: 'System Routing', createdAt: hoursAgo(4), remarks: '' },
        { id: 4, oldStatus: STATUS.ASSIGNED, newStatus: STATUS.IN_PROGRESS, changedBy: 'Ward 4 Team', createdAt: hoursAgo(1), remarks: '' }
      ]
    },
    nextId: 3,
    nextHistoryId: 5
  };
}

function readMockData() {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* reset below */ }
  const fresh = initialMockData();
  writeMockData(fresh);
  return fresh;
}

function writeMockData(data) {
  localStorage.setItem(MOCK_KEY, JSON.stringify(data));
}

function riskFor(complaint) {
  if (complaint.status === STATUS.RESOLVED) return { score: 0, level: RISK_LEVEL.LOW, reasons: ['Complaint has been resolved.'] };
  if (complaint.status === STATUS.REJECTED) return { score: 0, level: RISK_LEVEL.LOW, reasons: ['Complaint was closed as rejected.'] };

  const ageHours = Math.max(0, (Date.now() - new Date(complaint.updatedAt).getTime()) / 36e5);
  let score = 10;
  const reasons = [];

  if (ageHours >= 48) { score += 55; reasons.push(`No meaningful update for ${Math.floor(ageHours)} hours.`); }
  else if (ageHours >= 24) { score += 35; reasons.push(`No meaningful update for ${Math.floor(ageHours)} hours.`); }
  else if (ageHours >= 8) { score += 20; reasons.push(`No meaningful update for ${Math.floor(ageHours)} hours.`); }
  else reasons.push('Complaint has been updated recently.');

  if (complaint.priority === 'CRITICAL') score += 20;
  else if (complaint.priority === 'HIGH') score += 15;
  else if (complaint.priority === 'MEDIUM') score += 5;

  if (complaint.status === STATUS.SUBMITTED) { score += 15; reasons.push('Complaint is still awaiting assignment.'); }
  else if (complaint.status === STATUS.IN_PROGRESS) reasons.push('Complaint is actively IN_PROGRESS.');
  else if (complaint.status === STATUS.ACKNOWLEDGED) reasons.push('Authority has acknowledged the complaint.');

  score = Math.min(100, Math.round(score));
  const level = score >= 85 ? RISK_LEVEL.CRITICAL : score >= 60 ? RISK_LEVEL.HIGH : score >= 30 ? RISK_LEVEL.MEDIUM : RISK_LEVEL.LOW;
  return { score, level, reasons };
}

function refreshRisk(complaint) {
  const risk = riskFor(complaint);
  complaint.riskScore = risk.score;
  complaint.riskLevel = risk.level;
  return complaint;
}

export function getAccessToken() { return localStorage.getItem(TOKEN_KEY); }
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function signIn(email, password) {
  if (!DEMO_MODE) throw new Error('Live authentication is disabled in this build.');
  const normalized = email.trim().toLowerCase();
  const user = DEMO_USERS[normalized];
  if (!user || password !== DEMO_PASSWORD) throw new Error('Use the supplied demo account credentials.');
  localStorage.setItem(TOKEN_KEY, `demo-token-${user.id}`);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  readMockData();
  return user;
}

export function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function mockRequest(path, options = {}) {
  const data = readMockData();
  data.complaints.forEach(refreshRisk);
  writeMockData(data);

  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const parts = path.split('/').filter(Boolean);
  const index = parts.indexOf('complaints');
  const id = index >= 0 ? decodeURIComponent(parts[index + 1] || '') : null;

  if (path.startsWith('/api/complaints') && !id && method === 'GET') {
    const params = new URLSearchParams(path.split('?')[1] || '');
    const citizenId = params.get('citizenId');
    return data.complaints.filter(c => !citizenId || c.citizenId === citizenId).map(refreshRisk);
  }

  if (path === '/api/complaints' && method === 'POST') {
    const user = getStoredUser();
    const complaintId = `CMP-${String(data.nextId++).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const complaint = refreshRisk({
      id: complaintId,
      citizenId: user?.id || 'citizen-demo-001',
      issueType: body.issueType,
      title: body.title,
      description: body.description,
      location: body.location,
      priority: body.priority,
      status: STATUS.SUBMITTED,
      assignedAuthority: null,
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
      riskScore: 0,
      riskLevel: RISK_LEVEL.LOW
    });
    data.complaints.push(complaint);
    data.history[complaintId] = [{ id: data.nextHistoryId++, oldStatus: null, newStatus: STATUS.SUBMITTED, changedBy: 'Citizen', createdAt: now, remarks: '' }];
    writeMockData(data);
    return complaint;
  }

  if (id && method === 'GET' && parts[parts.length - 1] === id) {
    const complaint = data.complaints.find(c => c.id === id);
    if (!complaint) throw new Error('Complaint not found.');
    return refreshRisk(complaint);
  }

  if (id && path.endsWith('/history') && method === 'GET') return data.history[id] || [];

  if (id && path.endsWith('/risk') && method === 'GET') {
    const complaint = data.complaints.find(c => c.id === id);
    if (!complaint) throw new Error('Complaint not found.');
    refreshRisk(complaint);
    writeMockData(data);
    const risk = riskFor(complaint);
    return { score: risk.score, level: risk.level, reasons: risk.reasons };
  }

  if (id && path.endsWith('/status') && method === 'PATCH') {
    const complaint = data.complaints.find(c => c.id === id);
    if (!complaint) throw new Error('Complaint not found.');
    const oldStatus = complaint.status;
    const now = new Date().toISOString();
    complaint.status = body.status;
    complaint.updatedAt = now;
    complaint.assignedAuthority = complaint.assignedAuthority || 'Ward 4 Team';
    if (body.status === STATUS.RESOLVED) complaint.resolvedAt = now;
    refreshRisk(complaint);
    data.history[id] = data.history[id] || [];
    data.history[id].push({ id: data.nextHistoryId++, oldStatus, newStatus: body.status, changedBy: 'Ward 4 Team', createdAt: now, remarks: body.remarks || '' });
    writeMockData(data);
    return complaint;
  }

  if (path === '/api/dashboard/summary' && method === 'GET') {
    const byStatus = {};
    data.complaints.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });
    return {
      total: data.complaints.length,
      highRisk: data.complaints.filter(c => c.riskLevel === RISK_LEVEL.HIGH || c.riskLevel === RISK_LEVEL.CRITICAL).length,
      byStatus
    };
  }

  throw new Error(`Demo route not implemented: ${method} ${path}`);
}

async function request(path, options = {}) {
  if (DEMO_MODE) return mockRequest(path, options);
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
  if (!response.ok) throw new Error(data?.message || data?.error || `Request failed with HTTP ${response.status}`);
  return data;
}

export const apiClient = {
  getComplaints({ citizenId } = {}) {
    const params = new URLSearchParams();
    if (citizenId) params.set('citizenId', citizenId);
    const query = params.toString() ? `?${params}` : '';
    return request(`/api/complaints${query}`);
  },
  getComplaint(id) { return request(`/api/complaints/${encodeURIComponent(id)}`); },
  createComplaint(payload) { return request('/api/complaints', { method: 'POST', body: JSON.stringify(payload) }); },
  updateStatus(id, status, remarks = '') { return request(`/api/complaints/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status, remarks }) }); },
  getRisk(id) { return request(`/api/complaints/${encodeURIComponent(id)}/risk`); },
  getHistory(id) { return request(`/api/complaints/${encodeURIComponent(id)}/history`); },
  getDashboardSummary() { return request('/api/dashboard/summary'); }
};
