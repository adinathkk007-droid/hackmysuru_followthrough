import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

function projectRef(value) {
  try { return new URL(value).hostname.split(".")[0]; } catch { return "invalid-url"; }
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { data, error } = await supabase
  .from("complaints")
  .select("id,title,status,created_at")
  .order("created_at", { ascending: false })
  .limit(20);

if (error) {
  console.error("Supabase query failed:", error.message);
  console.error("code:", error.code, "details:", error.details || "", "hint:", error.hint || "");
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  projectRef: projectRef(url),
  table: "public.complaints",
  count: data?.length ?? 0,
  rows: data ?? []
}, null, 2));
