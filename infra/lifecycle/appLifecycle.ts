/**
 * App Lifecycle Manager
 * Handles app state changes and lifecycle events
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export type AppLifecycleState = 'active' | 'background' | 'inactive';

export interface UseAppLifecycleOptions {
  onForeground?: () => void;
  onBackground?: () => void;
  onInactive?: () => void;
}

/**
 * Hook to track app lifecycle state changes
 */
export function useAppLifecycle(options: UseAppLifecycleOptions = {}) {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const { onForeground, onBackground, onInactive } = options;

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const prevState = appState.current;

      // Came to foreground
      if (prevState.match(/inactive|background/) && nextAppState === 'active') {
        onForeground?.();
      }

      // Went to background
      if (prevState === 'active' && nextAppState === 'background') {
        onBackground?.();
      }

      // Became inactive (iOS only - when receiving call, etc.)
      if (nextAppState === 'inactive') {
        onInactive?.();
      }

      appState.current = nextAppState;
    },
    [onForeground, onBackground, onInactive]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

  return {
    currentState: appState.current as AppLifecycleState,
    isActive: appState.current === 'active',
    isBackground: appState.current === 'background',
  };
}

/**
 * Perform cleanup when app goes to background
 */
export async function performBackgroundCleanup(): Promise<void> {
  // Save any pending state
  console.log('[Lifecycle] Performing background cleanup');
  
  // Future: Flush pending analytics, save drafts, etc.
}

/**
 * Perform restoration when app comes to foreground
 */
export async function performForegroundRestore(): Promise<void> {
  console.log('[Lifecycle] Performing foreground restore');
  
  // Future: Refresh data, check for updates, etc.
}
