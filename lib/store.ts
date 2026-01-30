import { create } from 'zustand';

// ===== Type Definitions =====

export interface App {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  monthlyLimit: number;
  currentUsage: number;
  status: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  totalReferrals: number;
  totalRewardCost: number;
  startDate?: string;
  referralType?: string;
  rewardModel?: string;
  rewardValue?: number;
  _count?: {
    referrals: number;
  };
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
  alerts?: Array<{
    id: string;
    type: string;
    message: string;
  }>;
  apiUsage?: {
    current: number;
    limit: number;
  };
  apiUsageChart?: Array<{ name: string; value: number }>;
  recentActivity?: Array<{
    id: string;
    description: string;
    timestamp: string;
    type: string;
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
  totalRewardCost?: number;
}

export interface WebhookDelivery {
  id: string;
  eventType: string;
  url: string;
  success: boolean;
  statusCode: number;
  createdAt: string;
}

export interface Metrics {
  apiCalls: number;
  referrals: number;
  conversions: number;
  revenue: number;
  changes?: {
    apiCalls: number;
    referrals: number;
    conversions: number;
    revenue: number;
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
  // Partner billing fields
  subscription?: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    plan: PricingPlan;
  } | null;
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    billingPeriodStart?: string;
    billingPeriodEnd?: string;
    apiUsage: number;
    overageAmount: number;
    createdAt: string;
    paidAt?: string | null;
    partner?: {
      companyName?: string;
      user: {
        email: string;
      };
    };
  }>;
  currentUsage?: {
    apiCalls: number;
    overage: number;
    estimatedCost: number;
  };
  // Admin billing fields
  totalRevenue?: number;
  totalOverage?: number;
  totalInvoices?: number;
  paidRevenue?: number;
  pendingRevenue?: number;
  paidInvoices?: number;
  pendingInvoices?: number;
  failedInvoices?: number;
  monthlyRecurringRevenue?: number;
  subscriptionByPlan?: Record<string, number>;
  subscriptions?: Array<{
    id: string;
    partnerId: string;
    status: string;
    currentPeriodEnd: string;
    plan: {
      name: string;
      type: string;
      monthlyPrice: number;
    };
    partner: {
      companyName?: string;
      user: {
        email: string;
      };
    };
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
  funnelData?: Array<{
    stage: string;
    count: number;
    conversionRate: number;
  }>;
  revenueData?: Array<{
    date: string;
    revenue: number;
  }>;
  topCampaigns?: Array<{
    id: string;
    name: string;
    conversions: number;
    revenue: number;
  }>;
  campaigns?: Array<{
    id: string;
    name: string;
    conversions: number;
    revenue: number;
  }>;
  appTotals?: {
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    totalRewardValue?: number;
    clickRate?: number;
    conversionRate?: number;
  };
  referrals?: Array<{ date: string; count: number }>;
  conversions?: Array<{ date: string; count: number }>;
  revenue?: Array<{ date: string; amount: number }>;
}

export interface Referral {
  id: string;
  referralCode: string;
  referrerId?: string;
  status: string;
  clickedAt?: string | null;
  convertedAt?: string | null;
  rewardAmount?: number | null;
  isFlagged?: boolean;
  createdAt: string;
  campaign?: {
    name: string;
  };
}

export interface UsageStats {
  apiUsage?: {
    current: number;
    limit: number;
    overage: number;
    estimatedCost: number;
    dailyUsage?: Array<{ date: string; calls: number }>;
  };
  endpointBreakdown?: {
    byEndpoint: Array<{ endpoint: string; count: number; percentage: string }>;
    byCategory: Array<{ category: string; count: number; percentage: string }>;
  };
  recentLogs?: Array<{
    id: string;
    endpoint: string;
    timestamp: string;
    status: string;
  }>;
  totalApiCalls?: number;
  topApps?: Array<{
    id: string;
    name: string;
    calls: number;
  }>;
  topPartners?: Array<{
    id: string;
    companyName?: string;
    calls: number;
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

// ===== App Store (Partner Dashboard) =====

interface AppStore {
  selectedApp: App | null;
  apps: App[];
  stats: DashboardStats | null;
  activeCampaigns: ActiveCampaign[];
  webhookDeliveries: WebhookDelivery[];
  metrics: Metrics | null;
  referrals: Referral[];
  campaigns: Campaign[];
  analytics: Analytics | null;
  billing: BillingInfo | null;
  pricing: PricingPlan[];
  usage: UsageStats | null;
  team: TeamMember[];
  fraud: FraudFlag[];
  webhooks: Webhook[];
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
  fetchPricing: () => Promise<void>;
  fetchUsage: (force?: boolean) => Promise<void>;
  fetchTeam: () => Promise<void>;
  fetchFraud: (appId?: string) => Promise<void>;
  fetchWebhooks: (appId?: string) => Promise<void>;
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
  usage: null,
  team: [],
  fraud: [],
  webhooks: [],
  isLoading: {},

  setSelectedApp: (app) => {
    set({ selectedApp: app });
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
        // API returns array directly, not wrapped in an object
        const appsArray = Array.isArray(data) ? data : (data.apps || []);
        set({ apps: appsArray });

        if (typeof window !== 'undefined') {
          const savedAppId = localStorage.getItem('selectedAppId');
          if (savedAppId && !get().selectedApp) {
            const app = appsArray.find((a: App) => a.id === savedAppId);
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
        set({ metrics: data.changes || data });
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
        set({ pricing: Array.isArray(data) ? data : [] });
      }
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchUsage: async (force = false) => {
    const key = 'usage';
    const selectedApp = get().selectedApp;
    const cacheKey = selectedApp ? `usage-${selectedApp.id}` : 'usage';
    
    if (!force && get().usage !== null) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const url = selectedApp 
        ? `/api/partner/usage-stats?appId=${selectedApp.id}`
        : '/api/partner/usage-stats';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        set({ usage: data });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching usage stats:', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchTeam: async () => {
    const key = 'team';
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/partner/team');
      if (response.ok) {
        const data = await response.json();
        set({ team: Array.isArray(data) ? data : (data.members || []) });
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchFraud: async (appId?) => {
    const key = appId ? `fraud-${appId}` : 'fraud';
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const url = appId ? `/api/partner/fraud?appId=${appId}` : '/api/partner/fraud';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        set({ fraud: Array.isArray(data) ? data : [] });
      }
    } catch (error) {
      console.error('Error fetching fraud:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchWebhooks: async (appId?) => {
    const key = appId ? `webhooks-${appId}` : 'webhooks';
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const url = appId ? `/api/partner/webhooks?appId=${appId}` : '/api/partner/webhooks';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        set({ webhooks: Array.isArray(data) ? data : (data.webhooks || []) });
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  invalidate: (key) => {
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
    } else if (key === 'usage') {
      set({ usage: null });
    } else if (key === 'team') {
      set({ team: [] });
    } else if (key === 'fraud') {
      set({ fraud: [] });
    } else if (key === 'webhooks') {
      set({ webhooks: [] });
    }
  },
}));

// ===== Partner Store (Team Management) =====

interface PartnerStore {
  team: TeamMember[];
  isLoading: Record<string, boolean>;
  fetchTeam: () => Promise<void>;
  invalidate: (key: string) => void;
}

export const usePartnerStore = create<PartnerStore>((set, get) => ({
  team: [],
  isLoading: {},

  fetchTeam: async () => {
    const key = 'team';
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/partner/team');
      if (response.ok) {
        const data = await response.json();
        set({ team: Array.isArray(data) ? data : (data.members || []) });
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  invalidate: (key) => {
    if (key === 'team') {
      set({ team: [] });
    }
  },
}));

// ===== Admin Store =====

interface AdminStore {
  partners: AdminPartner[];
  apps: AdminApp[];
  features: FeatureFlag[];
  logs: SystemLog[];
  fraud: FraudFlag[];
  stats: DashboardStats | null;
  usage: UsageStats | null;
  billing: BillingInfo | null;
  pricing: PricingPlan[];
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
  isLoading: {},

  fetchPartners: async (force = false) => {
    const key = 'partners';
    if (!force && get().partners.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/partners');
      if (response.ok) {
        const data = await response.json();
        set({ partners: Array.isArray(data) ? data : (data.partners || []) });
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchApps: async (force = false) => {
    const key = 'apps';
    if (!force && get().apps.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/apps');
      if (response.ok) {
        const data = await response.json();
        set({ apps: Array.isArray(data) ? data : (data.apps || []) });
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchFeatures: async (force = false) => {
    const key = 'features';
    if (!force && get().features.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/feature-flags');
      if (response.ok) {
        const data = await response.json();
        set({ features: Array.isArray(data) ? data : (data.flags || []) });
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchLogs: async (filters, force = false) => {
    const key = 'logs';
    if (!force && get().logs.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.level) params.append('level', filters.level);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        set({ logs: data.logs || [] });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchFraud: async (force = false) => {
    const key = 'fraud';
    if (!force && get().fraud.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/fraud');
      if (response.ok) {
        const data = await response.json();
        set({ fraud: Array.isArray(data) ? data : (data.flags || []) });
      }
    } catch (error) {
      console.error('Error fetching fraud:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchStats: async (force = false) => {
    const key = 'stats';
    if (!force && get().stats !== null) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/stats');
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

  fetchUsage: async (force = false) => {
    const key = 'usage';
    if (!force && get().usage !== null) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/usage');
      if (response.ok) {
        const data = await response.json();
        set({ usage: data });
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchBilling: async (force = false) => {
    const key = 'billing';
    if (!force && get().billing !== null) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/billing');
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

  fetchPricing: async (force = false) => {
    const key = 'pricing';
    if (!force && get().pricing.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/pricing-plans?includeInactive=true');
      if (response.ok) {
        const data = await response.json();
        set({ pricing: Array.isArray(data) ? data : (data.plans || []) });
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  invalidate: (key) => {
    if (key === 'partners') {
      set({ partners: [] });
    } else if (key === 'apps') {
      set({ apps: [] });
    } else if (key === 'features') {
      set({ features: [] });
    } else if (key === 'logs') {
      set({ logs: [] });
    } else if (key === 'fraud') {
      set({ fraud: [] });
    } else if (key === 'stats') {
      set({ stats: null });
    } else if (key === 'usage') {
      set({ usage: null });
    } else if (key === 'billing') {
      set({ billing: null });
    } else if (key === 'pricing') {
      set({ pricing: [] });
    }
  },
}));
