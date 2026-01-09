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
  isActive?: boolean;
}

interface PartnerStore {
  // Navigation / Selection State
  selectedAppId: string | null;
  selectedApp: App | null;

  // Data State
  apps: App[];
  campaigns: Campaign[];
  stats: any | null;
  activeCampaigns: any[];
  webhookDeliveries: any[];
  metrics: any | null;
  team: any[];
  billing: any | null;
  fraud: any[];
  webhooks: any[];
  analytics: any | null;
  referrals: any[];
  pricing: any[];
  usage: any | null;

  // Cache Management
  cache: Record<string, CacheEntry<any>>;
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
  partners: any[];
  apps: any[];
  features: any[];
  logs: any[];
  fraud: any[];
  stats: any;
  usage: any;
  billing: any;
  pricing: any[];

  cache: Record<string, CacheEntry<any>>;
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
