import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { cosineSimilarity } from "@/lib/crypto";
import { parseBody, ok } from "@/lib/auth-runtime";
import {
  getPendingScan,
  deletePendingScan,
} from "@/lib/kiosk-session";
import { dispatchAlert } from "@/lib/webhook-store";
import type {
  VerifyFaceRequest,
  VerifyFaceResponse,
  Decision,
  FaceMatchStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await parseBody<VerifyFaceRequest>(req);
  if (!body?.scanId || !Array.isArray(body.embedding)) {
    return ok({
      decision: "denied" as Decision,
      matchScore: 0,
      faceMatchStatus: "no_face" as FaceMatchStatus,
    } as VerifyFaceResponse, 400);
  }

  const pending = getPendingScan(body.scanId);
  if (!pending) {
    return ok({
      decision: "denied",
      matchScore: 0,
      faceMatchStatus: "no_face",
    } as VerifyFaceResponse, 404);
  }

  const startedAt = pending.startedAt;
  const latencyMs = Date.now() - startedAt;

  // Fetch employee + enrolled embedding
  const emp = await db.employee.findUnique({
    where: { id: pending.employeeId },
    include: { department: { select: { name: true } } },
  });

  // Kiosk thresholds
  const kiosk = await db.kiosk.findUnique({
    where: { kioskId: pending.kioskId },
  });
  const thresholdGranted = kiosk?.thresholdGranted ?? 0.85;
  const thresholdChallenge = kiosk?.thresholdChallenge ?? 0.6;

  let matchScore = 0;
  let faceMatchStatus: FaceMatchStatus = "no_face";
  let decision: Decision = "denied";
  let employeeIdForLog: string | null = null;
  let snapshotPath: string | null = null;

  if (!emp || !emp.faceEmbedding) {
    faceMatchStatus = "no_face";
    decision = "denied";
  } else {
    employeeIdForLog = emp.id;
    try {
      const enrolledVec = JSON.parse(emp.faceEmbedding) as number[];
      matchScore = cosineSimilarity(body.embedding, enrolledVec);
    } catch {
      matchScore = 0;
    }

    // Liveness & spoof checks
    const livenessOk = body.livenessScore >= 0.87;
    const spoofFlags = body.spoofFlags ?? {};
    const paperDetected = Boolean(spoofFlags.paper_detected);

    if (paperDetected) {
      faceMatchStatus = "mismatch";
      decision = "challenge_failed";
    } else if (!livenessOk) {
      faceMatchStatus = "liveness_fail";
      decision = "challenge_failed";
    } else if (matchScore >= thresholdGranted && livenessOk) {
      faceMatchStatus = "match";
      decision = "granted";
    } else if (matchScore >= thresholdChallenge) {
      // Challenge-path: for demo, grant if liveness ok
      faceMatchStatus = matchScore >= 0.5 ? "match" : "mismatch";
      decision = livenessOk ? "granted" : "challenge_failed";
    } else {
      faceMatchStatus = "mismatch";
      decision = "denied";
    }
  }

  snapshotPath = `kiosk:${pending.kioskId}/${pending.scanId}`;

  // Look up last granted scan (prior to this one) for employee display
  let lastEntry: Date | null = null;
  if (decision === "granted" && emp) {
    const lastGranted = await db.scanEvent.findFirst({
      where: {
        employeeId: emp.id,
        decision: "granted",
        // exclude current scan id range; we'll filter to scans created before now
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    lastEntry = lastGranted?.createdAt ?? null;
  }

  // ALWAYS create an immutable audit row
  await db.scanEvent.create({
    data: {
      kioskId: pending.kioskId,
      employeeId: employeeIdForLog,
      tokenHash: pending.tokenHash,
      faceMatchScore: matchScore,
      faceMatchStatus,
      spoofFlags: body.spoofFlags ? JSON.stringify(body.spoofFlags) : null,
      decision,
      snapshotPath,
      latencyMs,
      offline: false,
    },
  });

  // Remove the pending scan
  deletePendingScan(body.scanId);

  // Dispatch SIEM alerts for security-relevant decisions (best-effort, non-blocking)
  if (decision !== "granted" && emp) {
    const spoofFlags = body.spoofFlags ?? {};
    const paperDetected = Boolean(spoofFlags.paper_detected);
    if (paperDetected) {
      dispatchAlert({
        type: "spoof",
        severity: "critical",
        title: "Spoof attempt detected",
        message: `Paper/photo spoof attempt at kiosk ${pending.kioskId} for ${emp.fullName} (${emp.employeeCode}). Access denied.`,
        kioskId: pending.kioskId,
        employeeCode: emp.employeeCode,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    } else if (decision === "denied" || decision === "challenge_failed") {
      dispatchAlert({
        type: "denied",
        severity: "warning",
        title: "Access denied",
        message: `Face verification failed at kiosk ${pending.kioskId} for ${emp.fullName} (${emp.employeeCode}). Match score ${(matchScore * 100).toFixed(0)}%.`,
        kioskId: pending.kioskId,
        employeeCode: emp.employeeCode,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }
  }

  const response: VerifyFaceResponse = {
    decision,
    matchScore: Number(matchScore.toFixed(4)),
    faceMatchStatus,
  };

  if (decision === "granted" && emp) {
    response.employeeDisplay = {
      code: emp.employeeCode,
      name: emp.fullName,
      department: emp.department?.name ?? null,
      designation: emp.designation,
      accessLevel: emp.accessLevel,
      photoUrl: emp.photoUrl,
      lastEntry: lastEntry ? lastEntry.toISOString() : null,
    };
  }

  return ok(response);
}
