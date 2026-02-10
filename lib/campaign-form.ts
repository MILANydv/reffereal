/**
 * Campaign form types and mappers for create/edit flows.
 * Single source of truth for payload contracts and validation.
 */

export const REWARD_VALUE_MAX = 100_000;
export const REWARD_VALUE_MIN = 0;

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'SCHEDULED' | 'EXPIRED';
export type ReferralCodeFormat = 'RANDOM' | 'USERNAME' | 'EMAIL_PREFIX';
export type PayoutType = 'CASH' | 'STORE_CREDIT' | 'IN_APP_DISCOUNT' | 'COUPON_CODE' | 'POINTS' | 'OTHER' | null;

export const PAYOUT_TYPE_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: '', label: 'Not set', description: 'No default payout type; assign when claiming.' },
  { value: 'IN_APP_DISCOUNT', label: 'In-App Discount', description: 'System generates a unique discount code the user can apply at checkout.' },
  { value: 'COUPON_CODE', label: 'Coupon Code', description: 'Partner provides external coupon codes assigned to users on claim.' },
  { value: 'STORE_CREDIT', label: 'Store Credit', description: 'Credit added to the user\'s account balance.' },
  { value: 'CASH', label: 'Cash', description: 'Direct payment via PayPal, bank transfer, etc.' },
  { value: 'POINTS', label: 'Points', description: 'Loyalty points credited to the user\'s account.' },
  { value: 'OTHER', label: 'Other', description: 'Custom fulfillment handled externally.' },
];

export interface CampaignFormData {
  name: string;
  status: CampaignStatus;
  rewardValue: number;
  rewardCap: number | null;
  firstTimeUserOnly: boolean;
  startDate: string;
  endDate: string;
  conversionWindow: number | null;
  rewardExpiration: number | null;
  level1Reward: number | null;
  level2Reward: number | null;
  level1Cap: number | null;
  level2Cap: number | null;
  tierConfig: string;
  referralCodePrefix: string;
  referralCodeFormat: ReferralCodeFormat;
  payoutType: PayoutType;
}

/** Timezone-safe: use local date for input[type=date] (avoids UTC off-by-one e.g. Nepal UTC+5:45). */
export function toDateInputValue(date: string | Date | null | undefined): string {
  if (date == null) return '';
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

/** Map API campaign response to form state (edit page). */
export function campaignApiToFormData(data: Record<string, unknown>): CampaignFormData {
  return {
    name: (data.name as string) ?? '',
    status: (data.status as CampaignStatus) ?? 'ACTIVE',
    rewardValue: typeof data.rewardValue === 'number' ? data.rewardValue : 10,
    rewardCap: data.rewardCap != null ? Number(data.rewardCap) : null,
    firstTimeUserOnly: data.firstTimeUserOnly !== false,
    startDate: toDateInputValue(data.startDate as string | Date | null),
    endDate: toDateInputValue(data.endDate as string | Date | null),
    conversionWindow: data.conversionWindow != null ? Number(data.conversionWindow) : null,
    rewardExpiration: data.rewardExpiration != null ? Number(data.rewardExpiration) : null,
    level1Reward: data.level1Reward != null ? Number(data.level1Reward) : null,
    level2Reward: data.level2Reward != null ? Number(data.level2Reward) : null,
    level1Cap: data.level1Cap != null ? Number(data.level1Cap) : null,
    level2Cap: data.level2Cap != null ? Number(data.level2Cap) : null,
    tierConfig:
      typeof data.tierConfig === 'string'
        ? data.tierConfig
        : data.tierConfig != null
          ? JSON.stringify(data.tierConfig, null, 2)
          : '',
    referralCodePrefix: (data.referralCodePrefix as string) ?? '',
    referralCodeFormat: (data.referralCodeFormat as ReferralCodeFormat) ?? 'RANDOM',
    payoutType: (data.payoutType as PayoutType) ?? null,
  };
}

export interface CampaignPatchPayload {
  name: string;
  status: CampaignStatus;
  rewardValue: number;
  firstTimeUserOnly: boolean;
  rewardCap?: number | null;
  startDate?: string;
  endDate?: string;
  conversionWindow?: number | null;
  rewardExpiration?: number | null;
  level1Reward?: number | null;
  level2Reward?: number | null;
  level1Cap?: number | null;
  level2Cap?: number | null;
  tierConfig?: unknown;
  referralCodePrefix?: string | null;
  referralCodeFormat?: 'USERNAME' | 'EMAIL_PREFIX' | null;
  payoutType?: string | null;
}

function toNum(v: number | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** Map form state to PATCH body (edit page). Prevents NaN and invalid numbers. */
export function campaignFormToPatchPayload(form: CampaignFormData): CampaignPatchPayload {
  const rewardValue = Number(form.rewardValue);
  const payload: CampaignPatchPayload = {
    name: form.name.trim(),
    status: form.status,
    rewardValue: Number.isNaN(rewardValue) ? 0 : Math.max(REWARD_VALUE_MIN, Math.min(REWARD_VALUE_MAX, rewardValue)),
    firstTimeUserOnly: form.firstTimeUserOnly,
  };
  const cap = toNum(form.rewardCap);
  if (cap != null) payload.rewardCap = cap;
  if (form.startDate) payload.startDate = form.startDate;
  if (form.endDate) payload.endDate = form.endDate;
  const cw = toNum(form.conversionWindow);
  if (cw != null) payload.conversionWindow = cw;
  const re = toNum(form.rewardExpiration);
  if (re != null) payload.rewardExpiration = re;
  const l1r = toNum(form.level1Reward);
  if (l1r != null) payload.level1Reward = l1r;
  const l2r = toNum(form.level2Reward);
  if (l2r != null) payload.level2Reward = l2r;
  const l1c = toNum(form.level1Cap);
  if (l1c != null) payload.level1Cap = l1c;
  const l2c = toNum(form.level2Cap);
  if (l2c != null) payload.level2Cap = l2c;
  if (form.tierConfig.trim()) {
    try {
      payload.tierConfig = JSON.parse(form.tierConfig);
    } catch {
      payload.tierConfig = form.tierConfig;
    }
  } else {
    payload.tierConfig = null;
  }
  if (form.referralCodePrefix.trim()) payload.referralCodePrefix = form.referralCodePrefix.trim();
  else payload.referralCodePrefix = null;
  payload.referralCodeFormat = form.referralCodeFormat === 'RANDOM' ? null : form.referralCodeFormat;
  payload.payoutType = form.payoutType || null;
  return payload;
}

/** Validate edit form before submit. Returns error message or null. */
export function validateCampaignPatchForm(form: CampaignFormData): string | null {
  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    return 'End date must be on or after start date';
  }
  const rv = form.rewardValue;
  if (typeof rv !== 'number' || Number.isNaN(rv) || rv < REWARD_VALUE_MIN || rv > REWARD_VALUE_MAX) {
    return `Reward value must be between ${REWARD_VALUE_MIN} and ${REWARD_VALUE_MAX}`;
  }
  return null;
}

/** Create campaign form shape (includes referralType, rewardModel). */
export interface CampaignCreateFormData extends CampaignFormData {
  referralType: 'ONE_SIDED' | 'TWO_SIDED' | 'MULTI_LEVEL';
  rewardModel: 'FIXED_CURRENCY' | 'PERCENTAGE' | 'TIERED';
}

export interface CampaignCreatePayload {
  appId: string;
  name: string;
  referralType: string;
  rewardModel: string;
  rewardValue: number;
  firstTimeUserOnly: boolean;
  rewardCap?: number | null;
  startDate?: string;
  endDate?: string;
  conversionWindow?: number;
  rewardExpiration?: number | null;
  level1Reward?: number | null;
  level2Reward?: number | null;
  level1Cap?: number | null;
  level2Cap?: number | null;
  tierConfig?: unknown;
  referralCodePrefix?: string;
  referralCodeFormat?: ReferralCodeFormat;
  payoutType?: string | null;
}

/** Map create form to POST body. Sanitizes numbers to avoid NaN. */
export function campaignFormToCreatePayload(form: CampaignCreateFormData, appId: string): CampaignCreatePayload {
  const rewardValue = Number(form.rewardValue);
  const payload: CampaignCreatePayload = {
    appId,
    name: form.name.trim(),
    referralType: form.referralType,
    rewardModel: form.rewardModel,
    rewardValue: Number.isNaN(rewardValue) ? 0 : Math.max(REWARD_VALUE_MIN, Math.min(REWARD_VALUE_MAX, rewardValue)),
    firstTimeUserOnly: form.firstTimeUserOnly,
  };
  const cap = toNum(form.rewardCap);
  if (cap != null) payload.rewardCap = cap;
  if (form.startDate) payload.startDate = form.startDate;
  if (form.endDate) payload.endDate = form.endDate;
  if (form.conversionWindow != null) {
    const cw = toNum(form.conversionWindow);
    if (cw != null) payload.conversionWindow = cw;
  }
  const re = toNum(form.rewardExpiration);
  if (re != null) payload.rewardExpiration = re;
  const l1r = toNum(form.level1Reward);
  if (l1r != null) payload.level1Reward = l1r;
  const l2r = toNum(form.level2Reward);
  if (l2r != null) payload.level2Reward = l2r;
  const l1c = toNum(form.level1Cap);
  if (l1c != null) payload.level1Cap = l1c;
  const l2c = toNum(form.level2Cap);
  if (l2c != null) payload.level2Cap = l2c;
  if (form.tierConfig.trim()) {
    try {
      payload.tierConfig = JSON.parse(form.tierConfig);
    } catch {
      payload.tierConfig = form.tierConfig;
    }
  }
  if (form.referralCodePrefix.trim()) payload.referralCodePrefix = form.referralCodePrefix.trim();
  if (form.referralCodeFormat !== 'RANDOM') payload.referralCodeFormat = form.referralCodeFormat;
  if (form.payoutType) payload.payoutType = form.payoutType;
  return payload;
}

/** Validate create form. Returns error message or null. */
export function validateCampaignCreateForm(form: CampaignCreateFormData): string | null {
  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    return 'End date must be on or after start date';
  }
  const rv = form.rewardValue;
  if (typeof rv !== 'number' || Number.isNaN(rv) || rv < REWARD_VALUE_MIN || rv > REWARD_VALUE_MAX) {
    return `Reward value must be between ${REWARD_VALUE_MIN} and ${REWARD_VALUE_MAX}`;
  }
  return null;
}
