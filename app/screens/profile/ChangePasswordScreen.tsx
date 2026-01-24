/**
 * Change Password Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, ActionButton } from './components';
import { PROFILE_COLORS } from './theme';

interface ChangePasswordScreenProps {
  onBack: () => void;
}

export function ChangePasswordScreen({ onBack }: ChangePasswordScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return checks;
  };

  const checks = validatePassword(newPassword);
  const allChecksPassed = Object.values(checks).every(Boolean);

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!allChecksPassed) {
      Alert.alert('Error', 'Please meet all password requirements');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label,
    value,
    onChangeText,
    show,
    onToggleShow,
    placeholder,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    show: boolean;
    onToggleShow: () => void;
    placeholder: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="lock-outline" size={20} color={PROFILE_COLORS.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={PROFILE_COLORS.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleShow}>
          <MaterialIcons
            name={show ? 'visibility' : 'visibility-off'}
            size={20}
            color={PROFILE_COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const CheckItem = ({ label, passed }: { label: string; passed: boolean }) => (
    <View style={styles.checkItem}>
      <MaterialIcons
        name={passed ? 'check-circle' : 'radio-button-unchecked'}
        size={18}
        color={passed ? PROFILE_COLORS.success : PROFILE_COLORS.textMuted}
      />
      <Text style={[styles.checkLabel, passed && styles.checkLabelPassed]}>
        {label}
      </Text>
    </View>
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
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader title="Change Password" onBack={onBack} />

        <View style={styles.form}>
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(!showCurrent)}
            placeholder="Enter current password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew(!showNew)}
            placeholder="Enter new password"
          />

          {/* Password Requirements */}
          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>Password must contain:</Text>
            <View style={styles.checkList}>
              <CheckItem label="At least 8 characters" passed={checks.length} />
              <CheckItem label="One uppercase letter" passed={checks.uppercase} />
              <CheckItem label="One lowercase letter" passed={checks.lowercase} />
              <CheckItem label="One number" passed={checks.number} />
              <CheckItem label="One special character" passed={checks.special} />
            </View>
          </View>

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
            placeholder="Confirm new password"
          />
        </View>

        <ActionButton
          label={loading ? 'Changing...' : 'Change Password'}
          onPress={handleChangePassword}
          disabled={loading || !allChecksPassed || newPassword !== confirmPassword}
        />
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
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: PROFILE_COLORS.textPrimary,
    paddingVertical: 14,
  },
  requirements: {
    backgroundColor: PROFILE_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.borderLight,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: PROFILE_COLORS.textSecondary,
    marginBottom: 12,
  },
  checkList: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: PROFILE_COLORS.textMuted,
  },
  checkLabelPassed: {
    color: PROFILE_COLORS.success,
  },
});
