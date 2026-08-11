import { describe, expect, it } from 'vitest';
import { getTelephonyCapabilityMatrix } from '@/lib/telephony/capability-matrix';
import {
  assertLiveTelephonyConfiguration,
  getTelephonyMode,
  TelephonyConfigurationError,
} from '@/lib/telephony/mode';
import { SimulationTelephonyProvider } from '@/lib/telephony/providers/simulation';
import { getTelephonyProvider } from '@/lib/telephony/providers/factory';
import { TelnyxProvider } from '@/lib/telephony/providers/telnyx';

describe('telephony simulation mode', () => {
  it('defaults to simulation rather than attempting a carrier call', () => {
    expect(getTelephonyMode(undefined)).toBe('simulation');
  });

  it('reports simulation ready without paid Telnyx resources when persistence is configured', () => {
    const matrix = getTelephonyCapabilityMatrix({
      DATABASE_URL: 'postgresql://demo:demo@localhost:5432/voxdesk',
      TELEPHONY_MODE: 'simulation',
    });
    expect(matrix.readiness).toBe('SIMULATION_READY');
    expect(matrix.simulation.demoAvailable).toBe(true);
    expect(matrix.livePstn.status).toBe('REQUIRES_ACTIVATION');
  });

  it('distinguishes provider configuration from live readiness', () => {
    const matrix = getTelephonyCapabilityMatrix({
      DATABASE_URL: 'postgresql://demo:demo@localhost:5432/voxdesk',
      TELEPHONY_MODE: 'simulation',
      TELNYX_API_KEY: 'configured',
      TELNYX_CONNECTION_ID: 'connection',
    });
    expect(matrix.readiness).toBe('SIMULATION_READY');
    expect(matrix.livePstn.configured).toBe(true);
    expect(matrix.activationRequirements).toContain('TELNYX_PRIMARY_PHONE_NUMBER');
  });

  it('uses clearly prefixed, non-provider identifiers in the simulator', async () => {
    const provider = new SimulationTelephonyProvider();
    const call = await provider.startCall({
      workspaceId: 'workspace',
      businessId: 'business',
      agentId: 'agent',
      agentVersionId: 'agent-version',
      callerNumber: 'SIMULATED_CALLER',
      direction: 'OUTBOUND',
      channel: 'PHONE',
      language: 'en-US',
      trainingPackVersion: 1,
    });
    expect(call.provider).toBe('SIMULATION');
    expect(call.providerCallControlId).toMatch(/^sim_call_/);
    expect(call.providerCallSessionId).toMatch(/^sim_session_/);
  });

  it('selects the simulation provider by default', () => {
    const previous = process.env.TELEPHONY_MODE;
    delete process.env.TELEPHONY_MODE;
    expect(getTelephonyProvider()).toBeInstanceOf(SimulationTelephonyProvider);
    if (previous === undefined) delete process.env.TELEPHONY_MODE;
    else process.env.TELEPHONY_MODE = previous;
  });

  it('selects Telnyx only when live mode is explicit', () => {
    const values = {
      TELEPHONY_MODE: 'live',
      DATABASE_URL: 'postgresql://demo:demo@localhost:5432/voxdesk',
      APP_URL: 'https://example.test',
      ELEVENLABS_API_KEY: 'key',
      ELEVENLABS_AGENT_ID: 'agent',
      TELNYX_API_KEY: 'key',
      TELNYX_PUBLIC_KEY: 'public-key',
      TELNYX_CONNECTION_ID: 'connection',
      TELNYX_PRIMARY_PHONE_NUMBER: '+15555550123',
      TELNYX_OUTBOUND_VOICE_PROFILE_ID: 'profile',
    };
    const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
    Object.assign(process.env, values);
    expect(getTelephonyProvider()).toBeInstanceOf(TelnyxProvider);
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('does not accept simulated events through a public webhook contract', async () => {
    await expect(new SimulationTelephonyProvider().verifyWebhook({}, '{}')).resolves.toBe(false);
  });

  it('fails closed when a live call is requested in simulation mode', () => {
    const previous = process.env.TELEPHONY_MODE;
    process.env.TELEPHONY_MODE = 'simulation';
    expect(() => assertLiveTelephonyConfiguration()).toThrow(TelephonyConfigurationError);
    process.env.TELEPHONY_MODE = previous;
  });
});
