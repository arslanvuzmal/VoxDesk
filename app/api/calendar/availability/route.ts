import { NextRequest, NextResponse } from "next/server";
import { getCalendarProvider } from "@/lib/calendar/factory";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const calendar = getCalendarProvider(body.provider || "DEMO");
    const slots = await calendar.checkAvailability(
      body.service || "Legal Consultation",
      new Date(body.targetDate || Date.now() + 86400000 * 2),
      body.timezone || "America/New_York",
    );

    return NextResponse.json({
      success: true,
      service: body.service || "Legal Consultation",
      slots,
    });
  } catch (error) {
    console.error("Calendar Availability API Error:", error);
    return NextResponse.json(
      { error: "Failed to check calendar availability" },
      { status: 500 },
    );
  }
}
