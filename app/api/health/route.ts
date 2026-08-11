import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    service: 'voxdesk',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  });
}
