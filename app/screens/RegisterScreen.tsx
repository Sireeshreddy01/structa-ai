import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../infra/api/client';

const COLORS = {
  primary: '#000000',
  background: '#FAFAFA',
  card: '#FFFFFF',
  inputBg: '#F5F5F5',
  textPrimary: '#0A0A0A',
  textMuted: '#737373',
  border: '#F3F4F6',
  borderDark: '#E5E7EB',
  white: '#FFFFFF',
  facebook: '#1877F2',
};

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await apiClient.register(name, email, password);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: onRegisterSuccess }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onNavigateToLogin}>
              <MaterialIcons name="chevron-left" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.logo}>structa-ai</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Main Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              {/* Title */}
              <View style={styles.titleSection}>
                <Text style={styles.title}>Create account</Text>
                <Text style={styles.subtitle}>Start your 30-day free trial.</Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Johan orindo"
                    placeholderTextColor={COLORS.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="joedoe75@gmail.com"
                    placeholderTextColor={COLORS.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>PASSWORD</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms Checkbox */}
                <TouchableOpacity
                  style={styles.termsContainer}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                    {agreeTerms && <MaterialIcons name="check" size={14} color={COLORS.white} />}
                  </View>
                  <Text style={styles.termsText}>
                    I agree to the{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>

                {/* Create Account Button */}
                <TouchableOpacity
                  style={[styles.createButton, loading && styles.createButtonDisabled]}
                  onPress={handleRegister}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.createButtonText}>Create account</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={[styles.socialIcon, { color: COLORS.facebook }]}>f</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <MaterialIcons name="apple" size={26} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 48,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginLeft: 4,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.39,
    shadowRadius: 14,
    elevation: 10,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderDark,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 8,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  googleIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4285F4',
  },
});

export default RegisterScreen;
