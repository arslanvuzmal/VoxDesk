import crypto from 'crypto';
import { env } from '@/lib/config/env';

const E164_PATTERN = /^\+[1-9]\d{1,14}$/;

export function normalizePhoneNumber(value: string): string {
  const normalized = value.trim().replace(/[\s().-]/g, '');
  if (!E164_PATTERN.test(normalized)) {
    throw new Error('Phone number must be normalized E.164.');
  }
  return normalized;
}

export function hashPhoneNumber(value: string): string {
  return crypto
    .createHmac('sha256', env.PHONE_HASH_SECRET)
    .update(normalizePhoneNumber(value))
    .digest('hex');
}

export function phoneLast4(value: string): string {
  return normalizePhoneNumber(value).slice(-4);
}

export function maskPhoneNumber(value: string): string {
  return `***${phoneLast4(value)}`;
}

