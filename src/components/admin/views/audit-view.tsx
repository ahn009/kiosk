"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileSearch,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  WifiOff,
  Clock,
  UserX,
  Eye,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { apiClient } from "@/lib/api-client";
import type { ScanEventDTO, Decision, KioskDTO } from "@/lib/types";
import { LiveAuditFeed } from "@/components/admin/live-audit-feed";
import {
  ViewContainer,
  EmptyState,
  TableSkeleton,
  ScoreBar,
} from "../lib/ui-bits";
import {
  decisionClass,
  faceMatchStatusClass,
  formatDateTime,
  downloadCsv,
  asArray,
} from "../lib/admin-utils";

const DECISIONS: Decision[] = [
  "granted",
  "denied",
  "challenge_failed",
  "lockdown",
  "error",
  "supervisor_override",
];

export function AuditView() {
  const admin = useAppStore((s) => s.admin);

  const [page, setPage] = useState(1);
  const [kioskFilter, setKioskFilter] = useState<string>("all");
  const [decisionFilter, setDecisionFilter] = useState<string>("all");
  const [employeeSearch, setEmployeeSearch] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [detailEvent, setDetailEvent] = useState<ScanEventDTO | null>(null);

  const { data: kiosksRaw } = useQuery({
    queryKey: ["kiosks-list"],
    queryFn: async () =>
      asArray<KioskDTO>(await apiClient.kiosks.list()),
  });
  const kiosks = kiosksRaw ?? [];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "audit-scans",
      page,
      kioskFilter,
      decisionFilter,
      employeeSearch,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      apiClient.audit.scans({
        kiosk_id: kioskFilter === "all" ? undefined : kioskFilter,
        decision: decisionFilter === "all" ? undefined : decisionFilter,
        from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        to: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : undefined,
        page,
      }),
    placeholderData: (prev) => prev,
  });

  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / 25)) : 1;

  function resetFilters() {
    setKioskFilter("all");
    setDecisionFilter("all");
    setEmployeeSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function exportCsv() {
    if (items.length === 0) {
      toast.error("No records to export");
      return;
    }
    const rows = items.map((e) => ({
      id: e.id,
      time: e.createdAt,
      kiosk: e.kioskId,
      employee_name: e.employeeName ?? "",
      employee_code: e.employeeCode ?? "",
      decision: e.decision,
      face_match_status: e.faceMatchStatus ?? "",
      face_match_score: e.faceMatchScore ?? "",
      latency_ms: e.latencyMs ?? "",
      offline: e.offline ? "true" : "false",
      spoof_flags: e.spoofFlags ? JSON.stringify(e.spoofFlags) : "",
      snapshot: e.snapshotPath ?? "",
      token_hash: e.tokenHash ?? "",
    }));
    downloadCsv(`audit-scans-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    toast.success(`Exported ${rows.length} records to CSV`);
  }

  const activeFilters =
    kioskFilter !== "all" ||
    decisionFilter !== "all" ||
    employeeSearch ||
    dateFrom ||
    dateTo;

  return (
    <ViewContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileSearch className="size-5 text-primary" />
            Audit Trail
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Immutable log of every scan event · {data?.total ?? 0} records matching filters
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={items.length === 0}>
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <Label className="text-[11px] text-muted-foreground">Employee search</Label>
            <Input
              placeholder="Name or code…"
              value={employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value);
                setPage(1);
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Kiosk</Label>
            <Select
              value={kioskFilter}
              onValueChange={(v) => {
                setKioskFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="All kiosks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All kiosks</SelectItem>
                {kiosks?.map((k) => (
                  <SelectItem key={k.id} value={k.kioskId}>
                    {k.kioskId} · {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Decision</Label>
            <Select
              value={decisionFilter}
              onValueChange={(v) => {
                setDecisionFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="All decisions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All decisions</SelectItem>
                {DECISIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="mt-1"
            />
          </div>
        </div>
        {activeFilters && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Filter className="size-3.5" />
              Filters active
            </p>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="size-3.5" />
              Clear
            </Button>
          </div>
        )}
      </Card>

      {/* Results table + live feed */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={10} cols={7} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No scan events found"
            description="Adjust your filters or time range to find records. The audit trail retains every scan event immutably."
            action={
              activeFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                  <th className="text-left font-medium py-3 px-4 whitespace-nowrap">Time</th>
                  <th className="text-left font-medium py-3 px-4 whitespace-nowrap">Kiosk</th>
                  <th className="text-left font-medium py-3 px-4 whitespace-nowrap">Employee</th>
                  <th className="text-left font-medium py-3 px-4">Decision</th>
                  <th className="text-left font-medium py-3 px-4">Face</th>
                  <th className="text-left font-medium py-3 px-4">Score</th>
                  <th className="text-left font-medium py-3 px-4 whitespace-nowrap">Latency</th>
                  <th className="text-left font-medium py-3 px-4">Flags</th>
                </tr>
              </thead>
              <tbody>
                {items.map((ev) => {
                  const hasSpoof = ev.spoofFlags && Object.keys(ev.spoofFlags).length > 0;
                  return (
                    <tr
                      key={ev.id}
                      className="border-b border-border/40 hover:bg-accent/30 cursor-pointer transition-colors"
                      onClick={() => setDetailEvent(ev)}
                    >
                      <td className="py-2.5 px-4 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatDateTime(ev.createdAt)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs whitespace-nowrap">{ev.kioskId}</td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {ev.employeeName ? (
                          <div>
                            <div className="text-xs font-medium">{ev.employeeName}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              {ev.employeeCode}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <UserX className="size-3" />
                            Unknown
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", decisionClass[ev.decision])}
                        >
                          {ev.decision.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4">
                        {ev.faceMatchStatus ? (
                          <Badge
                            variant="outline"
                            className={cn("text-[10px]", faceMatchStatusClass[ev.faceMatchStatus])}
                          >
                            {ev.faceMatchStatus.replace("_", " ")}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        {ev.faceMatchScore != null ? (
                          <div className="flex items-center gap-2">
                            <ScoreBar value={ev.faceMatchScore} className="w-14" />
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {ev.faceMatchScore.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                        {ev.latencyMs != null ? `${ev.latencyMs}ms` : "—"}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1">
                          {ev.offline && (
                            <span
                              title="Offline scan"
                              className="inline-flex items-center justify-center size-5 rounded bg-warning/15 text-warning-foreground"
                            >
                              <WifiOff className="size-3" />
                            </span>
                          )}
                          {hasSpoof && (
                            <span
                              title="Spoof flags detected"
                              className="inline-flex items-center justify-center size-5 rounded bg-destructive/15 text-destructive"
                            >
                              <ShieldAlert className="size-3" />
                            </span>
                          )}
                          {!ev.offline && !hasSpoof && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

        {/* Live audit stream */}
        <LiveAuditFeed />
      </div>

      {/* Pagination */}
      {data && data.total > 25 && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {data.total} total
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <EventDetailSheet event={detailEvent} onClose={() => setDetailEvent(null)} canViewSnapshot={!!admin} />
    </ViewContainer>
  );
}

// ============ Event detail sheet ============

function EventDetailSheet({
  event,
  onClose,
  canViewSnapshot,
}: {
  event: ScanEventDTO | null;
  onClose: () => void;
  canViewSnapshot: boolean;
}) {
  return (
    <Sheet open={!!event} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto scrollbar-thin">
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Eye className="size-4 text-primary" />
            Scan Event #{event?.id}
          </SheetTitle>
          <SheetDescription>
            {event ? formatDateTime(event.createdAt) : ""}
          </SheetDescription>
        </SheetHeader>
        {event && (
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs", decisionClass[event.decision])}
              >
                {event.decision.replace("_", " ")}
              </Badge>
              {event.faceMatchStatus && (
                <Badge
                  variant="outline"
                  className={cn("text-xs", faceMatchStatusClass[event.faceMatchStatus])}
                >
                  face: {event.faceMatchStatus.replace("_", " ")}
                </Badge>
              )}
              {event.offline && (
                <Badge variant="outline" className="bg-warning/15 text-warning-foreground border-warning/40 text-xs">
                  <WifiOff className="size-3" />
                  offline
                </Badge>
              )}
            </div>

            {/* Snapshot */}
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Snapshot
              </p>
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border bg-grid">
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <div>
                    <Eye className="size-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {event.snapshotPath ?? "no path"}
                    </p>
                  </div>
                </div>
                {canViewSnapshot && (
                  <div className="absolute inset-0 flex items-center justify-center bg-destructive/5 pointer-events-none">
                    <div className="rotate-[-12deg] text-[10px] font-bold text-destructive/30 tracking-widest border-2 border-destructive/30 px-3 py-1 rounded">
                      CONFIDENTIAL
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Score & latency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Match Score
                </p>
                <p className="text-lg font-bold tabular-nums mt-1">
                  {event.faceMatchScore != null ? event.faceMatchScore.toFixed(3) : "—"}
                </p>
                {event.faceMatchScore != null && (
                  <ScoreBar value={event.faceMatchScore} className="mt-2" />
                )}
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  Latency
                </p>
                <p className="text-lg font-bold tabular-nums mt-1">
                  {event.latencyMs != null ? `${event.latencyMs}ms` : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {event.offline ? "Synced later" : "Real-time"}
                </p>
              </div>
            </div>

            {/* Employee */}
            <div className="rounded-lg border border-border p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Employee
              </p>
              {event.employeeName ? (
                <div className="text-sm">
                  <p className="font-medium">{event.employeeName}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {event.employeeCode ?? "—"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <UserX className="size-4" />
                  Unknown (token not recognized)
                </p>
              )}
            </div>

            {/* Kiosk */}
            <div className="rounded-lg border border-border p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Kiosk
              </p>
              <p className="font-mono text-sm">{event.kioskId}</p>
            </div>

            {/* Token hash */}
            {event.tokenHash && (
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Card Token Hash
                </p>
                <code className="text-[11px] font-mono break-all">
                  {event.tokenHash}
                </code>
              </div>
            )}

            {/* Spoof flags */}
            {event.spoofFlags && Object.keys(event.spoofFlags).length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-destructive mb-2 flex items-center gap-1">
                  <ShieldAlert className="size-3" />
                  Spoof / Liveness Flags
                </p>
                <pre className="text-[11px] font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(event.spoofFlags, null, 2)}
                </pre>
              </div>
            )}

            {/* Snapshot path */}
            {event.snapshotPath && (
              <div className="rounded-lg border border-border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                  Snapshot Path
                </p>
                <code className="text-[11px] font-mono break-all">{event.snapshotPath}</code>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
