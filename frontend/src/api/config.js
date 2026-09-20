import { mockComplaints, mockRiskReasons, mockHistory } from './mockData';

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

const BASE_URL = '/api';
const USE_MOCK = true; // Switch to false when Aakash's API is ready

export const apiClient = {
  async getComplaints() {
    if (USE_MOCK) return Promise.resolve([...mockComplaints].reverse()); // Newest first
    const response = await fetch(`${BASE_URL}/complaints`);
    return response.json();
  },

  async getComplaint(id) {
    if (USE_MOCK) return Promise.resolve(mockComplaints.find(c => c.id === id));
    const response = await fetch(`${BASE_URL}/complaints/${id}`);
    return response.json();
  },

  async createComplaint(payload) {
    if (USE_MOCK) {
      const newId = `CMP-00${mockComplaints.length + 1}`;
      const now = new Date().toISOString();
      const newComplaint = {
        id: newId,
        ...payload,
        status: STATUS.SUBMITTED,
        assignedAuthority: null,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
        riskScore: 0,
        riskLevel: RISK_LEVEL.LOW
      };
      // Save to memory so the UI updates
      mockComplaints.push(newComplaint);
      mockHistory[newId] = [
        { id: Date.now(), oldStatus: null, newStatus: STATUS.SUBMITTED, changedBy: 'Citizen', createdAt: now }
      ];
      return Promise.resolve(newComplaint);
    }
    const response = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return response.json();
  },

  async updateStatus(id, status) {
    if (USE_MOCK) {
      const complaint = mockComplaints.find(c => c.id === id);
      if (complaint) {
        const oldStatus = complaint.status;
        complaint.status = status;
        complaint.updatedAt = new Date().toISOString();
        
        // Log it to history
        if (!mockHistory[id]) mockHistory[id] = [];
        mockHistory[id].push({
          id: Date.now(),
          oldStatus: oldStatus,
          newStatus: status,
          changedBy: 'Staff',
          createdAt: complaint.updatedAt
        });
      }
      return Promise.resolve(complaint);
    }
    const response = await fetch(`${BASE_URL}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  async getRisk(id) {
    if (USE_MOCK) {
      const complaint = mockComplaints.find(c => c.id === id);
      return Promise.resolve({
        score: complaint.riskScore,
        level: complaint.riskLevel,
        reasons: mockRiskReasons[id] || []
      });
    }
    const response = await fetch(`${BASE_URL}/complaints/${id}/risk`);
    return response.json();
  },

  async getHistory(id) {
    if (USE_MOCK) return Promise.resolve(mockHistory[id] || []);
    const response = await fetch(`${BASE_URL}/complaints/${id}/history`);
    return response.json();
  }
};
 