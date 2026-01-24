import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../../infra/api/client';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#F5F5F7',
  white: '#FFFFFF',
  black: '#111111',
  textPrimary: '#111111',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  accentCyan: '#E0F5FA',
  accentGreen: '#E3F7D8',
  accentYellow: '#FFF6D1',
  orange: '#F97316',
};

interface HomeScreenProps {
  onNavigateToCamera?: () => void;
  onNavigateToProfile?: () => void;
}

export function HomeScreen({ onNavigateToCamera, onNavigateToProfile }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('User');
  const [notificationCount] = useState(5);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      // Get user info from API or storage
      const userInfo = await apiClient.getUserInfo();
      if (userInfo?.name) {
        setUserName(userInfo.name.split(' ')[0]); // Get first name
      }
    } catch (error) {
      // Use default name if unable to fetch
    }
  };

  const ActionCard = ({
    icon,
    label,
    backgroundColor,
    iconStyle,
    onPress,
    hasBorder = false,
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
    backgroundColor: string;
    iconStyle?: 'dashed' | 'solid';
    onPress?: () => void;
    hasBorder?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.actionCard,
        { backgroundColor },
        hasBorder && styles.actionCardBorder,
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, iconStyle === 'dashed' && styles.iconDashed]}>
        <MaterialIcons name={icon} size={28} color={COLORS.black} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        {/* Help Button */}
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="help-outline" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* Notification Button */}
        <TouchableOpacity style={styles.headerButton}>
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{notificationCount}</Text>
            </View>
          )}
          <MaterialIcons name="notifications-none" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingName}>Hi {userName},</Text>
          <Text style={styles.greetingQuestion}>How can I help</Text>
          <Text style={styles.greetingQuestion}>you today?</Text>
        </View>

        {/* Action Cards Grid */}
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="center-focus-strong"
            label="Scan"
            backgroundColor={COLORS.accentCyan}
            iconStyle="dashed"
            onPress={onNavigateToCamera}
          />
          <ActionCard
            icon="edit"
            label="Edit"
            backgroundColor={COLORS.white}
            hasBorder
          />
          <ActionCard
            icon="transform"
            label="Convert"
            backgroundColor={COLORS.accentGreen}
          />
          <ActionCard
            icon="smart-toy"
            label="Ask AI"
            backgroundColor={COLORS.accentYellow}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask or search for anything"
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.micButton}>
            <MaterialIcons name="mic" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 16 }]}>
        {/* Left Pill Nav */}
        <View style={styles.navPill}>
          <TouchableOpacity style={styles.navPillButtonActive}>
            <MaterialIcons name="layers" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navPillButton} onPress={onNavigateToProfile}>
            <MaterialIcons name="person-outline" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
          <MaterialIcons name="add" size={32} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Home Indicator */}
      <View style={[styles.homeIndicator, { bottom: insets.bottom + 4 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  notificationText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  greetingSection: {
    marginBottom: 32,
  },
  greetingName: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    lineHeight: 44,
  },
  greetingQuestion: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: -1,
    lineHeight: 44,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    width: (width - 48 - 16) / 2,
    aspectRatio: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  actionCardBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDashed: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.black,
  },
  actionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  homeIndicator: {
    position: 'absolute',
    left: '50%',
    marginLeft: -64,
    width: 128,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.black,
    opacity: 0.2,
  },
});

export default HomeScreen;
