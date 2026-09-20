import { getAuthenticatedUser } from "../supabase.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const user = await getAuthenticatedUser(token);

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "A valid Supabase access token is required."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
