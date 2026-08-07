import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, callId } = body;

    let responseMessage = 'Event processed';
    let newState = 'IN_PROGRESS';

    switch (action) {
      case 'barge_in':
        responseMessage = 'Agent paused due to caller barge-in interruption';
        newState = 'LISTENING';
        break;
      case 'silence':
        responseMessage = 'Long silence detected; agent prompting caller for clarification';
        newState = 'PROMPTING';
        break;
      case 'transfer':
        responseMessage = 'Human operator transfer initiated';
        newState = 'TRANSFERRED';
        break;
      case 'complete':
        responseMessage = 'Call session completed';
        newState = 'COMPLETED';
        break;
      default:
        break;
    }

    return NextResponse.json({
      success: true,
      callId,
      action,
      newState,
      message: responseMessage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Voice Event API Error:', error);
    return NextResponse.json({ error: 'Failed to process call event' }, { status: 500 });
  }
}
