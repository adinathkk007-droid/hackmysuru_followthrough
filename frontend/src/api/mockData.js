export const mockComplaints = [
  {
    id: 'CMP-001',
    issueType: 'WASTE_ACCUMULATION',
    title: 'Garbage dump near main road',
    description: 'Waste has not been collected for 4 days. Starting to block the footpath.',
    location: 'KD Road, Near Signal',
    priority: 'HIGH',
    status: 'SUBMITTED',
    assignedAuthority: null,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    riskScore: 85,
    riskLevel: 'HIGH'
  },
  {
    id: 'CMP-002',
    issueType: 'POTHOLE',
    title: 'Deep pothole on ring road',
    description: 'Dangerous pothole causing traffic slowdowns.',
    location: 'Outer Ring Road, Block 3',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
    assignedAuthority: 'Ward 4 Team',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    riskScore: 12,
    riskLevel: 'LOW'
  }
];

export const mockRiskReasons = {
  'CMP-001': [
    'No meaningful update for 48 hours.',
    'Similar waste complaints usually resolve in 24 hours.',
    'Currently in SUBMITTED state with no assigned authority.'
  ],
  'CMP-002': [
    'Complaint is actively IN_PROGRESS.',
    'Updated recently.'
  ]
};
export const mockHistory = {
  'CMP-001': [
    { id: 1, oldStatus: null, newStatus: 'SUBMITTED', changedBy: 'Citizen', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }
  ],
  'CMP-002': [
    { id: 2, oldStatus: null, newStatus: 'SUBMITTED', changedBy: 'Citizen', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 3, oldStatus: 'SUBMITTED', newStatus: 'ASSIGNED', changedBy: 'System Routing', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: 4, oldStatus: 'ASSIGNED', newStatus: 'IN_PROGRESS', changedBy: 'Ward 4 Team', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
  ]
};