/**
 * Connected Apps Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, SectionTitle } from './components';
import { PROFILE_COLORS } from './theme';

interface ConnectedApp {
  id: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  connected: boolean;
  description: string;
}

interface ConnectedAppsScreenProps {
  onBack: () => void;
}

export function ConnectedAppsScreen({ onBack }: ConnectedAppsScreenProps) {
  const insets = useSafeAreaInsets();
  
  const [apps, setApps] = useState<ConnectedApp[]>([
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: 'cloud',
      color: '#4285F4',
      connected: true,
      description: 'Sync your documents',
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: 'cloud-queue',
      color: '#0061FF',
      connected: false,
      description: 'Backup to Dropbox',
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: 'cloud-circle',
      color: '#0078D4',
      connected: false,
      description: 'Microsoft cloud storage',
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: 'description',
      color: '#000000',
      connected: true,
      description: 'Export to Notion pages',
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: 'tag',
      color: '#4A154B',
      connected: false,
      description: 'Share to Slack channels',
    },
  ]);

  const toggleConnection = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    if (app.connected) {
      Alert.alert(
        'Disconnect App',
        `Are you sure you want to disconnect ${app.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => {
              setApps(prev =>
                prev.map(a =>
                  a.id === appId ? { ...a, connected: false } : a
                )
              );
            },
          },
        ]
      );
    } else {
      // Simulate connecting
      Alert.alert(
        'Connect App',
        `Connect to ${app.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => {
              setApps(prev =>
                prev.map(a =>
                  a.id === appId ? { ...a, connected: true } : a
                )
              );
            },
          },
        ]
      );
    }
  };

  const connectedApps = apps.filter(a => a.connected);
  const availableApps = apps.filter(a => !a.connected);

  const AppRow = ({ app }: { app: ConnectedApp }) => (
    <TouchableOpacity
      style={styles.appRow}
      activeOpacity={0.7}
      onPress={() => toggleConnection(app.id)}
    >
      <View style={styles.appLeft}>
        <View style={[styles.appIcon, { backgroundColor: app.color + '15' }]}>
          <MaterialIcons name={app.icon} size={24} color={app.color} />
        </View>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{app.name}</Text>
            <Text style={styles.appDescription}>{app.description}</Text>
          </View>
      </View>
      <View style={[
        styles.statusBadge,
        app.connected ? styles.connectedBadge : styles.connectBadge
      ]}>
        <Text style={[
          styles.statusText,
          app.connected ? styles.connectedText : styles.connectText
        ]}>
          {app.connected ? 'Connected' : 'Connect'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Connected Apps" onBack={onBack} />

        {/* Connected Apps */}
        {connectedApps.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Connected" />
            <View style={styles.appList}>
              {connectedApps.map(app => (
                <AppRow key={app.id} app={app} />
              ))}
            </View>
          </View>
        )}

        {/* Available Apps */}
        {availableApps.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Available Integrations" />
            <View style={styles.appList}>
              {availableApps.map(app => (
                <AppRow key={app.id} app={app} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  appList: {
    gap: 12,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
  },
  appLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: PROFILE_COLORS.black,
    marginBottom: 2,
  },
  appDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: PROFILE_COLORS.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connectedBadge: {
    backgroundColor: PROFILE_COLORS.successLight,
  },
  connectBadge: {
    backgroundColor: PROFILE_COLORS.iconBg,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectedText: {
    color: PROFILE_COLORS.success,
  },
  connectText: {
    color: PROFILE_COLORS.textSecondary,
  },
});
