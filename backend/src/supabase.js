import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function getAuthenticatedUser(token) {
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
