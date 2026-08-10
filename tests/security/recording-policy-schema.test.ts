import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('recording consent schema defaults', () => {
  const schema = fs.readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8');

  it('does not assume recording consent or a successful outcome', () => {
    expect(schema).toMatch(/recordingConsent\s+Boolean\s+@default\(false\)/);
    expect(schema).toMatch(
      /recordingConsentState\s+RecordingConsentState\s+@default\(NOT_REQUESTED\)/
    );
    expect(schema).toMatch(/outcome\s+CallOutcome\?/);
    expect(schema).not.toMatch(/outcome\s+CallOutcome\s+@default/);
  });

  it('does not create consent records as granted', () => {
    expect(schema).toMatch(/consentStatus\s+String\s+@default\("NOT_RECORDED"\)/);
    expect(schema).toMatch(/grantedAt\s+DateTime\?/);
  });
});
