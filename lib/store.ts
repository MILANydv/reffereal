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

interface AppStore {
  selectedApp: App | null;
  apps: App[];
  stats: Stats | null;
  activeCampaigns: Campaign[];
  webhookDeliveries: WebhookDelivery[];
  metrics: Metrics | null;
  referrals: Referral[];
  campaigns: Campaign[];
  analytics: Analytics | null;
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
        set({ campaigns: data.campaigns || [] });
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

  invalidate: (key) => {
    // Clear cached data for the given key
    if (key === 'apps') {
      set({ apps: [] });
    } else if (key === 'stats') {
      set({ stats: null });
    } else if (key === 'campaigns') {
      set({ campaigns: [] });
    }
    // Add more invalidation logic as needed
  },
}));
