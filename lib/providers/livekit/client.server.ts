import 'server-only';
import { AccessToken } from 'livekit-server-sdk';

export interface LiveKitTokenOptions {
  roomName: string;
  participantName: string;
  identity?: string;
  metadata?: Record<string, any>;
}

export function isLiveKitConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_SECRET || process.env.LIVEKIT_URL
  );
}

export async function generateLiveKitRoomToken(options: LiveKitTokenOptions): Promise<{
  token: string;
  serverUrl: string;
  roomName: string;
  identity: string;
}> {
  const apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
  const apiSecret = process.env.LIVEKIT_API_SECRET || 'secretsecretsecretsecretsecretsecret';
  const serverUrl = process.env.LIVEKIT_URL || 'wss://demo-livekit.voxdesk.ai';

  const identity =
    options.identity || `user_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: options.participantName,
    ttl: '1h',
    metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
  });

  at.addGrant({
    roomJoin: true,
    room: options.roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();

  return {
    token,
    serverUrl,
    roomName: options.roomName,
    identity,
  };
}
