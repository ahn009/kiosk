/**
 * Hardware- and vendor-neutral contracts for the access decision pipeline.
 * Adapters collect evidence; only the trusted policy service decides access.
 */

export type AdapterHealth = "ready" | "degraded" | "offline";

export interface AdapterDescriptor {
  adapterId: string;
  adapterVersion: string;
  health: AdapterHealth;
  capabilities: readonly string[];
}

export interface TransactionContext {
  transactionId: string;
  kioskId: string;
  organizationId: string;
  startedAt: string;
  challenge: string;
  policyVersion: string;
}

export interface CredentialEvidence {
  format: string;
  encodedCredential: string;
  capturedAt: string;
  reader: AdapterDescriptor;
  metadata: Readonly<Record<string, string | number | boolean>>;
}

export interface CredentialReader {
  describe(): Promise<AdapterDescriptor>;
  read(context: TransactionContext, signal: AbortSignal): Promise<CredentialEvidence>;
}

export interface CapturedFrame {
  bytes: Uint8Array;
  mediaType: string;
  width: number;
  height: number;
  capturedAt: string;
  sequence: number;
}

export interface CameraCapture {
  describe(): Promise<AdapterDescriptor>;
  capture(context: TransactionContext, signal: AbortSignal): AsyncIterable<CapturedFrame>;
}

export interface BiometricEvidence {
  subjectId: string;
  modelId: string;
  modelVersion: string;
  padProvider: string;
  padVersion: string;
  matchScore: number;
  presentationAttackScore: number;
  qualityScore: number;
  evaluatedAt: string;
  evidenceDigest: string;
}

export interface BiometricVerifier {
  describe(): Promise<AdapterDescriptor>;
  verify(
    context: TransactionContext,
    subjectId: string,
    frames: AsyncIterable<CapturedFrame>,
    signal: AbortSignal,
  ): Promise<BiometricEvidence>;
}

export type AccessDecision = "allow" | "deny" | "challenge" | "error";

export interface PolicyInput {
  context: TransactionContext;
  subjectId: string;
  credentialEvidenceDigest: string;
  biometric?: BiometricEvidence;
  deviceHealth: AdapterHealth;
  offline: boolean;
}

export interface PolicyResult {
  decision: AccessDecision;
  reasonCode: string;
  policyVersion: string;
  decidedAt: string;
  expiresAt: string;
}

export interface PolicyDecisionService {
  decide(input: PolicyInput, signal: AbortSignal): Promise<PolicyResult>;
}

export interface AccessCommand {
  commandId: string;
  context: TransactionContext;
  decision: PolicyResult;
  doorId: string;
}

export interface AccessControllerResult {
  commandId: string;
  status: "acknowledged" | "rejected" | "unavailable";
  actuated: boolean;
  observedDoorState: "open" | "closed" | "unknown";
  recordedAt: string;
  reasonCode?: string;
}

export interface AccessController {
  describe(): Promise<AdapterDescriptor>;
  execute(command: AccessCommand, signal: AbortSignal): Promise<AccessControllerResult>;
}

export interface SecurityEvent {
  eventId: string;
  correlationId: string;
  type: string;
  occurredAt: string;
  payload: Readonly<Record<string, unknown>>;
}

export interface EventSink {
  append(event: SecurityEvent, signal: AbortSignal): Promise<void>;
}
