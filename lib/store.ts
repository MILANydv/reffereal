import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface App {
  id: string;
  name: string;
  apiKey: string;
  status: string;
  monthlyLimit: number;
  currentUsage: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  totalReferrals: number;
  referralCode?: string;
  referralType: string;
  rewardModel: string;
  rewardValue: number;
  startDate: string | null;
  endDate: string | null;
  _count: {
    referrals: number;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  type: string;
  monthlyPrice: number;
  yearlyPrice: number;
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

interface PartnerStore {
  // Navigation / Selection State
  selectedAppId: string | null;
  selectedApp: App | null;

  // Data State
  apps: App[];
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
  isInitialized: boolean;

  // Actions
  setSelectedApp: (app: App | null) => void;
  setSelectedAppId: (appId: string | null) => void;

  // Fetching Methods
  fetchApps: (force?: boolean) => Promise<void>;
  fetchCampaigns: (appId: string, force?: boolean) => Promise<void>;
  fetchStats: (appId: string, force?: boolean) => Promise<void>;
  fetchActiveCampaigns: (appId: string, force?: boolean) => Promise<void>;
  fetchWebhookDeliveries: (appId: string, force?: boolean) => Promise<void>;
  fetchMetrics: (force?: boolean) => Promise<void>;
  fetchTeam: (force?: boolean) => Promise<void>;
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

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const usePartnerStore = create<PartnerStore>()(
  persist(
    (set, get) => ({
      selectedAppId: null,
      selectedApp: null,
      apps: [],
      campaigns: [],
      stats: null,
      activeCampaigns: [],
      webhookDeliveries: [],
      metrics: null,
      team: [],
      billing: null,
      fraud: [],
      webhooks: [],
      analytics: null,
      referrals: [],
      pricing: [],
      usage: null,
      cache: {},
      lastFetched: {},
      isLoading: {},
      isInitialized: false,

      setSelectedApp: (app) => set({ selectedApp: app, selectedAppId: app?.id || null }),
      setSelectedAppId: (appId) => {
        const app = get().apps.find(a => a.id === appId) || null;
        set({ selectedApp: app, selectedAppId: appId });
      },

      invalidate: (key) => {
        const cache = { ...get().cache };
        delete cache[key];
        set({ cache });
      },

      fetchApps: async (force = false) => {
        const key = 'apps';
        const now = Date.now();
        const entry = get().cache[key];

        if (!force && entry && now - entry.timestamp < CACHE_TTL) return;

        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch('/api/partner/apps');
          if (res.ok) {
            const data = await res.json();
            set({
              apps: data,
              cache: { ...get().cache, [key]: { data, timestamp: now } }
            });
            if (!get().selectedAppId && data.length > 0) {
              set({ selectedApp: data[0], selectedAppId: data[0].id });
            }
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchCampaigns: async (appId, force = false) => {
        const key = `campaigns-${appId}`;
        const now = Date.now();
        const entry = get().cache[key];

        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ campaigns: entry.data });
          return;
        }

        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch(`/api/partner/campaigns?appId=${appId}`);
          if (res.ok) {
            const data = await res.json();
            set({
              campaigns: data,
              cache: { ...get().cache, [key]: { data, timestamp: now } }
            });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchStats: async (appId, force = false) => {
        const key = `stats-${appId}`;
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ stats: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch(`/api/partner/dashboard-stats?appId=${appId}`);
          if (res.ok) {
            const data = await res.json();
            set({ stats: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchActiveCampaigns: async (appId, force = false) => {
        const key = `active-campaigns-${appId}`;
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ activeCampaigns: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch(`/api/partner/active-campaigns?appId=${appId}`);
          if (res.ok) {
            const data = await res.json();
            set({ activeCampaigns: data.campaigns || [], cache: { ...get().cache, [key]: { data: data.campaigns, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchWebhookDeliveries: async (appId, force = false) => {
        const key = `webhook-deliveries-${appId}`;
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ webhookDeliveries: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch(`/api/partner/webhook-deliveries?appId=${appId}`);
          if (res.ok) {
            const data = await res.json();
            set({ webhookDeliveries: data.deliveries || [], cache: { ...get().cache, [key]: { data: data.deliveries, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchMetrics: async (force = false) => {
        const key = 'metrics';
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ metrics: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch('/api/partner/metrics?period=30');
          if (res.ok) {
            const data = await res.json();
            set({ metrics: data.changes, cache: { ...get().cache, [key]: { data: data.changes, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchTeam: async (force = false) => {
        const key = 'team';
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ team: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch('/api/partner/team');
          if (res.ok) {
            const data = await res.json();
            set({ team: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchBilling: async (force = false) => {
        const key = 'billing';
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ billing: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch('/api/partner/billing');
          if (res.ok) {
            const data = await res.json();
            set({ billing: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchFraud: async (appId, force = false) => {
        const key = `fraud-${appId}`;
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ fraud: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch(`/api/partner/fraud?appId=${appId}`);
          if (res.ok) {
            const data = await res.json();
            set({ fraud: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchWebhooks: async (appId, force = false) => {
        const key = `webhooks-${appId}`;
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ webhooks: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch(`/api/partner/webhooks?appId=${appId}`);
          if (res.ok) {
            const data = await res.json();
            set({ webhooks: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchAnalytics: async (appId, force = false) => {
        const key = `analytics-${appId}`;
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ analytics: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch(`/api/partner/analytics?appId=${appId}`);
          if (res.ok) {
            const data = await res.json();
            set({ analytics: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchReferrals: async (appId, force = false) => {
        const key = `referrals-${appId}`;
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ referrals: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch(`/api/partner/referrals?appId=${appId}`);
          if (res.ok) {
            const data = await res.json();
            set({ referrals: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchPricing: async (force = false) => {
        const key = 'pricing';
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ pricing: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch('/api/partner/pricing-plans');
          if (res.ok) {
            const data = await res.json();
            set({ pricing: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      fetchUsage: async (force = false) => {
        const key = 'usage';
        const now = Date.now();
        const entry = get().cache[key];
        if (!force && entry && now - entry.timestamp < CACHE_TTL) {
          set({ usage: entry.data });
          return;
        }
        set({ isLoading: { ...get().isLoading, [key]: true } });
        try {
          const res = await fetch('/api/partner/usage-stats');
          if (res.ok) {
            const data = await res.json();
            set({ usage: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
          }
        } finally {
          set({ isLoading: { ...get().isLoading, [key]: false } });
        }
      },

      initialize: async () => {
        if (get().isInitialized) return;
        await get().fetchApps();
        set({ isInitialized: true });
      }
    }),
    {
      name: 'partner-storage',
      partialize: (state) => ({
        selectedAppId: state.selectedAppId,
        selectedApp: state.selectedApp,
        cache: state.cache
      }),
    }
  )
);

export const useAdminStore = create<AdminStore>((set, get) => ({
  partners: [],
  apps: [],
  features: [],
  logs: [],
  fraud: [],
  stats: null,
  usage: null,
  billing: null,
  pricing: [],
  cache: {},
  isLoading: {},

  invalidate: (key) => {
    const cache = { ...get().cache };
    delete cache[key];
    set({ cache });
  },

  fetchPartners: async (force = false) => {
    const key = 'partners';
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) return;
    set({ isLoading: { ...get().isLoading, [key]: true } });
    try {
      const res = await fetch('/api/admin/partners');
      if (res.ok) {
        const data = await res.json();
        set({ partners: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, [key]: false } });
    }
  },

  fetchApps: async (force = false) => {
    const key = 'apps';
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) return;
    set({ isLoading: { ...get().isLoading, [key]: true } });
    try {
      const res = await fetch('/api/admin/apps');
      if (res.ok) {
        const data = await res.json();
        set({ apps: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, [key]: false } });
    }
  },

  fetchFeatures: async (force = false) => {
    const key = 'features';
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) return;
    set({ isLoading: { ...get().isLoading, [key]: true } });
    try {
      const res = await fetch('/api/admin/feature-flags');
      if (res.ok) {
        const data = await res.json();
        set({ features: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, [key]: false } });
    }
  },

  fetchLogs: async (filters = {}, force = false) => {
    const key = `logs-${JSON.stringify(filters)}`;
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) {
      set({ logs: entry.data });
      return;
    }
    set({ isLoading: { ...get().isLoading, 'logs': true } });
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.level && filters.level !== 'all') params.append('level', filters.level);
      if (filters.search) params.append('search', filters.search);

      const res = await fetch(`/api/admin/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        set({ logs: data.logs, cache: { ...get().cache, [key]: { data: data.logs, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, 'logs': false } });
    }
  },

  fetchFraud: async (force = false) => {
    const key = 'fraud';
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) return;
    set({ isLoading: { ...get().isLoading, [key]: true } });
    try {
      const res = await fetch('/api/admin/fraud');
      if (res.ok) {
        const data = await res.json();
        set({ fraud: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, [key]: false } });
    }
  },

  fetchStats: async (force = false) => {
    const key = 'stats';
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) return;
    set({ isLoading: { ...get().isLoading, [key]: true } });
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        set({ stats: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, [key]: false } });
    }
  },

  fetchUsage: async (force = false) => {
    const key = 'usage';
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) return;
    set({ isLoading: { ...get().isLoading, [key]: true } });
    try {
      const res = await fetch('/api/admin/usage');
      if (res.ok) {
        const data = await res.json();
        set({ usage: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, [key]: false } });
    }
  },

  fetchBilling: async (force = false) => {
    const key = 'billing';
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) return;
    set({ isLoading: { ...get().isLoading, [key]: true } });
    try {
      const res = await fetch('/api/admin/billing');
      if (res.ok) {
        const data = await res.json();
        set({ billing: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, [key]: false } });
    }
  },

  fetchPricing: async (force = false) => {
    const key = 'pricing';
    const now = Date.now();
    const entry = get().cache[key];
    if (!force && entry && now - entry.timestamp < CACHE_TTL) return;
    set({ isLoading: { ...get().isLoading, [key]: true } });
    try {
      const res = await fetch('/api/admin/pricing-plans');
      if (res.ok) {
        const data = await res.json();
        set({ pricing: data, cache: { ...get().cache, [key]: { data, timestamp: now } } });
      }
    } finally {
      set({ isLoading: { ...get().isLoading, [key]: false } });
    }
  },
}));

// Backward compatibility or legacy support if needed
export const useAppStore = usePartnerStore;
