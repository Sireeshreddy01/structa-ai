/**
 * Notifications Settings Screen
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, SectionTitle, ToggleRow } from './components';
import { PROFILE_COLORS } from './theme';

interface NotificationsScreenProps {
  onBack: () => void;
}

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const insets = useSafeAreaInsets();
  
  // Push notifications
  const [pushEnabled, setPushEnabled] = useState(true);
  const [scanComplete, setScanComplete] = useState(true);
  const [exportReady, setExportReady] = useState(true);
  const [shareReceived, setShareReceived] = useState(true);
  
  // Email notifications
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [productUpdates, setProductUpdates] = useState(true);
  const [tips, setTips] = useState(true);

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
        <ScreenHeader title="Notifications" onBack={onBack} />

        {/* Push Notifications */}
        <View style={styles.section}>
          <SectionTitle title="Push Notifications" />
          <View style={styles.toggleList}>
            <ToggleRow
              icon="notifications"
              label="Push Notifications"
              description="Enable all push notifications"
              value={pushEnabled}
              onToggle={setPushEnabled}
            />
            <ToggleRow
              icon="check-circle"
              label="Scan Complete"
              description="When document scanning finishes"
              value={scanComplete}
              onToggle={setScanComplete}
            />
            <ToggleRow
              icon="file-download"
              label="Export Ready"
              description="When export is ready to download"
              value={exportReady}
              onToggle={setExportReady}
            />
            <ToggleRow
              icon="share"
              label="Shared Documents"
              description="When someone shares a document"
              value={shareReceived}
              onToggle={setShareReceived}
            />
          </View>
        </View>

        {/* Email Notifications */}
        <View style={styles.section}>
          <SectionTitle title="Email Notifications" />
          <View style={styles.toggleList}>
            <ToggleRow
              icon="email"
              label="Email Notifications"
              description="Enable all email notifications"
              value={emailEnabled}
              onToggle={setEmailEnabled}
            />
            <ToggleRow
              icon="summarize"
              label="Weekly Digest"
              description="Summary of your weekly activity"
              value={weeklyDigest}
              onToggle={setWeeklyDigest}
            />
            <ToggleRow
              icon="campaign"
              label="Product Updates"
              description="New features and improvements"
              value={productUpdates}
              onToggle={setProductUpdates}
            />
            <ToggleRow
              icon="lightbulb"
              label="Tips & Tutorials"
              description="Learn how to use Structa AI"
              value={tips}
              onToggle={setTips}
            />
          </View>
        </View>
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
  toggleList: {
    gap: 12,
  },
});
