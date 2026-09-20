import express from "express";
import { supabaseAdmin } from "../supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { createComplaintSchema, statusSchema } from "../validators.js";
import { isValidStatus, isValidTransition } from "../utils/status.js";
import { toComplaint } from "../utils/response.js";
import { evaluateComplaint } from "../services/riskService.js";

const router = express.Router();

export function normalizeId(value) {
  try {
    let s = decodeURIComponent(String(value ?? ""));
    // Remove zero-width characters and control characters
    s = s.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "");
    // Trim whitespace
    s = s.trim();
    // Strip wrapping single or double quotes if present
    s = s.replace(/^["']|["']$/g, "").trim();
    return s.toLowerCase();
  } catch {
    return String(value ?? "")
      .replace(/^["']|["']$/g, "")
      .trim()
      .toLowerCase();
  }
}

export function isUuid(value) {
  if (typeof value !== "string") return false;
  // Standard PostgreSQL-compatible UUID format (hex digits in 8-4-4-4-12 pattern)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function validationError(res, issues) {
  return res.status(400).json({
    error: "Invalid request",
    message: "One or more fields are invalid.",
    details: issues
  });
}

export async function findComplaintById(id) {
  const normalizedId = normalizeId(id);

  if (!isUuid(normalizedId)) {
    return {
      data: null,
      error: null,
      normalizedId,
      invalidId: true
    };
  }

  // Use limit(1) to avoid ambiguous single-row errors.
  // Both list and detail routes use the same supabaseAdmin client and public.complaints table.
  const { data, error } = await supabaseAdmin
    .from("complaints")
    .select("*")
    .eq("id", normalizedId)
    .limit(1);

  // If PostgREST returned 22P02 (invalid uuid syntax), treat as invalid ID
  if (error && error.code === "22P02") {
    return {
      data: null,
      error: null,
      normalizedId,
      invalidId: true
    };
  }

  return {
    data: data?.[0] ?? null,
    error,
    normalizedId,
    invalidId: false
  };
}

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const parsed = createComplaintSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error.issues);

    const body = parsed.data;

    const { data: complaint, error } = await supabaseAdmin
      .from("complaints")
      .insert({
        citizen_id: req.user.id,
        issue_type: body.issueType,
        title: body.title,
        description: body.description,
        location_lat: body.location.lat,
        location_lng: body.location.lng,
        location_text: body.location.text,
        priority: body.priority,
        status: "SUBMITTED"
      })
      .select()
      .single();

    if (error) throw error;

    const { error: historyError } = await supabaseAdmin
      .from("status_history")
      .insert({
        complaint_id: complaint.id,
        old_status: null,
        new_status: "SUBMITTED",
        remarks: "Complaint submitted",
        changed_by: req.user.id
      });

    if (historyError) {
      await supabaseAdmin.from("complaints").delete().eq("id", complaint.id);
      throw historyError;
    }

    return res.status(201).json(toComplaint(complaint));
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (req.query.status) query = query.eq("status", String(req.query.status).trim().toUpperCase());
    if (req.query.priority) query = query.eq("priority", String(req.query.priority).trim().toUpperCase());
    if (req.query.citizenId) query = query.eq("citizen_id", String(req.query.citizenId).trim());

    const { data, error } = await query;
    if (error) throw error;

    res.json((data || []).map(toComplaint));
  } catch (error) {
    next(error);
  }
});

router.get("/:id/history", async (req, res, next) => {
  try {
    const lookup = await findComplaintById(req.params.id);
    if (lookup.error) throw lookup.error;

    if (lookup.invalidId) {
      return res.status(400).json({
        error: "Invalid complaint ID",
        message: "Complaint ID must be a valid UUID.",
        received: req.params.id
      });
    }

    if (!lookup.data) {
      return res.status(404).json({
        error: "Complaint not found",
        message: `No complaint exists with id ${lookup.normalizedId}.`,
        normalizedId: lookup.normalizedId
      });
    }

    const { data, error } = await supabaseAdmin
      .from("status_history")
      .select("id, old_status, new_status, remarks, changed_by, created_at")
      .eq("complaint_id", lookup.normalizedId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json((data || []).map(row => ({
      id: row.id,
      oldStatus: row.old_status,
      newStatus: row.new_status,
      remarks: row.remarks,
      changedBy: row.changed_by,
      createdAt: row.created_at
    })));
  } catch (error) {
    next(error);
  }
});

router.get("/:id/risk", async (req, res, next) => {
  try {
    const lookup = await findComplaintById(req.params.id);
    if (lookup.error) throw lookup.error;

    if (lookup.invalidId) {
      return res.status(400).json({
        error: "Invalid complaint ID",
        message: "Complaint ID must be a valid UUID.",
        received: req.params.id
      });
    }

    if (!lookup.data) {
      return res.status(404).json({
        error: "Complaint not found",
        message: `No complaint exists with id ${lookup.normalizedId}.`,
        normalizedId: lookup.normalizedId
      });
    }

    const complaint = lookup.data;
    const evaluation = await evaluateComplaint(complaint);
    const assessedAt = new Date().toISOString();

    // Keep the canonical complaint risk fields synchronized with the latest
    // explainable engine calculation.
    const { error: complaintRiskError } = await supabaseAdmin
      .from("complaints")
      .update({
        risk_score: evaluation.score,
        risk_level: evaluation.level
      })
      .eq("id", lookup.normalizedId);

    if (complaintRiskError) throw complaintRiskError;

    const { error: assessmentError } = await supabaseAdmin
      .from("risk_assessments")
      .insert({
        complaint_id: lookup.normalizedId,
        score: evaluation.score,
        level: evaluation.level,
        reasons: evaluation.reasons
      });

    if (assessmentError) throw assessmentError;

    return res.json({
      score: evaluation.score,
      level: evaluation.level,
      reasons: evaluation.reasons,
      createdAt: assessedAt
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const lookup = await findComplaintById(req.params.id);
    if (lookup.error) throw lookup.error;

    if (lookup.invalidId) {
      return res.status(400).json({
        error: "Invalid complaint ID",
        message: "Complaint ID must be a valid UUID.",
        received: req.params.id
      });
    }

    if (!lookup.data) {
      return res.status(404).json({
        error: "Complaint not found",
        message: `No complaint exists with id ${lookup.normalizedId}.`,
        normalizedId: lookup.normalizedId
      });
    }

    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error.issues);

    const { status, remarks } = parsed.data;
    const normalizedStatus = status.toUpperCase();

    if (!isValidStatus(normalizedStatus)) {
      return res.status(400).json({
        error: "Invalid status",
        message: `Status must be one of: SUBMITTED, ASSIGNED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, REJECTED.`
      });
    }

    const existing = lookup.data;

    if (existing.status === normalizedStatus) {
      return res.status(409).json({
        error: "Status already set",
        message: `Complaint is already ${normalizedStatus}.`
      });
    }

    if (!isValidTransition(existing.status, normalizedStatus)) {
      return res.status(409).json({
        error: "Invalid status transition",
        message: `Cannot move complaint from ${existing.status} to ${normalizedStatus}.`
      });
    }

    const resolvedAt = normalizedStatus === "RESOLVED"
      ? new Date().toISOString()
      : existing.resolved_at;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("complaints")
      .update({
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
        resolved_at: resolvedAt
      })
      .eq("id", lookup.normalizedId)
      .select()
      .single();

    if (updateError) throw updateError;

    const { error: historyError } = await supabaseAdmin
      .from("status_history")
      .insert({
        complaint_id: existing.id,
        old_status: existing.status,
        new_status: normalizedStatus,
        remarks: remarks || null,
        changed_by: req.user.id
      });

    if (historyError) {
      await supabaseAdmin
        .from("complaints")
        .update({
          status: existing.status,
          updated_at: existing.updated_at,
          resolved_at: existing.resolved_at
        })
        .eq("id", existing.id);
      throw historyError;
    }

    res.json(toComplaint(updated));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const lookup = await findComplaintById(req.params.id);
    if (lookup.error) throw lookup.error;

    if (lookup.invalidId) {
      return res.status(400).json({
        error: "Invalid complaint ID",
        message: "Complaint ID must be a valid UUID.",
        received: req.params.id
      });
    }

    if (!lookup.data) {
      return res.status(404).json({
        error: "Complaint not found",
        message: `No complaint exists with id ${lookup.normalizedId}.`,
        normalizedId: lookup.normalizedId
      });
    }

    res.json(toComplaint(lookup.data));
  } catch (error) {
    next(error);
  }
});

export default router;
