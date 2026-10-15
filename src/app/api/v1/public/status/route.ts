import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public system status (launcher, pre-auth). Returns lockdown flag + org info.
export async function GET() {
  const state = await db.systemState.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    lockdownActive: state?.lockdownActive ?? false,
    lockdownReason: state?.lockdownReason ?? null,
    orgCode: state?.orgCode ?? "ACME",
    orgName: state?.orgName ?? "Acme Corporation",
  });
}
