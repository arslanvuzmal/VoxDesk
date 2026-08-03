import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database";
import { hashPassword, createSession, SESSION_COOKIE_NAME } from "@/lib/auth";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  workspaceName: z.string().min(2),
  industry: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid registration details" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const slug =
      parsed.data.workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Math.random().toString(36).substring(7);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        memberships: {
          create: {
            role: "OWNER",
            workspace: {
              create: {
                name: parsed.data.workspaceName,
                slug,
                industry: parsed.data.industry || "General Business",
                businessProfile: {
                  create: {
                    businessName: parsed.data.workspaceName,
                    description: `${parsed.data.workspaceName} voice agent operations workspace.`,
                  },
                },
              },
            },
          },
        },
      },
      include: {
        memberships: true,
      },
    });

    const workspaceId = user.memberships[0].workspaceId;
    const { token } = await createSession(user.id, workspaceId);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        activeWorkspaceId: workspaceId,
        activeWorkspaceRole: "OWNER",
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
    console.error("Register API Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
