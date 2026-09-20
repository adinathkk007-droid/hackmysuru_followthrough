import express from "express";
import { supabaseAdmin } from "../supabase.js";
import { config } from "../config.js";
import { normalizeId } from "./complaints.js";

const router = express.Router();

function projectRef(url) {
  try {
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

router.get("/supabase", async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("complaints")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({
      ok: true,
      projectRef: projectRef(config.supabaseUrl),
      table: "public.complaints",
      rowCountReturned: data?.length ?? 0,
      rows: data ?? []
    });
  } catch (error) {
    next(error);
  }
});

router.get("/complaints/:id", async (req, res, next) => {
  try {
    const requestedId = String(req.params.id ?? "");
    const normalizedId = normalizeId(requestedId);

    const { data: exact, error: exactError } = await supabaseAdmin
      .from("complaints")
      .select("id,title,status,created_at")
      .eq("id", normalizedId)
      .limit(1);

    if (exactError) throw exactError;

    const { data: recent, error: recentError } = await supabaseAdmin
      .from("complaints")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (recentError) throw recentError;

    const normalizedMatches = (recent || []).filter(row => normalizeId(row.id) === normalizedId);

    res.json({
      ok: true,
      projectRef: projectRef(config.supabaseUrl),
      requestedId,
      normalizedId,
      exactMatchCount: exact?.length ?? 0,
      normalizedMatchCount: normalizedMatches.length,
      exactMatches: exact ?? [],
      normalizedMatches,
      recentRows: recent ?? []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
