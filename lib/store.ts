import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface App {
  id: string;
  name: string;
  apiKey: string;
  status: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  totalReferrals: number;
}

interface PartnerStore {
  // Navigation / Selection State
  selectedAppId: string | null;
  selectedApp: App | null;

  // Data State
  apps: App[];
  campaigns: Campaign[];
  stats: any | null;

  // UI State
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setSelectedApp: (app: App | null) => void;
  setSelectedAppId: (appId: string | null) => void;
  setApps: (apps: App[]) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setStats: (stats: any) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

export const usePartnerStore = create<PartnerStore>()(
  persist(
    (set, get) => ({
      selectedAppId: null,
      selectedApp: null,
      apps: [],
      campaigns: [],
      stats: null,
      isLoading: false,
      isInitialized: false,

      setSelectedApp: (app) => set({ selectedApp: app, selectedAppId: app?.id || null }),
      setSelectedAppId: (appId) => {
        const app = get().apps.find(a => a.id === appId) || null;
        set({ selectedApp: app, selectedAppId: appId });
      },
      setApps: (apps) => set({ apps }),
      setCampaigns: (campaigns) => set({ campaigns }),
      setStats: (stats) => set({ stats }),
      setLoading: (loading) => set({ isLoading: loading }),

      initialize: async () => {
        if (get().isInitialized && get().apps.length > 0) return;

        set({ isLoading: true });
        try {
          const response = await fetch('/api/partner/apps');
          if (response.ok) {
            const apps = await response.json();
            set({ apps, isInitialized: true });

            // Auto-select first app if none selected
            if (!get().selectedAppId && apps.length > 0) {
              set({ selectedApp: apps[0], selectedAppId: apps[0].id });
            }
          }
        } catch (error) {
          console.error('Failed to initialize partner store:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'partner-storage',
      partialize: (state) => ({
        selectedAppId: state.selectedAppId,
        selectedApp: state.selectedApp
      }),
    }
  )
);

// Backward compatibility or legacy support if needed
export const useAppStore = usePartnerStore;
