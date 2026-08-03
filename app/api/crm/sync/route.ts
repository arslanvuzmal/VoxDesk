import { NextRequest, NextResponse } from "next/server";
import { getCRMProvider } from "@/lib/crm/factory";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const crm = getCRMProvider(body.provider || "DEMO");

    const contact = await crm.createContact({
      name: body.callerName || "Sarah Miller",
      phone: body.callerPhone || "+15550192834",
      email: body.callerEmail || "sarah.miller@example.com",
      company: body.company || "Miller Miller LLP",
    });

    const activityId = await crm.createActivity({
      contactId: contact.id,
      activityType: body.activityType || "APPOINTMENT_BOOKED",
      summary:
        body.summary ||
        "Call handling completed and appointment scheduled for Tuesday 2:00 PM EST.",
      details: body.details || { score: 85, category: "HOT" },
    });

    return NextResponse.json({
      success: true,
      contact,
      activityId,
      message: "CRM record synchronized",
    });
  } catch (error) {
    console.error("CRM Sync API Error:", error);
    return NextResponse.json(
      { error: "Failed to sync CRM activity" },
      { status: 500 },
    );
  }
}
