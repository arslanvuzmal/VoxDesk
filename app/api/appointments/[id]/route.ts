import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    let appointment: any = null;
    try {
      appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          call: {
            include: {
              summary: true,
              lead: true,
            },
          },
        },
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: "DATABASE_UNAVAILABLE",
          message: "Appointment detail data is temporarily unavailable.",
        },
        { status: 503 },
      );
    }

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          code: "APPOINTMENT_NOT_FOUND",
          message: `Appointment record '${id}' was not found.`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: error?.message || "Failed to fetch appointment detail",
      },
      { status: 500 },
    );
  }
}
