import { retiredEndpoint } from '@/lib/http/retired-endpoint';

/**
 * The former generic voice webhook trusted a caller-selected provider header.
 * Provider events now enter only through provider-specific verified endpoints.
 */
export async function POST(): Promise<Response> {
  return retiredEndpoint('/api/webhooks/telnyx/voice');
}
