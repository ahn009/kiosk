"use client";

import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  Users,
  ScanFace,
  FileSearch,
  Cpu,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Sun,
  Moon,
  Lock,
  Unlock,
  Zap,
  Activity,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandAction {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  keywords: string[];
  shortcut?: string;
  run: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const setSection = useAppStore((s) => s.setAdminSection);
  const setMode = useAppStore((s) => s.setMode);
  const logout = useAppStore((s) => s.logout);
  const { theme, setTheme } = useTheme();

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navActions: CommandAction[] = [
    {
      id: "nav-dashboard",
      label: "Dashboard",
      group: "Navigate",
      icon: LayoutDashboard,
      keywords: ["home", "overview", "stats"],
      run: () => setSection("dashboard"),
    },
    {
      id: "nav-employees",
      label: "Employees",
      group: "Navigate",
      icon: Users,
      keywords: ["staff", "card", "access"],
      run: () => setSection("employees"),
    },
    {
      id: "nav-enrollment",
      label: "Enrollment",
      group: "Navigate",
      icon: ScanFace,
      keywords: ["face", "biometric", "capture"],
      run: () => setSection("enrollment"),
    },
    {
      id: "nav-audit",
      label: "Audit Trail",
      group: "Navigate",
      icon: FileSearch,
      keywords: ["scan", "log", "history", "events"],
      run: () => setSection("audit"),
    },
    {
      id: "nav-kiosks",
      label: "Kiosks",
      group: "Navigate",
      icon: Cpu,
      keywords: ["device", "status", "threshold"],
      run: () => setSection("kiosks"),
    },
    {
      id: "nav-calibration",
      label: "Calibration",
      group: "Navigate",
      icon: Gauge,
      keywords: ["roc", "far", "frr", "threshold", "tune"],
      run: () => setSection("calibration"),
    },
    {
      id: "nav-security",
      label: "Security Center",
      group: "Navigate",
      icon: ShieldAlert,
      keywords: ["lockdown", "crl", "revocation", "webhook"],
      run: () => setSection("security"),
    },
  ];

  const quickActions: CommandAction[] = [
    {
      id: "act-lockdown",
      label: "Go to Lockdown control",
      group: "Actions",
      icon: Lock,
      keywords: ["emergency", "lockdown", "lock"],
      run: () => setSection("security"),
    },
    {
      id: "act-theme",
      label: "Toggle dark / light theme",
      group: "Actions",
      icon: theme === "dark" ? Sun : Moon,
      keywords: ["theme", "dark", "light", "mode"],
      run: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      id: "act-launcher",
      label: "Back to Launcher",
      group: "Actions",
      icon: ArrowLeft,
      keywords: ["exit", "home", "launcher"],
      run: () => setMode("launcher"),
    },
    {
      id: "act-logout",
      label: "Sign out",
      group: "Actions",
      icon: ShieldCheck,
      keywords: ["logout", "sign out", "exit"],
      run: () => logout(),
    },
  ];

  const allActions = [...navActions, ...quickActions];

  function runAction(action: CommandAction) {
    action.run();
    setOpen(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search sections…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {navActions.map((a) => (
            <CommandItem
              key={a.id}
              value={`${a.label} ${a.keywords.join(" ")}`}
              onSelect={() => runAction(a)}
              className="gap-2"
            >
              <a.icon className="size-4 text-muted-foreground" />
              <span>{a.label}</span>
              {a.shortcut && (
                <span className="ml-auto text-[10px] text-muted-foreground font-mono">
                  {a.shortcut}
                </span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          {quickActions.map((a) => (
            <CommandItem
              key={a.id}
              value={`${a.label} ${a.keywords.join(" ")}`}
              onSelect={() => runAction(a)}
              className="gap-2"
            >
              <a.icon className="size-4 text-muted-foreground" />
              <span>{a.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tips">
          <CommandItem disabled className="gap-2 opacity-70">
            <Zap className="size-4 text-primary" />
            <span className="text-xs">Press </span>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[9px]">⌘K</kbd>
            <span className="text-xs">anywhere to open this palette</span>
          </CommandItem>
          <CommandItem disabled className="gap-2 opacity-70">
            <Activity className="size-4 text-primary" />
            <span className="text-xs">Real-time alerts stream to the bell</span>
            <Bell className="size-3 text-muted-foreground ml-auto" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
