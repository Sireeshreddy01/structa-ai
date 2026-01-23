/**
 * Offline Banner Component
 * Shows when the device is offline
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkState } from '../../infra/network';

export function OfflineBanner() {
  const { isOffline } = useNetworkState();

  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>📵 No internet connection</Text>
      <Text style={styles.subtext}>Your scans will be uploaded when online</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#1a1a2e',
    fontSize: 14,
    fontWeight: '600',
  },
  subtext: {
    color: '#1a1a2e',
    fontSize: 12,
    opacity: 0.8,
  },
});
