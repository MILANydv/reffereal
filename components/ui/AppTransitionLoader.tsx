'use client';

interface AppTransitionLoaderProps {
  appName?: string;
}

export function AppTransitionLoader({ appName }: AppTransitionLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
        </div>
        {appName && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading {appName}...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fetching app data
            </p>
          </div>
        )}
        {!appName && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading...
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Switching applications
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
