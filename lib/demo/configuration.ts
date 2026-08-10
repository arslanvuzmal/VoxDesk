export type DemoPresetKey = 'LEGAL';
export type DemoLanguage = 'en-US';
export type DemoScenario = 'BOOKING' | 'QUALIFICATION' | 'ESCALATION' | 'ROUTINE';
export type DemoChannel = 'WEB_VOICE';

export interface DemoConfiguration {
  presetKey: DemoPresetKey;
  language: DemoLanguage;
  scenario: DemoScenario;
  channel: DemoChannel;
  businessName: string;
  agentDisplayName: string;
}

export const DEFAULT_DEMO_CONFIGURATION: DemoConfiguration = {
  presetKey: 'LEGAL',
  language: 'en-US',
  scenario: 'QUALIFICATION',
  channel: 'WEB_VOICE',
  businessName: 'Northstar Legal Consultations',
  agentDisplayName: 'Maya',
};

