import 'server-only';

import type { TelephonyProvider } from '@/lib/telephony/contracts';
import { assertLiveTelephonyConfiguration, getTelephonyMode } from '@/lib/telephony/mode';
import { SimulationTelephonyProvider } from './simulation';
import { TelnyxProvider } from './telnyx';

export function getTelephonyProvider(): TelephonyProvider {
  if (getTelephonyMode() === 'simulation') return new SimulationTelephonyProvider();
  assertLiveTelephonyConfiguration();
  return new TelnyxProvider();
}
