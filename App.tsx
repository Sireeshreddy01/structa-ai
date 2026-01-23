/**
 * Structa AI - Main App Entry
 * AI-powered document scanner
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './app/navigation';
import { uploadManager } from './infra/upload';

export default function App() {
  useEffect(() => {
    // Initialize upload manager on app start
    uploadManager.initialize();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}
