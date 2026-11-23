import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporary diagnostic: reports whether server-side session lookup works (no user data returned).
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return NextResponse.json({ ok: true, hasSession: Boolean(session) });
  } catch (err) {
    const e = err as { name?: string; message?: string; status?: string | number; body?: unknown };
    return NextResponse.json({ ok: false, name: e?.name, message: e?.message, status: e?.status, body: e?.body });
  }
}
