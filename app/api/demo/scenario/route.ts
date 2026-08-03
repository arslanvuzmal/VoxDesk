import { NextRequest, NextResponse } from "next/server";
import { DEMO_SCENARIOS } from "@/lib/demo/scenarios";

export async function GET(req: NextRequest) {
  const scenarioId = req.nextUrl.searchParams.get("id");

  if (!scenarioId) {
    return NextResponse.json({ scenarios: DEMO_SCENARIOS });
  }

  const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId) || DEMO_SCENARIOS[0];
  return NextResponse.json({ scenario });
}
