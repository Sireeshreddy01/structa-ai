/**
 * Structa AI - Main App Entry
 * AI-powered document scanner
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './app/navigation';
import { uploadManager } from './infra/upload';
import { registerBackgroundTasks } from './infra/background';
import {
  useAppLifecycle,
  performBackgroundCleanup,
  performForegroundRestore,
} from './infra/lifecycle';
import { useNetworkState } from './infra/network';

export default function App() {
  const { isOffline } = useNetworkState();

  // Handle app lifecycle events
  useAppLifecycle({
    onForeground: () => {
      performForegroundRestore();
      uploadManager.initialize(); // Resume uploads
    },
    onBackground: () => {
      performBackgroundCleanup();
    },
  });

  useEffect(() => {
    // Initialize on app start
    const init = async () => {
      await uploadManager.initialize();
      await registerBackgroundTasks();
    };
    init();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}
