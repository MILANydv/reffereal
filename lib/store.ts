import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface App {
  id: string;
  name: string;
  apiKey: string;
}

interface AppStore {
  selectedAppId: string | null;
  selectedApp: App | null;
  setSelectedApp: (app: App | null) => void;
  setSelectedAppId: (appId: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      selectedAppId: null,
      selectedApp: null,
      setSelectedApp: (app) => set({ selectedApp: app, selectedAppId: app?.id || null }),
      setSelectedAppId: (appId) => set({ selectedAppId: appId }),
    }),
    {
      name: 'app-storage',
    }
  )
);
