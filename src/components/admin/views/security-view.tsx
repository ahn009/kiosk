"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Lock,
  Unlock,
  Loader2,
  Ban,
  ListChecks,
  Users,
  Activity,
  Send,
  ChevronLeft,
  ChevronRight,
  Bell,
  Webhook,
  Hash,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import type { AdminRole, AdminUserDTO } from "@/lib/types";
import {
  ViewContainer,
  EmptyState,
  TableSkeleton,
} from "../lib/ui-bits";
import {
  roleBadgeClass,
  roleLabel,
  formatDateTime,
  formatRelative,
  asArray,
} from "../lib/admin-utils";

export function SecurityView() {
  const admin = useAppStore((s) => s.admin);
  const canLockdown =
    admin?.role === "security_officer" || admin?.role === "superadmin";
  const isSuperadmin = admin?.role === "superadmin";

  return (
    <ViewContainer>
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShieldAlert className="size-5 text-primary" />
          Security Center
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Lockdown control · CRL · admin users · admin action log
        </p>
      </div>

      <LockdownControl canControl={canLockdown} />

      <Tabs defaultValue="crl">
        <TabsList className="w-full justify-start overflow-x-auto scrollbar-thin">
          <TabsTrigger value="crl" className="gap-1.5">
            <ListChecks className="size-3.5" />
            Revocation List
          </TabsTrigger>
          {isSuperadmin && (
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="size-3.5" />
              Admin Users
            </TabsTrigger>
          )}
          {canLockdown && (
            <TabsTrigger value="actions" className="gap-1.5">
              <Activity className="size-3.5" />
              Admin Actions
            </TabsTrigger>
          )}
          <TabsTrigger value="alerts" className="gap-1.5">
            <Bell className="size-3.5" />
            Alerts &amp; Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crl" className="mt-4">
          <RevocationList />
        </TabsContent>
        {isSuperadmin && (
          <TabsContent value="users" className="mt-4">
            <AdminUsers />
          </TabsContent>
        )}
        {canLockdown && (
          <TabsContent value="actions" className="mt-4">
            <AdminActions />
          </TabsContent>
        )}
        <TabsContent value="alerts" className="mt-4">
          <WebhookConfig />
        </TabsContent>
      </Tabs>
    </ViewContainer>
  );
}

// ============ Lockdown control ============

function LockdownControl({ canControl }: { canControl: boolean }) {
  const qc = useQueryClient();
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats-security"],
    queryFn: () => apiClient.dashboard.stats(),
    refetchInterval: 15_000,
  });
  const [initiateOpen, setInitiateOpen] = useState(false);
  const [reason, setReason] = useState("");

  const lockdownMutation = useMutation({
    mutationFn: () => apiClient.admin.lockdown(reason || "Manual lockdown by admin"),
    onSuccess: () => {
      toast.success("LOCKDOWN ENGAGED — all kiosks set to lockdown mode");
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats-security"] });
      qc.invalidateQueries({ queryKey: ["kiosks"] });
      qc.invalidateQueries({ queryKey: ["public-status"] });
      setInitiateOpen(false);
      setReason("");
    },
    onError: (e: { error?: string }) =>
      toast.error(e?.error ?? "Failed to engage lockdown"),
  });

  const clearMutation = useMutation({
    mutationFn: () => apiClient.admin.clearLockdown(),
    onSuccess: () => {
      toast.success("Lockdown cleared — kiosks restored to online");
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats-security"] });
      qc.invalidateQueries({ queryKey: ["kiosks"] });
      qc.invalidateQueries({ queryKey: ["public-status"] });
    },
    onError: (e: { error?: string }) =>
      toast.error(e?.error ?? "Failed to clear lockdown"),
  });

  const active = stats?.lockdownActive;

  return (
    <Card
      className={cn(
        "border-2 transition-colors",
        active ? "border-destructive/50 bg-destructive/5" : "border-border",
      )}
    >
      <CardContent className="py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className={cn(
              "size-14 rounded-2xl flex items-center justify-center shrink-0",
              active
                ? "bg-destructive/15 text-destructive"
                : "bg-success/10 text-success",
            )}
          >
            {active ? (
              <Lock className="size-7" />
            ) : (
              <ShieldCheck className="size-7" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold flex items-center gap-2 flex-wrap">
              {active ? (
                <>
                  <span className="text-destructive">LOCKDOWN ACTIVE</span>
                  <Badge variant="destructive" className="text-[10px] animate-pulse">
                    ENGAGED
                  </Badge>
                </>
              ) : (
                <>
                  <span>System Normal</span>
                  <Badge variant="outline" className="bg-success/15 text-success border-success/30 text-[10px]">
                    OPERATIONAL
                  </Badge>
                </>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {active
                ? "All access verification is suspended. Kiosks reject every scan until cleared."
                : "All kiosks are operating normally. Initiate lockdown to suspend all access immediately."}
            </p>
          </div>
          {canControl &&
            (active ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={clearMutation.isPending}>
                    {clearMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Unlock className="size-4" />
                    )}
                    Clear Lockdown
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear lockdown?</AlertDialogTitle>
                    <AlertDialogDescription>
                      All kiosks will be restored to online status. The CRL version
                      will be bumped and synced. Resumes access verification.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={clearMutation.isPending}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => clearMutation.mutate()}
                      disabled={clearMutation.isPending}
                    >
                      <Unlock className="size-4" />
                      Yes, clear lockdown
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="destructive" onClick={() => setInitiateOpen(true)}>
                <Lock className="size-4" />
                Initiate Lockdown
              </Button>
            ))}
        </div>

        {active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-destructive/20 grid sm:grid-cols-2 gap-3 text-xs"
          >
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Lockdown reason
              </p>
              <p className="text-sm font-medium text-destructive mt-0.5">
                See admin action log
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                CRL version
              </p>
              <p className="text-sm font-mono font-medium mt-0.5">
                bumped (syncs to kiosks)
              </p>
            </div>
          </motion.div>
        )}

        {!canControl && (
          <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="size-3.5" />
            You do not have permission to manage lockdown. Contact a security officer or superadmin.
          </p>
        )}
      </CardContent>

      <Dialog open={initiateOpen} onOpenChange={setInitiateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Lock className="size-5" />
              Initiate Lockdown
            </DialogTitle>
            <DialogDescription>
              All kiosks will immediately switch to lockdown mode and reject every scan.
              An admin action will be logged with your identity and timestamp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ld-reason">Reason (optional)</Label>
            <Textarea
              id="ld-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Security incident at warehouse gate"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInitiateOpen(false)}
              disabled={lockdownMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => lockdownMutation.mutate()}
              disabled={lockdownMutation.isPending}
            >
              {lockdownMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              Engage lockdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ============ Revocation list ============

function RevocationList() {
  const { data: raw, isLoading } = useQuery({
    queryKey: ["revocations"],
    queryFn: async () =>
      asArray<{
        tokenHash: string;
        reason: string | null;
        revokedAt: string;
        employeeName: string | null;
        employeeCode: string | null;
      }>(await apiClient.revocations.list()),
  });
  const data = raw ?? [];

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="border-b border-border py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListChecks className="size-4 text-primary" />
          Card Revocation List (CRL)
        </CardTitle>
        <CardDescription>
          {data?.length ?? 0} revoked tokens · synced to all kiosks
        </CardDescription>
      </CardHeader>
      {isLoading ? (
        <div className="p-4">
          <TableSkeleton rows={5} cols={4} />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No revoked cards"
          description="The CRL is empty. All issued card tokens remain valid."
        />
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                <th className="text-left font-medium py-2.5 px-4">Token Hash</th>
                <th className="text-left font-medium py-2.5 px-4">Employee</th>
                <th className="text-left font-medium py-2.5 px-4">Reason</th>
                <th className="text-left font-medium py-2.5 px-4">Revoked</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={`${r.tokenHash}-${i}`} className="border-b border-border/40 hover:bg-accent/30">
                  <td className="py-2.5 px-4">
                    <code className="text-[11px] font-mono break-all">
                      {r.tokenHash.slice(0, 24)}…
                    </code>
                  </td>
                  <td className="py-2.5 px-4">
                    {r.employeeName ? (
                      <div>
                        <p className="text-xs font-medium">{r.employeeName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {r.employeeCode ?? "—"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unknown</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-xs">
                    {r.reason ?? <span className="text-muted-foreground">No reason given</span>}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(r.revokedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ============ Admin users ============

function AdminUsers() {
  const { data: raw, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () =>
      asArray<AdminUserDTO>(await apiClient.admin.users()),
  });
  const data = raw ?? [];

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="border-b border-border py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 text-primary" />
          Admin Users
        </CardTitle>
        <CardDescription>
          {data?.length ?? 0} accounts with admin dashboard access
        </CardDescription>
      </CardHeader>
      {isLoading ? (
        <div className="p-4">
          <TableSkeleton rows={4} cols={3} />
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                <th className="text-left font-medium py-2.5 px-4">Admin</th>
                <th className="text-left font-medium py-2.5 px-4">Email</th>
                <th className="text-left font-medium py-2.5 px-4">Role</th>
                <th className="text-left font-medium py-2.5 px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((u) => (
                <tr key={u.id} className="border-b border-border/40 hover:bg-accent/30">
                  <td className="py-2.5 px-4">
                    <p className="text-xs font-medium">{u.name ?? "Unnamed"}</p>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-xs">{u.email}</td>
                  <td className="py-2.5 px-4">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", roleBadgeClass[u.role as AdminRole])}
                    >
                      {roleLabel[u.role as AdminRole]}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground">
                    {formatRelative(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ============ Admin actions ============

function AdminActions() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-actions", page],
    queryFn: () => apiClient.admin.actions(page),
  });
  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / 25)) : 1;

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader className="border-b border-border py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4 text-primary" />
              Admin Action Log
            </CardTitle>
            <CardDescription>
              {data?.total ?? 0} immutable records · all admin mutations
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {isLoading ? (
        <div className="p-4">
          <TableSkeleton rows={6} cols={4} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No admin actions recorded"
          description="Mutations performed by admins will appear here immutably."
        />
      ) : (
        <div className="divide-y divide-border/40">
          {items.map((a) => (
            <AdminActionRow key={a.id} action={a} />
          ))}
        </div>
      )}
      {data && data.total > 25 && (
        <div className="border-t border-border p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function AdminActionRow({
  action,
}: {
  action: {
    id: string;
    actorName: string | null;
    target: string;
    action: string;
    beforeData: string | null;
    afterData: string | null;
    createdAt: string;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  let before: unknown = null;
  let after: unknown = null;
  try {
    if (action.beforeData) before = JSON.parse(action.beforeData);
    if (action.afterData) after = JSON.parse(action.afterData);
  } catch {
    /* ignore */
  }
  const hasData = Boolean(before || after);

  return (
    <div className="p-4 hover:bg-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] font-mono">
              {action.action}
            </Badge>
            <span className="text-xs text-muted-foreground truncate">
              by <span className="font-medium text-foreground">{action.actorName ?? "unknown"}</span>
            </span>
          </div>
          <p className="text-xs mt-1.5">
            target: <code className="font-mono text-[11px] bg-muted/40 px-1.5 py-0.5 rounded">{action.target}</code>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="size-3" />
            {formatDateTime(action.createdAt)}
          </p>
        </div>
        {hasData && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? "Hide" : "View"}
          </Button>
        )}
      </div>
      {expanded && hasData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 grid sm:grid-cols-2 gap-2"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Before
            </p>
            <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-2 overflow-x-auto scrollbar-thin max-h-48">
              {before ? JSON.stringify(before, null, 2) : "—"}
            </pre>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              After
            </p>
            <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-2 overflow-x-auto scrollbar-thin max-h-48">
              {after ? JSON.stringify(after, null, 2) : "—"}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============ Webhook config ============

function WebhookConfig() {
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState("slack");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["denied", "lockdown"]);
  const [minScore, setMinScore] = useState("0.5");

  function toggleEvent(ev: string) {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev],
    );
  }

  function save() {
    toast.success("Webhook configuration saved (UI only — not persisted to backend)");
  }

  function test() {
    if (!url) {
      toast.error("Enter a webhook URL first");
      return;
    }
    toast.success("Webhook test sent", {
      description: `Sample alert delivered to ${provider}`,
    });
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base">
          <Webhook className="size-4 text-primary" />
          Alert &amp; Webhook Configuration
        </CardTitle>
        <CardDescription>
          Forward security alerts to Slack, Microsoft Teams, or email. (UI demo — no backend persistence in this build.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div>
            <p className="text-sm font-medium">Enable webhook alerts</p>
            <p className="text-xs text-muted-foreground">
              When enabled, configured events trigger outbound HTTP POST.
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="teams">Microsoft Teams</SelectItem>
                <SelectItem value="email">Email (SMTP)</SelectItem>
                <SelectItem value="generic">Generic webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wh-url">Webhook URL / recipient</Label>
            <Input
              id="wh-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                provider === "email"
                  ? "security@acme.io"
                  : "https://hooks.slack.com/services/…"
              }
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Trigger Events</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "granted", label: "Granted" },
              { id: "denied", label: "Denied" },
              { id: "challenge_failed", label: "Challenge Failed" },
              { id: "lockdown", label: "Lockdown" },
              { id: "spoof", label: "Spoof Detected" },
              { id: "kiosk_offline", label: "Kiosk Offline" },
            ].map((ev) => {
              const active = events.includes(ev.id);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => toggleEvent(ev.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md border text-xs font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {ev.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wh-score">Minimum face match score to alert</Label>
          <Input
            id="wh-score"
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="w-32"
          />
          <p className="text-[11px] text-muted-foreground">
            Alerts fire when score &lt; this value.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3 flex items-start gap-2">
          <Hash className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Payload schema: <code className="font-mono">{"{ event, kioskId, employeeCode, score, timestamp, signature }"}</code>.
            HMAC-SHA256 signed with the webhook secret stored on the backend.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={test}>
            <Send className="size-4" />
            Send test alert
          </Button>
          <Button onClick={save}>
            Save configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
