import { describe, it, expect } from 'vitest';
import {
  encryptSensitiveValue,
  decryptSensitiveValue,
  maskPhone,
  maskEmail,
} from '@/lib/security/encryption';

describe('Encryption & Masking Security Utilities', () => {
  it('should encrypt and decrypt sensitive values correctly', () => {
    const original = '+1 (555) 234-5678';
    const encrypted = encryptSensitiveValue(original);

    expect(encrypted).not.toBe(original);
    expect(encrypted.startsWith('enc:')).toBe(true);

    const decrypted = decryptSensitiveValue(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should mask phone numbers safely', () => {
    const masked = maskPhone('+1 (555) 234-5678');
    expect(masked).toBe('+1 (55***-5678');
    expect(masked).not.toContain('234');
  });

  it('should mask email addresses safely', () => {
    const masked = maskEmail('sarah.jenkins@nexus.demo');
    expect(masked).toBe('s***s@nexus.demo');
    expect(masked).not.toContain('jenkins');
  });
});
