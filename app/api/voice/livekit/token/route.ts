import { retiredEndpoint } from '@/lib/http/retired-endpoint';

export async function POST() {
  return retiredEndpoint('the canonical ElevenLabs conversation bootstrap');
}
