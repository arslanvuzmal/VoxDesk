import { NextRequest, NextResponse } from "next/server";
import { DEMO_SCENARIOS } from "@/lib/demo/scenarios";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const statusFilter = searchParams.get("status");

  // Synthetic database-backed call record list for demo mode
  const calls = [
    {
      id: "call-demo-001",
      workspaceId: "northstar-legal-ws",
      agentName: "Maya — Reception",
      direction: "INBOUND",
      callerNumberMasked: "+1 (555) 019-2834",
      callerName: "Sarah Miller",
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      durationSeconds: 120,
      outcome: "APPOINTMENT_SCHEDULED",
      qualificationCategory: "HOT",
      qualificationScore: 85.0,
      estimatedCost: 0.08,
    },
    {
      id: "call-demo-002",
      workspaceId: "northstar-legal-ws",
      agentName: "Alex — Lead Qual",
      direction: "INBOUND",
      callerNumberMasked: "+1 (555) 014-9921",
      callerName: "Daniel Brooks",
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 7200 * 1000).toISOString(),
      durationSeconds: 95,
      outcome: "APPOINTMENT_RESCHEDULED",
      qualificationCategory: "WARM",
      qualificationScore: 65.0,
      estimatedCost: 0.06,
    },
    {
      id: "call-demo-003",
      workspaceId: "northstar-legal-ws",
      agentName: "Maya — Reception",
      direction: "INBOUND",
      callerNumberMasked: "+1 (555) 018-4490",
      callerName: "Priya Shah",
      status: "COMPLETED",
      startedAt: new Date(Date.now() - 14400 * 1000).toISOString(),
      durationSeconds: 150,
      outcome: "LEAD_QUALIFIED",
      qualificationCategory: "HOT",
      qualificationScore: 92.0,
      estimatedCost: 0.12,
    },
    {
      id: "call-demo-004",
      workspaceId: "northstar-legal-ws",
      agentName: "Maya — Reception",
      direction: "INBOUND",
      callerNumberMasked: "+1 (555) 012-7788",
      callerName: "Michael Chen",
      status: "TRANSFERRED",
      startedAt: new Date(Date.now() - 28800 * 1000).toISOString(),
      durationSeconds: 45,
      outcome: "ESCALATED_HUMAN",
      qualificationCategory: "REVIEW",
      qualificationScore: 40.0,
      estimatedCost: 0.04,
    },
  ];

  const filtered = statusFilter
    ? calls.filter((c) => c.status === statusFilter)
    : calls;

  return NextResponse.json({
    calls: filtered,
    total: filtered.length,
  });
}
