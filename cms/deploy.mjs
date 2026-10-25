import { spawnSync } from "node:child_process";

const ownerAccount = "4cc9c7cf9ced4d7ddfbd94fb29a84342";
if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_ACCOUNT_ID !== ownerAccount) throw new Error("Use the portfolio owner's personal Cloudflare account for the editor deployment.");
const windows = process.platform === "win32";
const result = spawnSync(windows ? "npx.cmd" : "npx", ["--yes", "wrangler@4.152.0", "pages", "deploy", "dist", "--project-name", "yeshua-obi-studio", "--branch", "main"], {
  stdio: "inherit", shell: windows, env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ownerAccount },
});
process.exit(result.status ?? 1);
