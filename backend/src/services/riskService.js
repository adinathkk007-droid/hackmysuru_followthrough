import { supabaseAdmin } from "../supabase.js";
import { calculateWithVedanthEngine } from "./riskEngineBridge.js";

async function getHistoricalAverageResolutionHours() {
  const { data, error } = await supabaseAdmin
    .from("complaints")
    .select("created_at, resolved_at")
    .eq("status", "RESOLVED")
    .not("resolved_at", "is", null);

  if (error) throw error;

  const durations = (data || [])
    .map(row => (new Date(row.resolved_at).getTime() - new Date(row.created_at).getTime()) / 3600000)
    .filter(hours => Number.isFinite(hours) && hours >= 0);

  if (!durations.length) return 0;
  return durations.reduce((sum, hours) => sum + hours, 0) / durations.length;
}

async function getAuthorityOpenCount(assignedAuthority) {
  if (!assignedAuthority) return 0;

  const { count, error } = await supabaseAdmin
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("assigned_authority", assignedAuthority)
    .not("status", "in", "(RESOLVED,REJECTED)");

  if (error) throw error;
  return count || 0;
}

async function getRepeatedDelayCount(complaintId) {
  // The current canonical schema has no dedicated delay counter. Do not
  // invent one: only explicit "delay" remarks are treated as delay history.
  const { data, error } = await supabaseAdmin
    .from("status_history")
    .select("remarks")
    .eq("complaint_id", complaintId)
    .ilike("remarks", "%delay%");

  if (error) throw error;
  return (data || []).length;
}

export async function buildRiskContext(complaint, now = new Date()) {
  const [historicalAverageResolutionHours, authorityOpenComplaints, repeatedDelays] =
    await Promise.all([
      getHistoricalAverageResolutionHours(),
      getAuthorityOpenCount(complaint.assigned_authority),
      getRepeatedDelayCount(complaint.id)
    ]);

  return {
    now: now.toISOString(),
    historicalAverageResolutionHours,
    authorityOpenComplaints,
    repeatedDelays
  };
}

/**
 * Calls Vedanth's original rules-based Python engine without duplicating or
 * replacing its formula in JavaScript.
 */
export async function calculateComplaintRisk(complaint, context = {}) {
  return calculateWithVedanthEngine(complaint, context);
}

/**
 * Calculates risk using live backend/database context.
 */
export async function evaluateComplaint(complaint) {
  const context = await buildRiskContext(complaint);
  return calculateWithVedanthEngine(complaint, context);
}
