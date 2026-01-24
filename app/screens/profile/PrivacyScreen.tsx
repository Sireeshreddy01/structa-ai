/**
 * Privacy Settings Screen
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, SectionTitle, ToggleRow, PreferenceRow, ActionButton } from './components';
import { PROFILE_COLORS } from './theme';

interface PrivacyScreenProps {
  onBack: () => void;
}

export function PrivacyScreen({ onBack }: PrivacyScreenProps) {
  const insets = useSafeAreaInsets();
  
  // Data settings
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  
  // Visibility settings
  const [profilePublic, setProfilePublic] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  const handleDownloadData = () => {
    Alert.alert(
      'Download Your Data',
      'We will prepare a copy of your data. This may take a few minutes. You will receive an email when it\'s ready.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Data', onPress: () => Alert.alert('Success', 'Data request submitted') },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your documents and account data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => Alert.alert('Confirm', 'Please contact support to complete this request'),
        },
      ]
    );
  };

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
        <ScreenHeader title="Privacy" onBack={onBack} />

        {/* Data Collection */}
        <View style={styles.section}>
          <SectionTitle title="Data Collection" />
          <View style={styles.toggleList}>
            <ToggleRow
              icon="analytics"
              label="Usage Analytics"
              description="Help us improve the app"
              value={analyticsEnabled}
              onToggle={setAnalyticsEnabled}
            />
            <ToggleRow
              icon="bug-report"
              label="Crash Reports"
              description="Automatically send crash reports"
              value={crashReports}
              onToggle={setCrashReports}
            />
            <ToggleRow
              icon="auto-awesome"
              label="Personalization"
              description="Personalized AI suggestions"
              value={personalization}
              onToggle={setPersonalization}
            />
          </View>
        </View>

        {/* Visibility */}
        <View style={styles.section}>
          <SectionTitle title="Visibility" />
          <View style={styles.toggleList}>
            <ToggleRow
              icon="public"
              label="Public Profile"
              description="Allow others to find you"
              value={profilePublic}
              onToggle={setProfilePublic}
            />
            <ToggleRow
              icon="history"
              label="Activity Status"
              description="Show when you're active"
              value={showActivity}
              onToggle={setShowActivity}
            />
          </View>
        </View>

        {/* Your Data */}
        <View style={styles.section}>
          <SectionTitle title="Your Data" />
          <View style={styles.toggleList}>
            <PreferenceRow
              icon="download"
              label="Download Your Data"
              onPress={handleDownloadData}
            />
            <PreferenceRow
              icon="policy"
              label="Privacy Policy"
              onPress={() => Alert.alert('Privacy Policy', 'Opening privacy policy...')}
            />
            <PreferenceRow
              icon="gavel"
              label="Terms of Service"
              onPress={() => Alert.alert('Terms of Service', 'Opening terms...')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <SectionTitle title="Danger Zone" />
          <ActionButton
            label="Delete All My Data"
            variant="danger"
            onPress={handleDeleteData}
          />
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
