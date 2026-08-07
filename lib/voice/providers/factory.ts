import { VoiceProvider } from './interface';
import { DemoVoiceProvider } from './demo-provider';
import { TwilioVoiceProvider } from './twilio-provider';
import { VapiVoiceProvider } from './vapi-provider';
import { RetellVoiceProvider } from './retell-provider';
import { LiveKitVoiceProvider } from './livekit-provider';

export function getVoiceProvider(providerType: string = 'DEMO'): VoiceProvider {
  switch (providerType.toUpperCase()) {
    case 'TWILIO':
      return new TwilioVoiceProvider();
    case 'VAPI':
      return new VapiVoiceProvider();
    case 'RETELL':
      return new RetellVoiceProvider();
    case 'LIVEKIT':
      return new LiveKitVoiceProvider();
    case 'DEMO':
    default:
      return new DemoVoiceProvider();
  }
}
