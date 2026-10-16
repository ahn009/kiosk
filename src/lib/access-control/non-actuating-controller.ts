import type {
  AccessCommand,
  AccessController,
  AccessControllerResult,
  AdapterDescriptor,
} from "./contracts.ts";

/**
 * Development controller. It preserves the production command/result contract
 * while making physical actuation impossible.
 */
export class NonActuatingAccessController implements AccessController {
  async describe(): Promise<AdapterDescriptor> {
    return {
      adapterId: "development.non-actuating-controller",
      adapterVersion: "1.0.0",
      health: "ready",
      capabilities: ["decision-recording", "never-actuates"],
    };
  }

  async execute(
    command: AccessCommand,
    signal: AbortSignal,
  ): Promise<AccessControllerResult> {
    signal.throwIfAborted();

    return {
      commandId: command.commandId,
      status: "acknowledged",
      actuated: false,
      observedDoorState: "unknown",
      recordedAt: new Date().toISOString(),
      reasonCode: "DEVELOPMENT_NON_ACTUATING",
    };
  }
}
