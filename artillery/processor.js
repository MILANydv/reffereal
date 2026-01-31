/**
 * Artillery processor: inject API_KEY and CAMPAIGN_ID from .env into context.vars
 * so the scenario can use {{ apiKey }} and {{ campaignId }}.
 * Loads .env from project root so workers have the vars (--dotenv may not reach workers).
 */
const path = require("path");
const fs = require("fs");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

module.exports = {
  beforeScenario: (context, ee, done) => {
    loadEnv();
    context.vars.apiKey = process.env.API_KEY || context.vars.apiKey || "";
    context.vars.campaignId = (process.env.CAMPAIGN_ID || context.vars.campaignId || "").replace(/'$/, "");
    return done();
  },
};
