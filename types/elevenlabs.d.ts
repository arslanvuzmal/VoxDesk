declare module '@elevenlabs/elevenlabs-js' {
  export class ElevenLabsClient {
    constructor(options: { apiKey: string });
    conversationalAi: {
      agents: {
        get: (agentId: string) => Promise<any>;
        create: (options: any) => Promise<any>;
        update: (agentId: string, options: any) => Promise<any>;
      };
      conversations: {
        getWebrtcToken: (options: { agentId: string }) => Promise<{ token: string }>;
      };
    };
  }
}
