import { NextResponse } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Exchanges a valid Better Auth session (http-only cookie) for a short-lived
 * JWT that the Express API verifies with the shared JWT_SECRET.
 */
export async function GET() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  if (session.user.isBlocked) return NextResponse.json({ message: "Account blocked" }, { status: 403 });

  const expiresIn = 60 * 60; // 1 hour
  const token = jwt.sign(
    { id: session.user.id, email: session.user.email, role: session.user.role },
    secret,
    { algorithm: "HS256", expiresIn }
  );

  return NextResponse.json(
    { token, expiresAt: Date.now() + expiresIn * 1000 },
    { headers: { "Cache-Control": "no-store" } }
  );
}
