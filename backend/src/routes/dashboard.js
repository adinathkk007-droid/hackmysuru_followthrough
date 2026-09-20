import express from "express";
import { supabaseAdmin } from "../supabase.js";

const router = express.Router();

router.get("/summary", async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("complaints")
      .select("status, priority, risk_level");

    if (error) throw error;

    const summary = {
      total: data.length,
      byStatus: {},
      byPriority: {},
      highRisk: 0
    };

    for (const row of data) {
      summary.byStatus[row.status] = (summary.byStatus[row.status] || 0) + 1;
      summary.byPriority[row.priority] = (summary.byPriority[row.priority] || 0) + 1;
      if (row.risk_level === "HIGH" || row.risk_level === "CRITICAL") summary.highRisk++;
    }

    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
