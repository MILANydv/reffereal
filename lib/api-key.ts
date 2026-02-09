import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 32);
const shortId = customAlphabet(alphabet, 8);
const suffixId = customAlphabet(alphabet, 6);

const MAX_PREFIX_LENGTH = 24;
const MAX_IDENTIFIER_LENGTH = 20;

/** Sanitize for use in referral code: alphanumeric and underscore only, truncate length */
function sanitizeForCode(value: string, maxLen: number): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'user';
  return cleaned.slice(0, maxLen).toLowerCase() || 'user';
}

/** Email prefix: part before @, sanitized */
function emailPrefix(email: string): string {
  const beforeAt = email.split('@')[0]?.trim() || 'user';
  return sanitizeForCode(beforeAt, MAX_IDENTIFIER_LENGTH);
}

export function generateApiKey(): string {
  return `rk_${nanoid()}`;
}

export function generateReferralCode(): string {
  return shortId();
}

export type ReferralCodeFormat = 'RANDOM' | 'USERNAME' | 'EMAIL_PREFIX';

export interface ReferralCodeOptions {
  prefix?: string | null;
  format?: ReferralCodeFormat | null;
  referrerUsername?: string | null;
  referrerEmail?: string | null;
}

/**
 * Generate a referral code following campaign rules: optional prefix,
 * optional user/email-based middle part, plus random suffix for uniqueness.
 */
export function generateReferralCodeWithRules(options: ReferralCodeOptions): string {
  const prefix = options.prefix != null && options.prefix !== ''
    ? sanitizeForCode(options.prefix, MAX_PREFIX_LENGTH)
    : '';
  const format = options.format ?? 'RANDOM';

  let middle = '';
  if (format === 'USERNAME' && options.referrerUsername != null && options.referrerUsername !== '') {
    middle = sanitizeForCode(options.referrerUsername, MAX_IDENTIFIER_LENGTH);
  } else if (format === 'EMAIL_PREFIX' && options.referrerEmail != null && options.referrerEmail !== '') {
    middle = emailPrefix(options.referrerEmail);
  }

  const suffix = suffixId();
  const parts = [prefix, middle, suffix].filter(Boolean);
  const code = parts.join('_').replace(/_+/g, '_').replace(/^_|_$/g, '') || shortId();

  return code.length >= 4 ? code : code + shortId().slice(0, 4);
}
