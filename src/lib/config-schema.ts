export type DeploymentStage = "development" | "test" | "staging" | "production";

export interface RuntimeConfig {
  stage: DeploymentStage;
  features: {
    demoMode: boolean;
  };
}

function deploymentStage(value: string | undefined, nodeEnv: string | undefined): DeploymentStage {
  if (value === "development" || value === "test" || value === "staging" || value === "production") {
    return value;
  }

  if (value) {
    throw new Error("DEPLOYMENT_STAGE must be one of: development, test, staging, production");
  }

  return nodeEnv === "production" ? "production" : "development";
}

function booleanFlag(name: string, value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === "") return fallback;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  throw new Error(`${name} must be one of: true, false, 1, 0`);
}

export function resolveRuntimeConfig(
  environment: Readonly<Record<string, string | undefined>>,
): RuntimeConfig {
  const stage = deploymentStage(environment.DEPLOYMENT_STAGE, environment.NODE_ENV);
  const demoRequested = booleanFlag("DEMO_MODE", environment.DEMO_MODE, false);

  if (stage === "production" && demoRequested) {
    throw new Error("DEMO_MODE cannot be enabled when DEPLOYMENT_STAGE=production");
  }

  return {
    stage,
    features: {
      demoMode: stage !== "production" && demoRequested,
    },
  };
}
