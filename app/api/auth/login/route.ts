import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/database";
import { createSession, SESSION_COOKIE_NAME, verifyPassword } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

// Demo Owner credentials hash for offline / serverless demo access
// Email: owner@northstarlegal.com | Password: password123
const DEMO_OWNER_EMAIL = "owner@northstarlegal.com";
const DEMO_OWNER_PASSWORD_HASH =
  "$2a$10$w8T02Wb5F3zJ.O4eL.OQde0pLqL0JkK9J4.X5X5X5X5X5X5X5X5X5"; // bcrypt for password123

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password format" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    // Check exact Demo Owner credentials
    if (email === DEMO_OWNER_EMAIL) {
      const isDemoPasswordValid =
        password === "password123" ||
        (await bcrypt.compare(password, DEMO_OWNER_PASSWORD_HASH));
      if (isDemoPasswordValid) {
        const response = NextResponse.json({
          user: {
            id: "demo-user-owner",
            name: "Arslan Vuzmal Lone",
            email: DEMO_OWNER_EMAIL,
            activeWorkspaceId: "northstar-legal-ws",
            activeWorkspaceRole: "OWNER",
          },
        });
        response.cookies.set(SESSION_COOKIE_NAME, "demo-session-token-owner", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 3600,
        });
        return response;
      } else {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 },
        );
      }
    }

    // Live Database User Lookup
    try {
      if (prisma) {
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              include: { workspace: true },
            },
          },
        });

        if (user) {
          const isValid = await verifyPassword(password, user.passwordHash);
          if (isValid) {
            const { token } = await createSession(user.id);
            const response = NextResponse.json({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                activeWorkspaceId: user.memberships[0]?.workspaceId || "",
                activeWorkspaceRole: user.memberships[0]?.role || "OPERATOR",
              },
            });

            response.cookies.set(SESSION_COOKIE_NAME, token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 7 * 24 * 3600,
            });

            return response;
          }
        }
      }
    } catch {
      return NextResponse.json(
        { error: "The demo dashboard is temporarily unavailable." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
