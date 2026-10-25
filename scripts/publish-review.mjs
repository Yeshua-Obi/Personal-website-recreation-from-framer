import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const repository = "Yeshua-Obi/Personal-website-recreation-from-framer";
const branch = "gh-pages";
function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 8e6, ...options });
  if (result.status !== 0) throw new Error(`${command} failed: ${(result.stderr || result.stdout || result.error?.message || "unknown error").trim()}`);
  return result.stdout?.trim() || "";
}
// Check real hosting access before creating a commit or publishing any files.
const repo = JSON.parse(run("gh", ["api", `repos/${repository}`]));
if (!repo.permissions?.push) throw new Error("GitHub write access is required to publish this repository's review.");
let pages;
const check = spawnSync("gh", ["api", `repos/${repository}/pages`], { encoding: "utf8" });
if (check.status === 0) pages = JSON.parse(check.stdout);
else if (!/404/.test(check.stderr)) throw new Error(check.stderr.trim());
if (pages?.cname || (pages?.source?.branch && pages.source.branch !== branch)) throw new Error("This repository already hosts a different Pages configuration; preserve it before choosing a separate review host.");

run(process.execPath, ["scripts/build-review.mjs"], { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_BASE_PATH: `/${repository.split("/")[1]}` } });
const root = process.cwd();
const scratch = await mkdtemp(path.join(os.tmpdir(), "portfolio-review-index-"));
try {
  const env = { ...process.env, GIT_INDEX_FILE: path.join(scratch, "index") };
  const git = args => run("git", ["--git-dir", path.join(root, ".git"), "--work-tree", path.join(root, "out"), ...args], { cwd: path.join(root, "out"), env });
  const remote = git(["ls-remote", "origin", `refs/heads/${branch}`]);
  const previous = remote.split(/\s/)[0];
  if (previous) git(["fetch", "--no-tags", "origin", branch]);
  git(["read-tree", "--empty"]);
  git(["add", "--all", "--", "."]);
  const tree = git(["write-tree"]);
  const commit = git(["-c", "user.name=Portfolio Preview", "-c", "user.email=preview@users.noreply.github.com", "commit-tree", tree, ...(previous ? ["-p", previous] : []), "-m", "Publish personal portfolio review"]);
  git(["push", "origin", `${commit}:refs/heads/${branch}`]);
  if (!pages) {
    // GitHub can automatically enable a legacy Pages build when gh-pages is
    // first pushed. Re-read before requesting creation, which some repository
    // integrations cannot do even though the automatic deployment is active.
    const activated = spawnSync("gh", ["api", `repos/${repository}/pages`], { encoding: "utf8" });
    pages = activated.status === 0 ? JSON.parse(activated.stdout) : JSON.parse(run("gh", ["api", "--method", "POST", `repos/${repository}/pages`, "-f", `source[branch]=${branch}`, "-f", "source[path]=/"]));
  }
  console.log(`Review deployment requested: ${pages.html_url}. Verify its successful Pages build and public HTTP response before sharing it as live. Source branch/index and Framer site were preserved.`);
} finally {
  await rm(scratch, { recursive: true, force: true });
}
