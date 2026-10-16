import "server-only";
import { resolveRuntimeConfig } from "./config-schema";

const resolved = resolveRuntimeConfig(process.env);

export const runtimeConfig = Object.freeze({
  stage: resolved.stage,
  features: Object.freeze({
    demoMode: resolved.features.demoMode,
  }),
});

export function demoModeUnavailable(): Response {
  return Response.json(
    { error: "Not found", code: "FEATURE_DISABLED" },
    { status: 404 },
  );
}
