export interface EnvVarSpec {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
  sensitive: boolean;
}

export const ENV_SPECS: EnvVarSpec[] = [
  {
    name: 'APP_URL',
    required: true,
    description: 'Application base URL',
    sensitive: false,
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Public application base URL',
    sensitive: false,
  },
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string',
    sensitive: true,
  },
  {
    name: 'DIRECT_URL',
    required: false,
    description: 'Optional direct PostgreSQL connection string for migration workflows',
    sensitive: true,
  },
  {
    name: 'AUTH_SECRET',
    required: true,
    description: 'Session signing secret (min 32 chars)',
    validator: v => v.length >= 32,
    sensitive: true,
  },
  {
    name: 'ENCRYPTION_KEY',
    required: true,
    description: 'Data encryption key (64 hexadecimal characters)',
    validator: v => /^[a-fA-F0-9]{64}$/.test(v),
    sensitive: true,
  },
  {
    name: 'INTERNAL_API_SECRET',
    required: true,
    description: 'Internal service-to-service API secret',
    sensitive: true,
  },
  {
    name: 'DEMO_SESSION_SECRET',
    required: true,
    description: 'Demo session token signing secret',
    validator: v => v.length >= 32,
    sensitive: true,
  },
  {
    name: 'IP_HASH_SECRET',
    required: true,
    description: 'IP hashing secret for demo rate limiting',
    sensitive: true,
  },
  {
    name: 'PHONE_HASH_SECRET',
    required: true,
    description: 'HMAC secret for searchable phone identifiers',
    validator: v => v.length >= 32,
    sensitive: true,
  },
  {
    name: 'DEMO_DATA_ENCRYPTION_KEY',
    required: false,
    description: 'Optional demo data encryption key',
    validator: v => v.length >= 32,
    sensitive: true,
  },
  {
    name: 'ELEVENLABS_API_KEY',
    required: false,
    description: 'ElevenLabs API key',
    sensitive: true,
  },
  {
    name: 'ELEVENLABS_AGENT_ID_LEGAL_EN',
    required: false,
    description: 'ElevenLabs agent ID for Legal English',
    sensitive: true,
  },
  {
    name: 'ELEVENLABS_VOICE_ID_LEGAL_EN',
    required: false,
    description: 'ElevenLabs voice ID for Legal English',
    sensitive: true,
  },
  {
    name: 'TELNYX_API_KEY',
    required: false,
    description: 'Telnyx API key for telephony',
    sensitive: true,
  },
  {
    name: 'TELNYX_PUBLIC_KEY',
    required: false,
    description: 'Telnyx webhook public key (ED25519)',
    sensitive: true,
  },
  {
    name: 'TELNYX_CONNECTION_ID',
    required: false,
    description: 'Telnyx connection ID for inbound routing',
    sensitive: false,
  },
  {
    name: 'TELNYX_OUTBOUND_VOICE_PROFILE_ID',
    required: false,
    description: 'Telnyx outbound voice profile ID',
    sensitive: false,
  },
  {
    name: 'TELNYX_PRIMARY_PHONE_NUMBER',
    required: false,
    description: 'Primary E.164 phone number for inbound',
    validator: v => /^\+[1-9]\d{1,14}$/.test(v),
    sensitive: false,
  },
  {
    name: 'TELNYX_WEBHOOK_SECRET',
    required: false,
    description: 'Telnyx webhook secret (if not using public key)',
    sensitive: true,
  },
  {
    name: 'TELNYX_SIP_USERNAME',
    required: false,
    description: 'SIP trunk username for ElevenLabs connection',
    sensitive: true,
  },
  {
    name: 'TELNYX_SIP_PASSWORD',
    required: false,
    description: 'SIP trunk password for ElevenLabs connection',
    sensitive: true,
  },
  {
    name: 'TELNYX_SIP_TRUNK_ID',
    required: false,
    description: 'Telnyx SIP trunk ID',
    sensitive: false,
  },
  {
    name: 'CLOUDFLARE_ACCOUNT_ID',
    required: false,
    description: 'Cloudflare Workers AI account ID',
    sensitive: false,
  },
  {
    name: 'CLOUDFLARE_API_TOKEN',
    required: false,
    description: 'Cloudflare Workers AI API token',
    sensitive: true,
  },
  {
    name: 'CLOUDFLARE_AI_GATEWAY_ID',
    required: false,
    description: 'Cloudflare AI Gateway ID',
    sensitive: false,
  },
  {
    name: 'OPENROUTER_API_KEY',
    required: false,
    description: 'OpenRouter API key for fallback LLM',
    sensitive: true,
  },
  {
    name: 'UPSTASH_REDIS_REST_URL',
    required: false,
    description: 'Upstash Redis REST URL',
    sensitive: false,
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    required: false,
    description: 'Upstash Redis REST token',
    sensitive: true,
  },
  {
    name: 'ALLOW_PRODUCTION_SEED',
    required: false,
    description: 'Allow production database seeding',
    sensitive: false,
  },
  {
    name: 'CONTENT_LOGGING_MODE',
    required: false,
    description: 'Content logging mode',
    sensitive: false,
  },
];

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  invalid: { name: string; reason: string }[];
  warnings: string[];
}

export function validateEnvironment(requiredOnly = false): ValidationResult {
  const missing: string[] = [];
  const invalid: { name: string; reason: string }[] = [];
  const warnings: string[] = [];

  for (const spec of ENV_SPECS) {
    if (!spec.required && requiredOnly) continue;

    const value = process.env[spec.name];

    if (!value || value.trim() === '') {
      if (spec.required) {
        missing.push(spec.name);
      }
      continue;
    }

    if (spec.validator && !spec.validator(value)) {
      invalid.push({
        name: spec.name,
        reason: 'Validation failed',
      });
    }

    if (spec.required && value.length < 8 && spec.sensitive) {
      warnings.push(`${spec.name} may be too short for a secure secret`);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.TELNYX_API_KEY) {
      warnings.push('TELNYX_API_KEY not set - telephony features disabled');
    }
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      warnings.push('Redis not configured - distributed features unavailable');
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    warnings,
  };
}

export function assertEnvironment(requiredOnly = false): void {
  const result = validateEnvironment(requiredOnly);

  if (!result.valid) {
    const messages: string[] = [];

    if (result.missing.length > 0) {
      messages.push(`Missing required environment variables: ${result.missing.join(', ')}`);
    }

    if (result.invalid.length > 0) {
      messages.push(
        `Invalid environment variables: ${result.invalid.map(i => `${i.name} (${i.reason})`).join(', ')}`
      );
    }

    throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
  }

  if (result.warnings.length > 0) {
    console.warn('[ENV WARNINGS]', result.warnings.join('; '));
  }
}

export function getEnvironmentReport(): Record<
  string,
  { configured: boolean; valid: boolean; required: boolean }
> {
  const report: Record<string, { configured: boolean; valid: boolean; required: boolean }> = {};

  for (const spec of ENV_SPECS) {
    const value = process.env[spec.name];
    const configured = Boolean(value && value.trim() !== '');
    let valid = true;

    if (configured && spec.validator) {
      valid = spec.validator(value!);
    }

    report[spec.name] = {
      configured,
      valid,
      required: spec.required,
    };
  }

  return report;
}

export function getRequiredMissing(): string[] {
  return ENV_SPECS.filter(
    s => s.required && (!process.env[s.name] || process.env[s.name]!.trim() === '')
  ).map(s => s.name);
}
