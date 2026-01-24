/**
 * Notifications Screen - View all notifications
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  accentBlue: '#DBEAFE',
  accentGreen: '#DCFCE7',
  accentYellow: '#FEF3C7',
  accentPurple: '#EDE9FE',
  accentRed: '#FEE2E2',
  accentCyan: '#CFFAFE',
  blue: '#3B82F6',
  green: '#22C55E',
  orange: '#F97316',
  purple: '#8B5CF6',
  red: '#EF4444',
  unreadDot: '#3B82F6',
};

// Notification type configurations
const NOTIFICATION_TYPES: Record<string, { 
  icon: keyof typeof MaterialIcons.glyphMap; 
  color: string; 
  bg: string 
}> = {
  scan_complete: { icon: 'check-circle', color: COLORS.green, bg: COLORS.accentGreen },
  export_ready: { icon: 'file-download', color: COLORS.blue, bg: COLORS.accentBlue },
  share: { icon: 'share', color: COLORS.purple, bg: COLORS.accentPurple },
  reminder: { icon: 'schedule', color: COLORS.orange, bg: COLORS.accentYellow },
  security: { icon: 'security', color: COLORS.red, bg: COLORS.accentRed },
  update: { icon: 'system-update', color: COLORS.blue, bg: COLORS.accentBlue },
  tip: { icon: 'lightbulb', color: COLORS.orange, bg: COLORS.accentYellow },
  welcome: { icon: 'celebration', color: COLORS.purple, bg: COLORS.accentPurple },
};

interface Notification {
  id: string;
  type: keyof typeof NOTIFICATION_TYPES;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  action?: {
    label: string;
    onPress?: () => void;
  };
}

interface NotificationsPanelProps {
  onBack: () => void;
}

export function NotificationsPanel({ onBack }: NotificationsPanelProps) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'scan_complete',
      title: 'Scan Complete',
      message: 'Your document "Invoice #2024-001" has been processed successfully.',
      time: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
      read: false,
      action: { label: 'View' },
    },
    {
      id: '2',
      type: 'export_ready',
      title: 'Export Ready',
      message: 'Your PDF export is ready to download.',
      time: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
      read: false,
      action: { label: 'Download' },
    },
    {
      id: '3',
      type: 'share',
      title: 'Document Shared',
      message: 'John Doe shared "Contract Agreement" with you.',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
    },
    {
      id: '4',
      type: 'tip',
      title: 'Pro Tip',
      message: 'Did you know? You can use AI to extract tables from your documents automatically.',
      time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      read: true,
    },
    {
      id: '5',
      type: 'security',
      title: 'New Login Detected',
      message: 'A new login was detected from iPhone 15 Pro in New York.',
      time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
    },
    {
      id: '6',
      type: 'update',
      title: 'App Updated',
      message: 'Structa AI has been updated to version 2.5.0 with new features.',
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
    },
    {
      id: '7',
      type: 'reminder',
      title: 'Document Expiring',
      message: 'Your passport scan expires in 30 days. Consider updating it.',
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
    },
    {
      id: '8',
      type: 'welcome',
      title: 'Welcome to Structa AI!',
      message: 'Start by scanning your first document. We\'re here to help!',
      time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      read: true,
    },
  ]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const unreadCount = notifications.filter(n => !n.read).length;

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const now = new Date();
    const notifDate = notification.time;
    const diffDays = Math.floor((now.getTime() - notifDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let group: string;
    if (diffDays === 0) group = 'Today';
    else if (diffDays === 1) group = 'Yesterday';
    else if (diffDays < 7) group = 'This Week';
    else group = 'Earlier';

    if (!groups[group]) groups[group] = [];
    groups[group].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const typeInfo = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.tip;
    const swipeAnim = useRef(new Animated.Value(0)).current;

    return (
      <Animated.View style={[styles.notificationItem, !notification.read && styles.unreadItem]}>
        <TouchableOpacity
          style={styles.notificationContent}
          activeOpacity={0.7}
          onPress={() => markAsRead(notification.id)}
        >
          {/* Icon */}
          <View style={[styles.notificationIcon, { backgroundColor: typeInfo.bg }]}>
            <MaterialIcons name={typeInfo.icon} size={22} color={typeInfo.color} />
          </View>

          {/* Content */}
          <View style={styles.notificationText}>
            <View style={styles.notificationHeader}>
              <Text style={[styles.notificationTitle, !notification.read && styles.unreadTitle]}>
                {notification.title}
              </Text>
              <Text style={styles.notificationTime}>{formatTime(notification.time)}</Text>
            </View>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            {notification.action && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{notification.action.label}</Text>
                <MaterialIcons name="arrow-forward" size={14} color={COLORS.blue} />
              </TouchableOpacity>
            )}
          </View>

          {/* Unread Indicator */}
          {!notification.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Animated Header Background */}
      <Animated.View style={[styles.headerBg, { opacity: headerOpacity, paddingTop: insets.top }]} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={markAllAsRead}
        >
          <MaterialIcons name="done-all" size={22} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={markAllAsRead}>
            <MaterialIcons name="done-all" size={16} color={COLORS.textSecondary} />
            <Text style={styles.quickActionText}>Mark all read</Text>
          </TouchableOpacity>
          <View style={styles.quickActionDivider} />
          <TouchableOpacity style={styles.quickAction} onPress={clearAll}>
            <MaterialIcons name="delete-sweep" size={16} color={COLORS.textSecondary} />
            <Text style={styles.quickActionText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 }
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.black}
          />
        }
      >
        {notifications.length > 0 ? (
          Object.entries(groupedNotifications).map(([group, items]) => (
            <View key={group} style={styles.group}>
              <Text style={styles.groupTitle}>{group}</Text>
              <View style={styles.groupItems}>
                {items.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="notifications-none" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any notifications right now.
            </Text>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  unreadBadge: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 16,
    zIndex: 2,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  quickActionDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  groupItems: {
    gap: 12,
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  unreadItem: {
    backgroundColor: '#F8FAFF',
    borderColor: COLORS.accentBlue,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.blue,
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.unreadDot,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsPanel;
