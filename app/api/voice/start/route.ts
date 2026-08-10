import { retiredEndpoint } from '@/lib/http/retired-endpoint';

export async function POST() {
  return retiredEndpoint('/api/voice/conversation/start');
}

