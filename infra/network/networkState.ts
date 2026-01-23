/**
 * Network State Manager
 * Monitors network connectivity for offline support
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  isWifi: boolean;
  isCellular: boolean;
}

export interface UseNetworkStateResult {
  network: NetworkState;
  isOffline: boolean;
  refresh: () => Promise<void>;
}

const initialState: NetworkState = {
  isConnected: true,
  isInternetReachable: null,
  type: NetInfoStateType.unknown,
  isWifi: false,
  isCellular: false,
};

/**
 * Hook to monitor network connectivity
 */
export function useNetworkState(): UseNetworkStateResult {
  const [network, setNetwork] = useState<NetworkState>(initialState);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    
    // Initial fetch
    NetInfo.fetch().then(handleNetworkChange);

    return () => unsubscribe();
  }, []);

  const handleNetworkChange = useCallback((state: NetInfoState) => {
    setNetwork({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === NetInfoStateType.wifi,
      isCellular: state.type === NetInfoStateType.cellular,
    });
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
  }, [handleNetworkChange]);

  return {
    network,
    isOffline: !network.isConnected || network.isInternetReachable === false,
    refresh,
  };
}

/**
 * Check if currently connected (one-time check)
 */
export async function checkNetworkConnection(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
}

/**
 * Wait for network connection with timeout
 */
export async function waitForConnection(
  timeoutMs: number = 30000
): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });

    // Check immediately
    NetInfo.fetch().then((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
}
