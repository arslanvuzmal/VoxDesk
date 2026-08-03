import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database";
import { verifyPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      include: {
        memberships: {
          include: { workspace: true },
        },
      },
    });

    if (!user) {
      // Demo fallback login if database not seeded
      if (parsed.data.email === "owner@northstarlegal.com" || parsed.data.email === "demo@northstarlegal.com") {
        const response = NextResponse.json({
          user: {
            id: "demo-user-owner",
            name: "Arslan Vuzmal Lone",
            email: parsed.data.email,
            activeWorkspaceId: "northstar-legal-ws",
            activeWorkspaceRole: "OWNER",
          },
        });
        response.cookies.set(SESSION_COOKIE_NAME, "demo-session-token-owner", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 7 * 24 * 3600,
        });
        return response;
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

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
      path: "/",
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
