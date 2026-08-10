import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('versioned business knowledge schema', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8');

  it('tracks approval, language, version, source, and effective period', () => {
    expect(schema).toMatch(/model KnowledgeItem[\s\S]*language\s+String/);
    expect(schema).toMatch(/model KnowledgeItem[\s\S]*status\s+String/);
    expect(schema).toMatch(/model KnowledgeItem[\s\S]*version\s+Int/);
    expect(schema).toMatch(/model KnowledgeItem[\s\S]*effectiveFrom\s+DateTime\?/);
    expect(schema).toMatch(/model KnowledgeItem[\s\S]*expiresAt\s+DateTime\?/);
    expect(schema).toMatch(/model KnowledgeItem[\s\S]*verifiedAt\s+DateTime\?/);
  });
});

