import { create } from 'zustand';

interface App {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  monthlyLimit: number;
  currentUsage: number;
  status: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  totalReferrals: number;
  totalRewardCost: number;
}

interface WebhookDelivery {
  id: string;
  eventType: string;
  url: string;
  success: boolean;
  statusCode: number;
  createdAt: string;
}

interface Stats {
  totalReferrals: number;
  totalConversions: number;
  totalApps: number;
  apiUsage: {
    current: number;
    limit: number;
  };
  apiUsageChart: Array<{ name: string; value: number }>;
  recentActivity: Array<{
    id: string;
    description: string;
    timestamp: string;
    type: string;
  }>;
  alerts?: Array<{
    id: string;
    type: string;
    message: string;
  }>;
}

interface Metrics {
  apiCalls: number;
  referrals: number;
  conversions: number;
  revenue: number;
}

interface Referral {
  id: string;
  referralCode: string;
  referrerId: string;
  status: string;
  clickedAt: string | null;
  convertedAt: string | null;
  rewardAmount: number | null;
  isFlagged: boolean;
  createdAt: string;
  campaign: {
    name: string;
  };
}

interface Analytics {
  referrals: Array<{ date: string; count: number }>;
  conversions: Array<{ date: string; count: number }>;
  revenue: Array<{ date: string; amount: number }>;
}

export interface PricingPlan {
  id: string;
  name: string;
  type: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
  apiLimit: number;
  maxApps: number;
  overagePrice: number;
  features: string[];
  isActive: boolean;
}

export interface DashboardStats {
  totalReferrals: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  activeCampaigns: number;
  monthlyGrowth: number;
  totalPartners: number;
  totalApps: number;
  totalApiCalls: number;
  avgDailyCalls: number;
  successRate: number;
  growthRate: number;
  endpointUsage: Array<{
    endpoint: string;
    count: number;
    percentage: number;
  }>;
  activeSubscriptions: number;
  unresolvedFraudFlags: number;
  recentPartners: Array<{
    id: string;
    companyName?: string;
    user: {
      email: string;
    };
    createdAt: string;
  }>;
}

export interface ActiveCampaign {
  id: string;
  name: string;
  status: string;
  referralType: string;
  rewardModel: string;
  rewardValue: number;
  totalReferrals: number;
  conversionRate: number;
}

export interface WebhookDelivery {
  id: string;
  eventType: string;
  payload: string;
  response?: string;
  statusCode?: number;
  success: boolean;
  retryCount: number;
  createdAt: string;
}

export interface Metrics {
  referrals: {
    current: number;
    previous: number;
    change: number;
  };
  conversions: {
    current: number;
    previous: number;
    change: number;
  };
  revenue: {
    current: number;
    previous: number;
    change: number;
  };
}

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: string;
  inviteAcceptedAt?: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface BillingInfo {
  currentPlan: {
    name: string;
    type: string;
    monthlyPrice: number;
    apiLimit: number;
  };
  currentUsage: {
    apiCalls: number;
    overage: number;
    nextBillingDate: string;
  };
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  paidRevenue: number;
  monthlyRecurringRevenue: number;
  pendingInvoices: number;
  totalOverage: number;
  subscriptionByPlan: Record<string, number>;
  totalRevenue: number;
  pendingRevenue: number;
  subscriptions: Array<{
    id: string;
    partnerId: string;
    planName: string;
    status: string;
    currentPeriodEnd: string;
    amount: number;
  }>;
}

export interface FraudFlag {
  id: string;
  referralCode: string;
  fraudType: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string;
  isActive: boolean;
  createdAt: string;
}

export interface Analytics {
  funnelData: Array<{
    stage: string;
    count: number;
    conversionRate: number;
  }>;
  revenueData: Array<{
    date: string;
    revenue: number;
  }>;
  topCampaigns: Array<{
    id: string;
    name: string;
    conversions: number;
    revenue: number;
  }>;
  appTotals: {
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    totalRewardValue?: number;
    clickRate?: number;
    conversionRate?: number;
  };
}

export interface Referral {
  id: string;
  referralCode: string;
  status: string;
  clickedAt?: string;
  convertedAt?: string;
  rewardAmount?: number;
  createdAt: string;
}

export interface UsageStats {
  currentMonth: {
    apiCalls: number;
    uniqueReferrals: number;
    conversions: number;
  };
  previousMonth: {
    apiCalls: number;
    uniqueReferrals: number;
    conversions: number;
  };
  growth: {
    apiCalls: number;
    referrals: number;
    conversions: number;
  };
  totalApiCalls: number;
  avgResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{
    endpoint: string;
    calls: number;
  }>;
  topApps: Array<{
    id: string;
    name: string;
    calls: number;
  }>;
  topPartners: Array<{
    id: string;
    companyName?: string;
    calls: number;
  }>;
  recentLogs: Array<{
    id: string;
    timestamp: string;
    endpoint: string;
    status: string;
  }>;
}

export interface AdminApp {
  id: string;
  name: string;
  apiKey: string;
  status: string;
  monthlyLimit: number;
  currentUsage: number;
  createdAt: string;
  partner: {
    companyName?: string;
    user: {
      email: string;
    };
  };
  _count: {
    apiUsageLogs: number;
  };
}

export interface AdminPartner {
  id: string;
  companyName?: string;
  user: {
    email: string;
    name?: string;
  };
  active: boolean;
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercent: number;
  targetPartners?: string;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  level: string;
  message: string;
  source?: string;
  metadata?: string;
  createdAt: string;
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: PricingPlan;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  apiUsage: number;
  overageAmount: number;
  createdAt: string;
  paidAt: string | null;
}

interface BillingData {
  subscription: Subscription | null;
  invoices: Invoice[];
  currentUsage: {
    apiCalls: number;
    overage: number;
    estimatedCost: number;
  };
}

interface AppStore {
  selectedApp: App | null;
  apps: App[];
  stats: Stats | null;
  activeCampaigns: Campaign[];
  webhookDeliveries: WebhookDelivery[];
  metrics: Metrics | null;
  referrals: Referral[];
  campaigns: Campaign[];
  stats: DashboardStats | null;
  activeCampaigns: ActiveCampaign[];
  webhookDeliveries: WebhookDelivery[];
  metrics: Metrics | null;
  team: TeamMember[];
  billing: BillingInfo | null;
  fraud: FraudFlag[];
  webhooks: Webhook[];
  analytics: Analytics | null;
  referrals: Referral[];
  pricing: PricingPlan[];
  usage: UsageStats | null;

  // Cache Management
  cache: Record<string, CacheEntry<unknown>>;
  lastFetched: Record<string, number>;

  // UI State
  isLoading: Record<string, boolean>;

  setSelectedApp: (app: App | null) => void;
  fetchApps: (force?: boolean) => Promise<void>;
  fetchStats: (appId: string | 'global') => Promise<void>;
  fetchActiveCampaigns: (appId: string) => Promise<void>;
  fetchWebhookDeliveries: (appId: string) => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchReferrals: (appId: string) => Promise<void>;
  fetchCampaigns: (appId: string) => Promise<void>;
  fetchAnalytics: (appId: string) => Promise<void>;
  fetchBilling: (force?: boolean) => Promise<void>;
  fetchFraud: (appId: string, force?: boolean) => Promise<void>;
  fetchWebhooks: (appId: string, force?: boolean) => Promise<void>;
  fetchAnalytics: (appId: string, force?: boolean) => Promise<void>;
  fetchReferrals: (appId: string, force?: boolean) => Promise<void>;
  fetchPricing: (force?: boolean) => Promise<void>;
  fetchUsage: (force?: boolean) => Promise<void>;

  // Invalidation
  invalidate: (key: string) => void;
  initialize: () => Promise<void>;
}

interface AdminStore {
  partners: AdminPartner[];
  apps: AdminApp[];
  features: FeatureFlag[];
  logs: SystemLog[];
  fraud: FraudFlag[];
  stats: DashboardStats;
  usage: UsageStats;
  billing: BillingInfo;
  pricing: PricingPlan[];

  cache: Record<string, CacheEntry<unknown>>;
  isLoading: Record<string, boolean>;

  fetchPartners: (force?: boolean) => Promise<void>;
  fetchApps: (force?: boolean) => Promise<void>;
  fetchFeatures: (force?: boolean) => Promise<void>;
  fetchLogs: (filters?: { page?: number; level?: string; search?: string }, force?: boolean) => Promise<void>;
  fetchFraud: (force?: boolean) => Promise<void>;
  fetchStats: (force?: boolean) => Promise<void>;
  fetchUsage: (force?: boolean) => Promise<void>;
  fetchBilling: (force?: boolean) => Promise<void>;
  fetchPricing: (force?: boolean) => Promise<void>;

  invalidate: (key: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  selectedApp: null,
  apps: [],
  stats: null,
  activeCampaigns: [],
  webhookDeliveries: [],
  metrics: null,
  referrals: [],
  campaigns: [],
  analytics: null,
  billing: null,
  pricing: [],
  isLoading: {},

  setSelectedApp: (app) => {
    set({ selectedApp: app });
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      if (app) {
        localStorage.setItem('selectedAppId', app.id);
      } else {
        localStorage.removeItem('selectedAppId');
      }
    }
  },

  fetchApps: async (force = false) => {
    const key = 'apps';
    if (!force && get().apps.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/partner/apps');
      if (response.ok) {
        const data = await response.json();
        set({ apps: data.apps || [] });

        // Restore selected app from localStorage
        if (typeof window !== 'undefined') {
          const savedAppId = localStorage.getItem('selectedAppId');
          if (savedAppId && !get().selectedApp) {
            const app = data.apps?.find((a: App) => a.id === savedAppId);
            if (app) {
              set({ selectedApp: app });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchStats: async (appId) => {
    const key = `stats-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const url = appId === 'global' 
        ? '/api/partner/dashboard-stats'
        : `/api/partner/dashboard-stats?appId=${appId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        set({ stats: data });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchActiveCampaigns: async (appId) => {
    const key = `activeCampaigns-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch(`/api/partner/active-campaigns?appId=${appId}`);
      if (response.ok) {
        const data = await response.json();
        set({ activeCampaigns: data.campaigns || [] });
      }
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchWebhookDeliveries: async (appId) => {
    const key = `webhookDeliveries-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch(`/api/partner/webhook-deliveries?appId=${appId}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        set({ webhookDeliveries: data.deliveries || [] });
      }
    } catch (error) {
      console.error('Error fetching webhook deliveries:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchMetrics: async () => {
    const key = 'metrics';
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/partner/metrics');
      if (response.ok) {
        const data = await response.json();
        // API returns changes object, extract it
        set({ metrics: data.changes || null });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchReferrals: async (appId) => {
    const key = `referrals-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch(`/api/partner/referrals?appId=${appId}`);
      if (response.ok) {
        const data = await response.json();
        set({ referrals: data.referrals || [] });
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchCampaigns: async (appId) => {
    const key = `campaigns-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch(`/api/partner/campaigns?appId=${appId}`);
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in campaigns property
        set({ campaigns: Array.isArray(data) ? data : (data.campaigns || []) });
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchAnalytics: async (appId) => {
    const key = `analytics-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch(`/api/partner/analytics?appId=${appId}`);
      if (response.ok) {
        const data = await response.json();
        set({ analytics: data });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchBilling: async (force = false) => {
    const key = 'billing';
    if (!force && get().billing !== null) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/partner/billing');
      if (response.ok) {
        const data = await response.json();
        set({ billing: data });
      }
    } catch (error) {
      console.error('Error fetching billing:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchPricing: async () => {
    const key = 'pricing';
    if (get().pricing.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/partner/pricing-plans');
      if (response.ok) {
        const data = await response.json();
        set({ pricing: data || [] });
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  invalidate: (key) => {
    // Clear cached data for the given key
    if (key === 'apps') {
      set({ apps: [] });
    } else if (key === 'stats') {
      set({ stats: null });
    } else if (key === 'campaigns') {
      set({ campaigns: [] });
    } else if (key === 'billing') {
      set({ billing: null });
    } else if (key === 'pricing') {
      set({ pricing: [] });
    }
    // Add more invalidation logic as needed
  },
}));
