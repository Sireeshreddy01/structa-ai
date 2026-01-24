import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../../infra/api/client';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#FAFAFA',
  white: '#FFFFFF',
  black: '#111111',
  textPrimary: '#111111',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  accentBlue: 'rgba(191, 219, 254, 0.6)',
  accentYellow: 'rgba(254, 240, 138, 0.6)',
  accentGreen: 'rgba(187, 247, 208, 0.6)',
  accentPurple: 'rgba(221, 214, 254, 0.6)',
  iconBg: '#F9FAFB',
  redLight: '#FEF2F2',
  red: '#EF4444',
};

interface ProfileScreenProps {
  onNavigateToHome?: () => void;
  onLogout?: () => void;
}

export function ProfileScreen({ onNavigateToHome, onLogout }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('User');
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfo = await apiClient.getUserInfo();
      if (userInfo?.name) {
        setUserName(userInfo.name);
      }
    } catch (error) {
      // Use default name
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await apiClient.logout();
            onLogout?.();
          }
        },
      ]
    );
  };

  const SettingsCard = ({
    icon,
    label,
    backgroundColor,
    onPress,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    backgroundColor: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.settingsCard, { backgroundColor }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={28} color={COLORS.black} />
      <Text style={styles.settingsCardLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const PreferenceRow = ({
    icon,
    label,
    onPress,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.preferenceRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.preferenceLeft}>
        <View style={styles.preferenceIconContainer}>
          <MaterialIcons name={icon} size={20} color={COLORS.black} />
        </View>
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={COLORS.border} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 16, paddingBottom: 140 }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {userImage ? (
                <Image source={{ uri: userImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={48} color={COLORS.textMuted} />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{userName}</Text>
          <TouchableOpacity>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Cards Grid */}
        <View style={styles.settingsGrid}>
          <SettingsCard
            icon="person"
            label="Account"
            backgroundColor={COLORS.accentBlue}
          />
          <SettingsCard
            icon="lock"
            label="Security"
            backgroundColor={COLORS.accentYellow}
          />
          <SettingsCard
            icon="notifications"
            label="Notifications"
            backgroundColor={COLORS.accentGreen}
          />
          <SettingsCard
            icon="extension"
            label="Connected Apps"
            backgroundColor={COLORS.accentPurple}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.preferencesList}>
            <PreferenceRow icon="vpn-key" label="Change Password" />
            <PreferenceRow icon="ios-share" label="Default Export Format" />
            <PreferenceRow icon="shield" label="Privacy Settings" />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 16 }]}>
        {/* Left Pill Nav */}
        <View style={styles.navPill}>
          <TouchableOpacity style={styles.navPillButton} onPress={onNavigateToHome}>
            <MaterialIcons name="layers" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navPillButtonActive}>
            <MaterialIcons name="person" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
          <MaterialIcons name="add" size={32} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: COLORS.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  settingsCard: {
    width: (width - 48 - 16) / 2,
    height: 128,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
  },
  settingsCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  preferencesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginLeft: 4,
    marginBottom: 16,
  },
  preferencesList: {
    gap: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  preferenceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
  },
  logoutButton: {
    backgroundColor: COLORS.redLight,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.red,
  },
  bottomNav: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  navPill: {
    flexDirection: 'row',
    backgroundColor: COLORS.black,
    borderRadius: 32,
    padding: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  navPillButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navPillButtonActive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default ProfileScreen;
