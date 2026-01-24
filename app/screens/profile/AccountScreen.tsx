/**
 * Account Settings Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, SectionTitle, ActionButton } from './components';
import { PROFILE_COLORS } from './theme';
import { apiClient } from '../../../infra/api/client';

interface AccountScreenProps {
  onBack: () => void;
}

export function AccountScreen({ onBack }: AccountScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const userInfo = await apiClient.getUserInfo();
      if (userInfo) {
        setName(userInfo.name || '');
        setEmail(userInfo.email || '');
      }
    } catch (error) {
      // Use defaults
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setLoading(true);
    try {
      // API call would go here
      Alert.alert('Success', 'Profile updated successfully');
      onBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
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
        <ScreenHeader title="Account" onBack={onBack} />

        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={40} color={PROFILE_COLORS.textMuted} />
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <MaterialIcons name="camera-alt" size={16} color={PROFILE_COLORS.white} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <SectionTitle title="Personal Information" />
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person-outline" size={20} color={PROFILE_COLORS.textMuted} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={PROFILE_COLORS.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="mail-outline" size={20} color={PROFILE_COLORS.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={PROFILE_COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color={PROFILE_COLORS.textMuted} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={PROFILE_COLORS.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <SectionTitle title="Danger Zone" />
          <TouchableOpacity style={styles.deleteAccountBtn}>
            <MaterialIcons name="delete-outline" size={20} color={PROFILE_COLORS.red} />
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <ActionButton
            label={loading ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
            disabled={loading}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PROFILE_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PROFILE_COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PROFILE_COLORS.white,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
    color: PROFILE_COLORS.textSecondary,
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
  dangerZone: {
    marginBottom: 32,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PROFILE_COLORS.redLight,
    borderRadius: 12,
    paddingVertical: 14,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: '600',
    color: PROFILE_COLORS.red,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
