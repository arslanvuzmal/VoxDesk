import { retiredEndpoint } from '@/lib/http/retired-endpoint';

export async function POST(): Promise<Response> {
  return retiredEndpoint('/api/webhooks/elevenlabs/post-call');
}
