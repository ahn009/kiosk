// SIEM webhook configuration + alert dispatch. Persisted to a JSON file in the
// db folder so it survives server restarts without requiring a schema migration
// (the running dev server's cached Prisma client can't see new models). In a
// real deployment this would be a DB table.
import { promises as fs } from "fs";
import path from "path";

export interface WebhookTarget {
  id: string;
  name: string;
  url: string;
  type: "slack" | "teams" | "generic" | "email";
  enabled: boolean;
  secret?: string; // shared secret for HMAC signing
  events: string[]; // e.g. ["denied","lockdown","spoof","supervisor_override"]
  createdAt: string;
}

interface WebhookState {
  targets: WebhookTarget[];
  globalEnabled: boolean;
  lastDispatchAt: string | null;
  dispatchCount: number;
  failureCount: number;
}

const STATE_FILE = path.join(process.cwd(), "db", "webhook-state.json");

const DEFAULT_STATE: WebhookState = {
  targets: [],
  globalEnabled: true,
  lastDispatchAt: null,
  dispatchCount: 0,
  failureCount: 0,
};

async function readState(): Promise<WebhookState> {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf-8");
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

async function writeState(s: WebhookState): Promise<void> {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(s, null, 2), "utf-8");
}

export async function getWebhookState(): Promise<WebhookState> {
  return readState();
}

export async function saveWebhookTarget(target: WebhookTarget): Promise<WebhookState> {
  const s = await readState();
  const idx = s.targets.findIndex((t) => t.id === target.id);
  if (idx >= 0) s.targets[idx] = target;
  else s.targets.push(target);
  await writeState(s);
  return s;
}

export async function deleteWebhookTarget(id: string): Promise<WebhookState> {
  const s = await readState();
  s.targets = s.targets.filter((t) => t.id !== id);
  await writeState(s);
  return s;
}

export async function setGlobalEnabled(enabled: boolean): Promise<WebhookState> {
  const s = await readState();
  s.globalEnabled = enabled;
  await writeState(s);
  return s;
}

// Dispatch an alert event to all enabled+matching webhook targets.
// Returns per-target results. Best-effort (non-blocking failures).
// If forceAll=true, ignore the event-type filter (used by test alerts).
export async function dispatchAlert(event: {
  type: string; // "denied" | "lockdown" | "spoof" | "supervisor_override" | "granted"
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  kioskId?: string;
  employeeCode?: string | null;
  timestamp: string;
}, forceAll = false): Promise<{ targetId: string; name: string; ok: boolean; status?: number; error?: string }[]> {
  const s = await readState();
  const results: { targetId: string; name: string; ok: boolean; status?: number; error?: string }[] = [];

  if (!s.globalEnabled) return results;

  const matching = s.targets.filter(
    (t) => t.enabled && (forceAll || t.events.includes(event.type))
  );

  for (const t of matching) {
    try {
      const body = formatPayload(t.type, event);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (t.secret) {
        // HMAC-SHA256 signature header
        const crypto = await import("crypto");
        const sig = crypto
          .createHmac("sha256", t.secret)
          .update(JSON.stringify(body))
          .digest("hex");
        headers["X-SentinelKiosk-Signature"] = `sha256=${sig}`;
      }
      const res = await fetch(t.url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      results.push({
        targetId: t.id,
        name: t.name,
        ok: res.ok,
        status: res.status,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ targetId: t.id, name: t.name, ok: false, error: msg });
    }
  }

  // Update stats (best-effort)
  const newS = await readState();
  newS.lastDispatchAt = new Date().toISOString();
  newS.dispatchCount += 1;
  if (results.some((r) => !r.ok)) newS.failureCount += 1;
  await writeState(newS);

  return results;
}

function formatPayload(
  targetType: WebhookTarget["type"],
  event: {
    type: string;
    severity: string;
    title: string;
    message: string;
    kioskId?: string;
    employeeCode?: string | null;
    timestamp: string;
  }
): Record<string, unknown> {
  const base = {
    source: "SentinelKiosk",
    event_type: event.type,
    severity: event.severity,
    title: event.title,
    message: event.message,
    kiosk_id: event.kioskId ?? null,
    employee_code: event.employeeCode ?? null,
    timestamp: event.timestamp,
  };

  if (targetType === "slack") {
    const color =
      event.severity === "critical"
        ? "#dc2626"
        : event.severity === "warning"
          ? "#d97706"
          : "#10b981";
    return {
      attachments: [
        {
          color,
          fallback: event.title,
          title: `🔒 ${event.title}`,
          text: event.message,
          ts: Math.floor(new Date(event.timestamp).getTime() / 1000),
          fields: [
            { title: "Event", value: event.type, short: true },
            { title: "Kiosk", value: event.kioskId ?? "—", short: true },
            { title: "Severity", value: event.severity, short: true },
            { title: "Employee", value: event.employeeCode ?? "—", short: true },
          ],
        },
      ],
    };
  }
  if (targetType === "teams") {
    const themeColor =
      event.severity === "critical"
        ? "DC2626"
        : event.severity === "warning"
          ? "D97706"
          : "10B981";
    return {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor,
      summary: event.title,
      sections: [
        {
          activityTitle: `🔒 ${event.title}`,
          activityText: event.message,
          facts: [
            { name: "Event", value: event.type },
            { name: "Kiosk", value: event.kioskId ?? "—" },
            { name: "Severity", value: event.severity },
            { name: "Employee", value: event.employeeCode ?? "—" },
            { name: "Timestamp", value: event.timestamp },
          ],
        },
      ],
    };
  }
  // generic / email
  return base;
}
