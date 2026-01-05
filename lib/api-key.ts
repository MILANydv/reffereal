import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 32);

export function generateApiKey(): string {
  return `rk_${nanoid()}`;
}

export function generateReferralCode(): string {
  const nanoid = customAlphabet(alphabet, 8);
  return nanoid();
}
