import { create } from 'zustand';

// ===== Type Definitions =====

export interface App {
  id: string;
  name: string;
  description?: string;
  allowedDomains?: string | null;
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
  App?: {
    id: string;
    name: string;
  };
  // Legacy lowercase support
  app?: {
    id: string;
    name: string;
  };
  _count?: {
    Referral: number;
    // Legacy
    referrals?: number;
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
  fraudAlerts?: Array<{
    id: string;
    type: string;
    message: string;
    appName: string;
    referralCode: string;
    partnerEmail: string;
    createdAt: string;
  }>;
  manualFraudFlags?: number;
  apiUsage?: {
    current: number;
    limit: number;
  };
  apiUsageChart?: {
    data: Array<{ name: string; date: string;[appName: string]: any }>;
    apps: Array<{ id: string; name: string }>;
  } | Array<{ name: string; value: number }>;
  recentActivity?: Array<{
    id: string;
    description: string;
    timestamp: string;
    type: string;
    app?: {
      id: string;
      name: string;
    };
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
  app?: {
    id: string;
    name: string;
  };
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
  Campaign?: {
    name: string;
    App?: {
      name: string;
    };
  };
  // Legacy lowercase support (for backwards compatibility)
  campaign?: {
    name: string;
    app?: {
      name: string;
    };
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
  referralStats?: {
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    totalRewards: number;
    clickRate: string;
    conversionRate: string;
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
  Partner?: {
    companyName?: string | null;
    User?: {
      email: string;
      name?: string | null;
    };
  };
  // Legacy lowercase support
  partner?: {
    companyName?: string;
    user?: {
      email: string;
    };
  };
};

export interface Blog {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
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
export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  createdAt: string;
}

export interface Changelog {
  id: string;
  version: string;
  type: 'MAJOR' | 'MINOR' | 'PATCH';
  title: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  releaseDate: string;
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
  isAppTransitioning: boolean;

  setSelectedApp: (app: App | null) => void;
  setAppTransitioning: (isTransitioning: boolean) => void;
  fetchApps: (force?: boolean) => Promise<void>;
  fetchStats: (appId: string | 'global', dateRange?: { startDate?: Date | null; endDate?: Date | null }) => Promise<void>;
  fetchActiveCampaigns: (appId?: string) => Promise<void>;
  fetchWebhookDeliveries: (appId?: string) => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchReferrals: (appId: string, options?: { page?: number; limit?: number; status?: string; search?: string; startDate?: Date; endDate?: Date }) => Promise<{ referrals: Referral[]; pagination?: { page: number; totalPages: number; totalItems: number } }>;
  fetchCampaigns: (appId: string, options?: { page?: number; limit?: number; status?: string; search?: string }) => Promise<{ campaigns: Campaign[]; pagination?: { page: number; totalPages: number; totalItems: number } }>;
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
  isAppTransitioning: false,

  setSelectedApp: (app) => {
    const currentApp = get().selectedApp;
    // Only set transitioning if we're actually switching to a different app
    if (app && currentApp && app.id !== currentApp.id) {
      set({ isAppTransitioning: true, selectedApp: app });
    } else {
      // Clear transitioning state if same app or no app
      set({ selectedApp: app, isAppTransitioning: false });
    }
    if (typeof window !== 'undefined') {
      if (app) {
        localStorage.setItem('selectedAppId', app.id);
      } else {
        localStorage.removeItem('selectedAppId');
      }
    }
  },

  setAppTransitioning: (isTransitioning) => {
    set({ isAppTransitioning: isTransitioning });
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

  fetchStats: async (appId, dateRange) => {
    const key = `stats-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const params = new URLSearchParams();
      if (appId !== 'global') {
        params.append('appId', appId);
      }
      if (dateRange?.startDate) {
        params.append('startDate', dateRange.startDate.toISOString());
      }
      if (dateRange?.endDate) {
        params.append('endDate', dateRange.endDate.toISOString());
      }

      const url = `/api/partner/dashboard-stats${params.toString() ? `?${params.toString()}` : ''}`;

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
    const key = appId ? `activeCampaigns-${appId}` : 'activeCampaigns-all';
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const url = appId
        ? `/api/partner/active-campaigns?appId=${appId}`
        : '/api/partner/active-campaigns';
      const response = await fetch(url);
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
    const key = appId ? `webhookDeliveries-${appId}` : 'webhookDeliveries-all';
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const url = appId
        ? `/api/partner/webhook-deliveries?appId=${appId}&limit=10`
        : '/api/partner/webhook-deliveries?limit=10';
      const response = await fetch(url);
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

  fetchReferrals: async (appId, options = {}) => {
    const key = appId === 'platform' ? 'referrals-platform' : `referrals-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const params = new URLSearchParams();
      // Only add appId if it's not 'platform' (platform = all apps)
      if (appId && appId !== 'platform') {
        params.append('appId', appId);
      }
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.search) params.append('search', options.search);
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());

      const response = await fetch(`/api/partner/referrals?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        set({ referrals: data.referrals || [] });
        return {
          referrals: data.referrals || [],
          pagination: data.pagination,
        };
      }
      return { referrals: [] };
    } catch (error) {
      console.error('Error fetching referrals:', error);
      return { referrals: [] };
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchCampaigns: async (appId, options = {}) => {
    const key = `campaigns-${appId}`;
    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const params = new URLSearchParams();
      params.append('appId', appId);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.status) params.append('status', options.status);
      if (options.search) params.append('search', options.search);

      const response = await fetch(`/api/partner/campaigns?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const campaigns = data.campaigns || data || [];
        set({ campaigns: Array.isArray(campaigns) ? campaigns : [] });
        return {
          campaigns: Array.isArray(campaigns) ? campaigns : [],
          pagination: data.pagination,
        };
      }
      return { campaigns: [] };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return { campaigns: [] };
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
  contacts: ContactInquiry[];
  changelogs: Changelog[];
  blogs: Blog[];
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
  fetchContacts: (force?: boolean) => Promise<void>;
  fetchChangelogs: (force?: boolean) => Promise<void>;
  fetchBlogs: (force?: boolean) => Promise<void>;
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
  contacts: [],
  changelogs: [],
  blogs: [],
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
        // Store fraud stats if available
        if (data.stats) {
          // You can add stats to state if needed
        }
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

  fetchContacts: async (force = false) => {
    const key = 'contacts';
    if (!force && get().contacts.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/contacts');
      if (response.ok) {
        const data = await response.json();
        set({ contacts: Array.isArray(data) ? data : [] });
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchChangelogs: async (force = false) => {
    const key = 'changelogs';
    if (!force && get().changelogs.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/changelog');
      if (response.ok) {
        const data = await response.json();
        set({ changelogs: Array.isArray(data) ? data : [] });
      }
    } catch (error) {
      console.error('Error fetching changelogs:', error);
    } finally {
      set((state) => ({ isLoading: { ...state.isLoading, [key]: false } }));
    }
  },

  fetchBlogs: async (force = false) => {
    const key = 'blogs';
    if (!force && get().blogs.length > 0) return;

    set((state) => ({ isLoading: { ...state.isLoading, [key]: true } }));

    try {
      const response = await fetch('/api/admin/blogs');
      if (response.ok) {
        const data = await response.json();
        set({ blogs: Array.isArray(data) ? data : [] });
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
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
    } else if (key === 'contacts') {
      set({ contacts: [] });
    } else if (key === 'changelogs') {
      set({ changelogs: [] });
    } else if (key === 'blogs') {
      set({ blogs: [] });
    }
  },
}));

// ===== Theme Store =====

interface ThemeStore {
  theme: 'light' | 'dark';
  mounted: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',
  mounted: false,

  setTheme: (theme: 'light' | 'dark') => {
    console.log('[ThemeStore] setTheme called with:', theme);

    if (typeof window !== 'undefined') {
      const root = document.documentElement;

      // Update DOM FIRST for immediate visual feedback
      root.classList.remove('dark', 'light');

      if (theme === 'dark') {
        console.log('[ThemeStore] Adding dark class to documentElement');
        root.classList.add('dark');
      } else {
        console.log('[ThemeStore] Removing dark class from documentElement');
        root.classList.remove('dark');
      }

      // Update localStorage
      console.log('[ThemeStore] Setting localStorage theme to:', theme);
      localStorage.setItem('theme', theme);

      // Update state to trigger React re-renders
      set({ theme });

      // Dispatch custom event for any listeners
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));

      console.log('[ThemeStore] Current documentElement classes:', root.classList.toString());
    } else {
      // SSR: only update state
      set({ theme });
      console.log('[ThemeStore] Window is undefined, only updating state');
    }
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    console.log('[ThemeStore] toggleTheme called, current theme:', currentTheme);
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    console.log('[ThemeStore] Toggling to new theme:', newTheme);
    get().setTheme(newTheme);
  },

  initializeTheme: () => {
    if (typeof window === 'undefined') return;

    // Read from DOM (which was already set by the inline script in layout.tsx)
    const root = document.documentElement;
    const hasDarkClass = root.classList.contains('dark');

    // Sync state with what's already on the DOM
    const initialTheme = hasDarkClass ? 'dark' : 'light';
    set({ theme: initialTheme, mounted: true });
  },
}));
