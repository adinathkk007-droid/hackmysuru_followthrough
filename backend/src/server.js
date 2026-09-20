import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { config } from "./config.js";
import complaintsRouter from "./routes/complaints.js";
import dashboardRouter from "./routes/dashboard.js";
import debugRouter from "./routes/debug.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl === "*" ? true : config.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "civic-follow-through-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/complaints", complaintsRouter);
app.use("/api/dashboard", dashboardRouter);

// Development diagnostics only. Never expose these routes in production.
if (process.env.DEBUG_API === "true") {
  app.use("/api/debug", debugRouter);
}

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} does not exist.`
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    error: "Internal server error",
    message: "The server encountered an unexpected error."
  });
});

export function startServer(port = config.port) {
  return app.listen(port, () => {
    console.log(`Civic Follow-through API running on http://localhost:${port}`);
  });
}

const isDirectRun = Boolean(
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase()
);

if (isDirectRun && process.env.NODE_ENV !== "test") {
  startServer();
}

export { app };
