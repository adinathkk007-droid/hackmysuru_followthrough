import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const runnerPath = path.resolve(__dirname, "../risk_engine/runner.py");

function pythonCommand() {
  return process.env.PYTHON_BIN || (process.platform === "win32" ? "python" : "python3");
}

export function calculateWithVedanthEngine(complaint, context = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonCommand(), [runnerPath], {
      cwd: path.resolve(__dirname, "../.."),
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });

    child.on("error", error => {
      reject(new Error(
        `Unable to start Vedanth risk engine (${pythonCommand()}). ` +
        `Install Python 3 or set PYTHON_BIN. ${error.message}`
      ));
    });

    child.on("close", code => {
      if (code !== 0) {
        let message = stderr.trim();
        try {
          const parsed = JSON.parse(stdout);
          if (parsed?.error) message = parsed.error;
        } catch {
          // Keep stderr when the bridge did not emit structured JSON.
        }
        reject(new Error(`Vedanth risk engine failed: ${message || `exit code ${code}`}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        if (
          !Number.isFinite(Number(result.score)) ||
          !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(result.level) ||
          !Array.isArray(result.reasons)
        ) {
          reject(new Error("Vedanth risk engine returned an invalid result shape."));
          return;
        }
        resolve({
          score: Math.max(0, Math.min(100, Number(result.score))),
          level: result.level,
          reasons: result.reasons.map(String)
        });
      } catch (error) {
        reject(new Error(`Could not parse Vedanth risk engine output: ${error.message}`));
      }
    });

    child.stdin.end(JSON.stringify({ complaint, context }));
  });
}
