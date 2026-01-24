/**
 * Profile Screen with internal navigation to sub-screens
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../../infra/api/client';
import { PROFILE_COLORS } from './theme';

// Sub-screens
import { AccountScreen } from './AccountScreen';
import { SecurityScreen } from './SecurityScreen';
import { NotificationsScreen } from './NotificationsScreen';
import { ConnectedAppsScreen } from './ConnectedAppsScreen';
import { ChangePasswordScreen } from './ChangePasswordScreen';
import { ExportFormatScreen } from './ExportFormatScreen';
import { PrivacyScreen } from './PrivacyScreen';

const { width } = Dimensions.get('window');

type SubScreen = 
  | 'main'
  | 'account'
  | 'security'
  | 'notifications'
  | 'connectedApps'
  | 'changePassword'
  | 'exportFormat'
  | 'privacy';

interface ProfileScreenProps {
  onNavigateToHome?: () => void;
  onLogout?: () => void;
}

export function ProfileScreen({ onNavigateToHome, onLogout }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('User');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<SubScreen>('main');
  
  // Animation for screen transitions
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  const navigateTo = (screen: SubScreen) => {
    // Animate out
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen(screen);
      slideAnim.setValue(width);
      // Animate in
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    });
  };

  const goBack = () => {
    navigateTo('main');
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

  // Render sub-screen based on current state
  const renderSubScreen = () => {
    switch (currentScreen) {
      case 'account':
        return <AccountScreen onBack={goBack} />;
      case 'security':
        return <SecurityScreen onBack={goBack} onChangePassword={() => navigateTo('changePassword')} />;
      case 'notifications':
        return <NotificationsScreen onBack={goBack} />;
      case 'connectedApps':
        return <ConnectedAppsScreen onBack={goBack} />;
      case 'changePassword':
        return <ChangePasswordScreen onBack={goBack} />;
      case 'exportFormat':
        return <ExportFormatScreen onBack={goBack} />;
      case 'privacy':
        return <PrivacyScreen onBack={goBack} />;
      default:
        return null;
    }
  };

  // Main settings screen content
  const renderMainScreen = () => (
    <>
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
                  <MaterialIcons name="person" size={48} color={PROFILE_COLORS.textMuted} />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={14} color={PROFILE_COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{userName}</Text>
          <TouchableOpacity onPress={() => navigateTo('account')}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Cards Grid */}
        <View style={styles.settingsGrid}>
          <SettingsCard
            icon="person"
            label="Account"
            backgroundColor={PROFILE_COLORS.accentBlue}
            onPress={() => navigateTo('account')}
          />
          <SettingsCard
            icon="lock"
            label="Security"
            backgroundColor={PROFILE_COLORS.accentYellow}
            onPress={() => navigateTo('security')}
          />
          <SettingsCard
            icon="notifications"
            label="Notifications"
            backgroundColor={PROFILE_COLORS.accentGreen}
            onPress={() => navigateTo('notifications')}
          />
          <SettingsCard
            icon="extension"
            label="Connected Apps"
            backgroundColor={PROFILE_COLORS.accentPurple}
            onPress={() => navigateTo('connectedApps')}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.preferencesList}>
            <PreferenceRow
              icon="vpn-key"
              label="Change Password"
              onPress={() => navigateTo('changePassword')}
            />
            <PreferenceRow
              icon="ios-share"
              label="Default Export Format"
              onPress={() => navigateTo('exportFormat')}
            />
            <PreferenceRow
              icon="shield"
              label="Privacy Settings"
              onPress={() => navigateTo('privacy')}
            />
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
        <View style={styles.navPill}>
          <TouchableOpacity style={styles.navPillButton} onPress={onNavigateToHome}>
            <MaterialIcons name="layers" size={22} color={PROFILE_COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navPillButtonActive}>
            <MaterialIcons name="person" size={22} color={PROFILE_COLORS.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
          <MaterialIcons name="add" size={32} color={PROFILE_COLORS.white} />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {currentScreen === 'main' ? (
        renderMainScreen()
      ) : (
        <Animated.View 
          style={[
            styles.subScreenContainer,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          {renderSubScreen()}
        </Animated.View>
      )}
    </View>
  );
}

// ============================================
// Local Components
// ============================================

function SettingsCard({
  icon,
  label,
  backgroundColor,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  backgroundColor: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.settingsCard, { backgroundColor }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <MaterialIcons name={icon} size={28} color={PROFILE_COLORS.black} />
      <Text style={styles.settingsCardLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function PreferenceRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.preferenceRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.preferenceLeft}>
        <View style={styles.preferenceIconContainer}>
          <MaterialIcons name={icon} size={20} color={PROFILE_COLORS.black} />
        </View>
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={PROFILE_COLORS.border} />
    </TouchableOpacity>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  subScreenContainer: {
    flex: 1,
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
    color: PROFILE_COLORS.black,
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
    borderColor: PROFILE_COLORS.white,
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
    backgroundColor: PROFILE_COLORS.border,
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
    backgroundColor: PROFILE_COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PROFILE_COLORS.white,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: PROFILE_COLORS.black,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.textSecondary,
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
    color: PROFILE_COLORS.black,
    letterSpacing: 0.3,
  },
  preferencesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PROFILE_COLORS.textMuted,
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
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
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
    backgroundColor: PROFILE_COLORS.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.black,
  },
  logoutButton: {
    backgroundColor: PROFILE_COLORS.redLight,
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
    color: PROFILE_COLORS.red,
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
    backgroundColor: PROFILE_COLORS.black,
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
    backgroundColor: PROFILE_COLORS.black,
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
