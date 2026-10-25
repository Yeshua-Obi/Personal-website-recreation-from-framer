export function studioEnvironment() {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "dntp46vk";
  const dataset = process.env.SANITY_STUDIO_DATASET || "production";
  if (!projectId || !/^[a-z0-9-]+$/.test(projectId) || !dataset || !/^[a-z0-9][a-z0-9_-]*$/.test(dataset)) {
    throw new Error("Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET to the real Sanity project and dataset before starting or deploying the Studio.");
  }
  return { projectId, dataset };
}
