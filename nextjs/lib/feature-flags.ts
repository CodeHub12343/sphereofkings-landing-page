// Feature flags for Phase 9 demand-gated features. Default to OFF —
// no code path reads a flag that is not declared here. Flip via env
// so a redeploy toggles them without touching source.

export const FEATURE_FLAGS = {
  // F27 — AI-generated video rendering of a match. Deferred until
  // F26 replay telemetry shows meaningful demand (goal: >5% of
  // finished matches viewed via replay in a week).
  videoRendering: process.env.FEATURE_VIDEO_RENDERING === "1",

  // F28 — AI narration over the video output. Depends on F27.
  aiNarration: process.env.FEATURE_AI_NARRATION === "1",

  // F19 — paid tournament entry. Deferred until the legal review
  // listed in ADR-0003 completes.
  paidTournaments: process.env.FEATURE_PAID_TOURNAMENTS === "1",

  // F33 — public activity feed. Scoped out of Phase 8 (comments only
  // on official posts); re-enabled here when community moderation
  // ratio holds steady for 30 days.
  publicFeed: process.env.FEATURE_PUBLIC_FEED === "1",

  // Custom-image sphere uploads. Image moderation gate must pass
  // AWS Rekognition / Hive integration first.
  customImageSpheres: process.env.FEATURE_CUSTOM_IMAGE_SPHERES === "1",
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function flag(name: FeatureFlag): boolean {
  return FEATURE_FLAGS[name];
}
