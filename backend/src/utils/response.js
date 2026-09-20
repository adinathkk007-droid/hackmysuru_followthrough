export function toComplaint(row) {
  return {
    id: row.id,
    citizenId: row.citizen_id,
    issueType: row.issue_type,
    title: row.title,
    description: row.description,
    location: {
      lat: row.location_lat,
      lng: row.location_lng,
      text: row.location_text
    },
    priority: row.priority,
    status: row.status,
    assignedAuthority: row.assigned_authority,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    riskScore: row.risk_score,
    riskLevel: row.risk_level
  };
}
