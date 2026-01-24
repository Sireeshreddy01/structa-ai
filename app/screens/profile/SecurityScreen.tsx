/**
 * Security Settings Screen
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

interface SecurityScreenProps {
  onBack: () => void;
  onChangePassword: () => void;
}

export function SecurityScreen({ onBack, onChangePassword }: SecurityScreenProps) {
  const insets = useSafeAreaInsets();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const handleTwoFactorToggle = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'You will receive a verification code via SMS or authenticator app when logging in.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => setTwoFactorEnabled(true) },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
    }
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
        <ScreenHeader title="Security" onBack={onBack} />

        {/* Password Section */}
        <View style={styles.section}>
          <SectionTitle title="Password" />
          <PreferenceRow
            icon="vpn-key"
            label="Change Password"
            value="••••••••"
            onPress={onChangePassword}
          />
        </View>

        {/* Authentication Section */}
        <View style={styles.section}>
          <SectionTitle title="Authentication" />
          <View style={styles.toggleList}>
            <ToggleRow
              icon="security"
              label="Two-Factor Authentication"
              description="Add an extra layer of security"
              value={twoFactorEnabled}
              onToggle={handleTwoFactorToggle}
            />
            <ToggleRow
              icon="fingerprint"
              label="Biometric Login"
              description="Use Face ID or Touch ID"
              value={biometricEnabled}
              onToggle={setBiometricEnabled}
            />
          </View>
        </View>

        {/* Login Activity Section */}
        <View style={styles.section}>
          <SectionTitle title="Login Activity" />
          <View style={styles.toggleList}>
            <ToggleRow
              icon="notifications-active"
              label="Login Alerts"
              description="Get notified of new logins"
              value={loginAlerts}
              onToggle={setLoginAlerts}
            />
            <PreferenceRow
              icon="devices"
              label="Active Sessions"
              value="2 devices"
              onPress={() => Alert.alert('Active Sessions', 'Manage your active sessions')}
            />
          </View>
        </View>

        {/* Security Actions */}
        <View style={styles.section}>
          <SectionTitle title="Security Actions" />
          <View style={styles.actionButtons}>
            <ActionButton
              label="Log Out All Devices"
              variant="outline"
              onPress={() => Alert.alert('Log Out', 'Log out from all other devices?')}
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
  actionButtons: {
    gap: 12,
  },
});
