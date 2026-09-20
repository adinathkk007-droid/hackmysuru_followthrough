import "dotenv/config";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY || "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  port: Number(process.env.PORT || 5000),
  debugApi: process.env.DEBUG_API === "true"
};
