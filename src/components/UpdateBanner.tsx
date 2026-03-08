'use client';

import { useEffect, useState } from 'react';
import { onSWUpdate, acceptUpdate, registerServiceWorker, enableAutoUpdateOnFocus } from '@/lib/sw';
import type { SWUpdateEvent } from '@/lib/sw';

/**
 * UpdateBanner Component
 * 
 * Shows notification when app update is available
 * Lets user install update immediately
 */
export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('[UpdateBanner] SW registered, listening for updates');
      }
    });

    // Enable update check on focus
    enableAutoUpdateOnFocus();

    // Listen for SW update events
    const unsubscribe = onSWUpdate((event: SWUpdateEvent) => {
      if (event.type === 'update-available') {
        console.log('[UpdateBanner] Update available!');
        setUpdateAvailable(true);
      } else if (event.type === 'update-activated') {
        console.log('[UpdateBanner] Update activated, clearing state');
        setUpdateAvailable(false);
      }
    });

    return unsubscribe;
  }, []);

  if (!updateAvailable) return null;

  const handleInstall = () => {
    setIsInstalling(true);
    acceptUpdate();
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-top">
      <div className="bg-[var(--accent)] rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✨</span>
          <div className="flex-1">
            <p className="font-semibold text-sm text-white">Update Available</p>
            <p className="text-xs text-white/80 mt-1">
              A new version of CycleCoach is ready. Reload to get the latest features and fixes.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            disabled={isInstalling}
            className="text-white/60 hover:text-white text-lg leading-none transition-colors disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 bg-white text-[var(--accent)] px-3 py-2 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isInstalling ? 'Updating...' : 'Update Now'}
          </button>
          <button
            onClick={handleDismiss}
            disabled={isInstalling}
            className="px-3 py-2 bg-white/20 text-white rounded-lg font-medium text-sm hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
