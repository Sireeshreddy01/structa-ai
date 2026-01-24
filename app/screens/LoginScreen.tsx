import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { apiClient } from '../../infra/api/client';

const COLORS = {
  primary: '#000000',
  background: '#F3F4F6',
  backgroundEnd: '#FFFFFF',
  card: 'rgba(255, 255, 255, 0.8)',
  inputBg: '#FFFFFF',
  textPrimary: '#0A0A0A',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  white: '#FFFFFF',
};

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
}

export function LoginScreen({ onLoginSuccess, onNavigateToRegister }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation for floating cards
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card 1 floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Card 2 floating animation (offset)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Checkmark bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.login(email, password);
      onLoginSuccess();
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const card1TranslateY = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const card2TranslateY = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const checkmarkTranslateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.backgroundEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>structa-ai</Text>
          </View>

          {/* Main Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              {/* Floating Document Cards */}
              <View style={styles.documentsContainer}>
                <View style={styles.documentsWrapper}>
                  {/* JSON Card (back) */}
                  <Animated.View
                    style={[
                      styles.docCard,
                      styles.docCardBack,
                      { transform: [{ translateY: card1TranslateY }, { rotate: '-12deg' }] }
                    ]}
                  >
                    <Text style={styles.docCardLabelLight}>JSON</Text>
                    <View style={styles.docCardLine} />
                    <View style={[styles.docCardLine, styles.docCardLineShort]} />
                  </Animated.View>

                  {/* CSV Card (front) */}
                  <Animated.View
                    style={[
                      styles.docCard,
                      styles.docCardFront,
                      { transform: [{ translateY: card2TranslateY }, { rotate: '6deg' }] }
                    ]}
                  >
                    <Text style={styles.docCardLabel}>CSV</Text>
                    <View style={styles.docCardLineDark} />
                    <View style={styles.docCardLineLight} />
                    <View style={[styles.docCardLineLight, styles.docCardLineShort]} />
                  </Animated.View>

                  {/* Checkmark Badge */}
                  <Animated.View
                    style={[
                      styles.checkBadge,
                      { transform: [{ translateY: checkmarkTranslateY }] }
                    ]}
                  >
                    <MaterialIcons name="check" size={14} color={COLORS.white} />
                  </Animated.View>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.title}>Welcome back.</Text>

              {/* Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@structa.ai"
                    placeholderTextColor={COLORS.textLight}
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
                      placeholderTextColor={COLORS.textLight}
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
                        color={COLORS.textLight}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me & Reset Password */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={styles.rememberContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <MaterialIcons name="check" size={12} color={COLORS.white} />}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.resetText}>Reset Password</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
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
                  <MaterialIcons name="apple" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Text style={styles.facebookF}>f</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign Up Link */}
            <TouchableOpacity style={styles.signupLink} onPress={onNavigateToRegister}>
              <Text style={styles.signupText}>
                Don't have an account? <Text style={styles.signupTextBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 5,
  },
  documentsContainer: {
    height: 128,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentsWrapper: {
    width: 128,
    height: 128,
    position: 'relative',
  },
  docCard: {
    position: 'absolute',
    width: 80,
    height: 96,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  docCardBack: {
    top: 8,
    left: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  docCardFront: {
    top: 0,
    right: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  docCardLabelLight: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  docCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  docCardLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    marginTop: 4,
  },
  docCardLineDark: {
    width: 48,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
    marginTop: 4,
  },
  docCardLineLight: {
    width: 48,
    height: 2,
    backgroundColor: COLORS.borderDark,
    borderRadius: 1,
    marginTop: 4,
  },
  docCardLineShort: {
    width: 32,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 48,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  resetText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.textLight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
    letterSpacing: 1.5,
    backgroundColor: COLORS.white,
    paddingHorizontal: 4,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 8,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285F4',
  },
  facebookF: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  signupLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  signupTextBold: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
