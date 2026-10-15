"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldAlert, Delete, Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/** Demo supervisor PIN — any 6 digits, but 123456 lights green. */
const DEMO_PIN = "123456";

export function SupervisorOverride({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  // Reset state when the dialog is dismissed — done via the open-change
  // handler (below) rather than synchronously in an effect, so we don't
  // trigger cascading renders.
  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) {
        setPin("");
        setShake(false);
      }
      onOpenChange(v);
    },
    [onOpenChange],
  );

  const submit = useCallback(() => {
    if (pin === DEMO_PIN) {
      onConfirm();
    } else {
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
    }
  }, [pin, onConfirm]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border-amber-500/40 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="size-5" /> Supervisor Override
          </DialogTitle>
          <DialogDescription>
            Authenticate to grant entry without a face match. This event is
            flagged <span className="font-mono">supervisor_override</span> in
            the audit log.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          animate={shake ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center gap-4 py-2"
        >
          <div className="size-14 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Lock className="size-6" />
          </div>

          <InputOTP
            maxLength={6}
            value={pin}
            onChange={(v) => setPin(v)}
            onComplete={() => undefined}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <p className="text-[11px] text-muted-foreground text-center">
            Demo PIN is{" "}
            <code className="font-mono px-1 py-0.5 rounded bg-muted">
              {DEMO_PIN}
            </code>
            <span className="block mt-0.5">
              Tap keys on the on-screen pad or type on your keyboard.
            </span>
          </p>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] mt-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="lg"
                className="h-14 text-xl font-mono"
                onClick={() => setPin((p) => (p.length >= 6 ? p : p + n))}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="lg"
              className="h-14"
              onClick={() => setPin((p) => p.slice(0, -1))}
            >
              <Delete className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 text-xl font-mono"
              onClick={() => setPin((p) => (p.length >= 6 ? p : p + "0"))}
            >
              0
            </Button>
            <Button
              size="lg"
              className="h-14 bg-amber-500 hover:bg-amber-600 text-amber-950"
              disabled={pin.length !== 6}
              onClick={submit}
            >
              <Check className="size-5" />
            </Button>
          </div>

          <div className="flex gap-2 mt-3 w-full">
            <Button variant="ghost" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          <AnimatePresence>
            {shake && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-destructive text-xs"
              >
                Incorrect PIN — try again.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
