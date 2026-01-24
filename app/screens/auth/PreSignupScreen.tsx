import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  PanResponder,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiClient } from '../../../infra/api/client';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  black: '#0A0A0A',
  textPrimary: '#0F172A',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  white: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.6)',
  glassBg: 'rgba(255, 255, 255, 0.8)',
  inputBg: '#F5F5F5',
  borderDark: '#E5E7EB',
};

interface PreSignupScreenProps {
  onProceed?: () => void;
  onSignIn?: () => void;
}

// Register Form Component
const RegisterForm: React.FC<{
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  onBack: () => void;
  insets: { top: number; bottom: number };
}> = ({ onSuccess, onSwitchToLogin, onBack, insets }) => {
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
        { text: 'OK', onPress: onSuccess }
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[registerStyles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header with back button */}
      <View style={registerStyles.header}>
        <TouchableOpacity style={registerStyles.backButton} onPress={onBack}>
          <MaterialIcons name="chevron-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={registerStyles.logo}>structa-ai</Text>
        <View style={registerStyles.headerSpacer} />
      </View>

      {/* Card */}
      <View style={registerStyles.card}>
        <View style={registerStyles.titleSection}>
          <Text style={registerStyles.title}>Create account</Text>
          <Text style={registerStyles.subtitle}>Start your 30-day free trial.</Text>
        </View>

        {/* Form */}
        <View style={registerStyles.form}>
          {/* Name */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.inputLabel}>NAME</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="Johan orindo"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.inputLabel}>EMAIL</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="joedoe75@gmail.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.inputLabel}>PASSWORD</Text>
            <View style={registerStyles.passwordContainer}>
              <TextInput
                style={registerStyles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={registerStyles.eyeButton}
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

          {/* Terms */}
          <TouchableOpacity
            style={registerStyles.termsContainer}
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.7}
          >
            <View style={[registerStyles.checkbox, agreeTerms && registerStyles.checkboxChecked]}>
              {agreeTerms && <MaterialIcons name="check" size={14} color={COLORS.white} />}
            </View>
            <Text style={registerStyles.termsText}>
              I agree to the <Text style={registerStyles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={registerStyles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Create Button */}
          <TouchableOpacity
            style={[registerStyles.createButton, loading && registerStyles.createButtonDisabled]}
            onPress={handleRegister}
            activeOpacity={0.9}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={registerStyles.createButtonText}>Create account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={registerStyles.dividerContainer}>
          <View style={registerStyles.dividerLine} />
          <Text style={registerStyles.dividerText}>OR CONTINUE WITH</Text>
          <View style={registerStyles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={registerStyles.socialContainer}>
          <TouchableOpacity style={registerStyles.socialButton}>
            <Text style={registerStyles.facebookIcon}>f</Text>
          </TouchableOpacity>
          <TouchableOpacity style={registerStyles.socialButton}>
            <Text style={registerStyles.googleG}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={registerStyles.socialButton}>
            <MaterialIcons name="apple" size={26} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Link */}
      <View style={[registerStyles.loginRow, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={registerStyles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={registerStyles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const registerStyles = StyleSheet.create({
  container: {
    width: width - 40,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    paddingVertical: 14,
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
    gap: 10,
    marginLeft: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: COLORS.black,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderDark,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1877F2',
  },
  googleG: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285F4',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  loginLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
  },
});

export const PreSignupScreen: React.FC<PreSignupScreenProps> = ({
  onProceed,
  onSignIn,
}) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Slider state
  const sliderX = useRef(new Animated.Value(0)).current;
  const [sliderWidth, setSliderWidth] = useState(0);
  const SLIDER_THUMB_SIZE = 56;
  const SLIDER_PADDING = 4;
  
  // Arrow pulse animation
  const arrowPulse = useRef(new Animated.Value(0)).current;
  
  // Scroll to register page
  const scrollToRegister = () => {
    flatListRef.current?.scrollToIndex({ index: 1, animated: true });
  };
  
  // Scroll to welcome page
  const scrollToWelcome = () => {
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  };

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(arrowPulse, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [arrowPulse]);

  const arrowTranslateX = arrowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  // Slider max value ref to use in pan responder
  const maxSlideRef = useRef(0);
  const maxSlide = sliderWidth - SLIDER_THUMB_SIZE - (SLIDER_PADDING * 2);
  
  useEffect(() => {
    maxSlideRef.current = maxSlide;
  }, [maxSlide]);

  // Pan responder for slider - now scrolls to register page
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animation
      },
      onPanResponderMove: (_, gestureState) => {
        const maxValue = maxSlideRef.current;
        if (maxValue > 0) {
          const newX = Math.max(0, Math.min(gestureState.dx, maxValue));
          sliderX.setValue(newX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const maxValue = maxSlideRef.current;
        if (maxValue > 0 && gestureState.dx > maxValue * 0.6) {
          // Complete the slide - scroll to register page
          Animated.spring(sliderX, {
            toValue: maxValue,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start(() => {
            scrollToRegister();
            // Reset slider after animation
            setTimeout(() => {
              Animated.timing(sliderX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start();
            }, 300);
          });
        } else {
          // Reset to start
          Animated.spring(sliderX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;
  
  // Handle page change
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPage(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;
  
  // Floating animations
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main card float animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(float1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(float1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    // Delayed card float animation
    const floatDelayed = Animated.loop(
      Animated.sequence([
        Animated.timing(float2, {
          toValue: 1,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(float2, {
          toValue: 0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    );

    // Scan beam animation
    const scanAnimation = Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    floatAnimation.start();
    floatDelayed.start();
    scanAnimation.start();

    return () => {
      floatAnimation.stop();
      floatDelayed.stop();
      scanAnimation.stop();
    };
  }, [float1, float2, scanAnim]);

  const translateY1 = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const translateY2 = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 200],
  });

  const scanOpacity = scanAnim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  // Welcome Page Content
  const WelcomePage = () => (
    <View style={[styles.pageContainer, { width }]}>
      {/* Background Gradients */}
      <View style={styles.bgGradient1} />
      <View style={styles.bgGradient2} />
      <View style={styles.bgGradient3} />
      <View style={styles.bgGradient4} />

      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        {/* Logo Badge */}
        <View style={styles.logoBadge}>
          <MaterialIcons name="filter-center-focus" size={18} color={COLORS.black} />
          <Text style={styles.logoText}>STRUCTA</Text>
        </View>

        {/* Hero Text */}
        <View style={styles.heroText}>
          <Text style={styles.titleItalic}>Digitize</Text>
          <Text style={styles.titleBold}>Everything in</Text>
          <Text style={styles.titleMuted}>One Place.</Text>
        </View>

        {/* Floating Cards Section */}
        <View style={styles.cardsSection}>
          {/* Background Document Card */}
          <Animated.View
            style={[
              styles.documentCard,
              { transform: [{ translateY: translateY2 }, { rotate: '-6deg' }] },
            ]}
          >
            <View style={styles.docIconPlaceholder} />
            <View style={[styles.docLine, { width: '75%' }]} />
            <View style={[styles.docLine, { width: '100%' }]} />
            <View style={[styles.docLine, { width: '85%' }]} />
            <View style={[styles.docLine, { width: '80%' }]} />
            <View style={styles.docBoxRow}>
              <View style={styles.docBox} />
              <View style={styles.docBox} />
            </View>
          </Animated.View>

          {/* Dark Dashboard Card */}
          <Animated.View
            style={[
              styles.dashboardCard,
              { transform: [{ translateY: translateY1 }, { rotate: '4deg' }] },
            ]}
          >
            {/* Window Header */}
            <View style={styles.windowHeader}>
              <View style={styles.windowDots}>
                <View style={[styles.windowDot, { backgroundColor: 'rgba(239, 68, 68, 0.5)' }]} />
                <View style={[styles.windowDot, { backgroundColor: 'rgba(234, 179, 8, 0.5)' }]} />
                <View style={[styles.windowDot, { backgroundColor: 'rgba(34, 197, 94, 0.5)' }]} />
              </View>
              <View style={styles.windowBar} />
            </View>
            
            {/* Dashboard Content */}
            <View style={styles.dashboardContent}>
              <View style={styles.dashboardLeft}>
                <View style={styles.dashboardGrid} />
              </View>
              <View style={styles.dashboardRight}>
                <View style={styles.dashboardRow} />
                <View style={styles.dashboardRow} />
              </View>
            </View>

            {/* Scan Beam */}
            <Animated.View
              style={[
                styles.scanBeam,
                {
                  transform: [{ translateY: scanTranslateY }],
                  opacity: scanOpacity,
                },
              ]}
            />
          </Animated.View>

          {/* Floating Data Points */}
          <View style={[styles.dataPoint, styles.dataPoint1]} />
          <View style={[styles.dataPoint, styles.dataPoint2]} />
          <View style={[styles.dataPoint, styles.dataPoint3]} />
        </View>

        {/* Bottom CTA */}
        <View style={[styles.ctaSection, { paddingBottom: insets.bottom + 16 }]}>
          {/* Slider to Sign Up */}
          <View 
            style={styles.sliderContainer}
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
          >
            {/* Slider Track */}
            <View style={styles.sliderTrack}>
              {/* Slide text with arrows */}
              <View style={styles.sliderTextContainer}>
                <Animated.View style={{ transform: [{ translateX: arrowTranslateX }] }}>
                  <MaterialIcons name="chevron-right" size={20} color="rgba(0,0,0,0.2)" />
                </Animated.View>
                <Animated.View style={{ transform: [{ translateX: arrowTranslateX }] }}>
                  <MaterialIcons name="chevron-right" size={20} color="rgba(0,0,0,0.3)" />
                </Animated.View>
                <Text style={styles.sliderText}>Slide to Sign Up</Text>
                <Animated.View style={{ transform: [{ translateX: arrowTranslateX }] }}>
                  <MaterialIcons name="chevron-right" size={20} color="rgba(0,0,0,0.3)" />
                </Animated.View>
                <Animated.View style={{ transform: [{ translateX: arrowTranslateX }] }}>
                  <MaterialIcons name="chevron-right" size={20} color="rgba(0,0,0,0.2)" />
                </Animated.View>
              </View>
            </View>
            
            {/* Slider Thumb */}
            <Animated.View
              style={[
                styles.sliderThumb,
                { transform: [{ translateX: sliderX }] },
              ]}
              {...panResponder.panHandlers}
            >
              <MaterialIcons name="arrow-forward" size={24} color={COLORS.white} />
            </Animated.View>
          </View>
          
          <View style={styles.signInRow}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={onSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.trustText}>Trusted by leading enterprises worldwide</Text>
        </View>
      </View>
    </View>
  );

  // Register Page Content
  const RegisterPage = () => (
    <KeyboardAvoidingView
      style={[styles.pageContainer, { width }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background */}
      <View style={styles.bgGradient1} />
      <View style={styles.bgGradient2} />

      <RegisterForm
        onSuccess={() => onProceed?.()}
        onSwitchToLogin={() => onSignIn?.()}
        onBack={scrollToWelcome}
        insets={insets}
      />
    </KeyboardAvoidingView>
  );

  const pages = [
    { key: 'welcome', component: <WelcomePage /> },
    { key: 'register', component: <RegisterPage /> },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEnabled={true}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => item.component}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      
      {/* Page Indicator */}
      <View style={[styles.pageIndicator, { bottom: insets.bottom + 8 }]}>
        <View style={[styles.dot, currentPage === 0 && styles.dotActive]} />
        <View style={[styles.dot, currentPage === 1 && styles.dotActive]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dotActive: {
    backgroundColor: COLORS.black,
    width: 20,
  },
  bgGradient1: {
    position: 'absolute',
    top: '-20%',
    left: '-20%',
    width: '120%',
    height: '80%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  bgGradient2: {
    position: 'absolute',
    top: '40%',
    right: '-30%',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(229, 231, 235, 0.6)',
  },
  bgGradient3: {
    position: 'absolute',
    top: '15%',
    right: '10%',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  bgGradient4: {
    position: 'absolute',
    bottom: '20%',
    left: '10%',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: 'rgba(209, 213, 219, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textPrimary,
  },
  heroText: {
    marginBottom: 16,
  },
  titleItalic: {
    fontSize: 40,
    fontStyle: 'italic',
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 4,
  },
  titleBold: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    color: COLORS.textPrimary,
  },
  titleMuted: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#9CA3AF',
  },
  cardsSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  documentCard: {
    position: 'absolute',
    left: 20,
    width: 200,
    height: 260,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 50,
    elevation: 10,
    zIndex: 1,
  },
  docIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  docLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginBottom: 12,
    opacity: 0.4,
  },
  docBoxRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  docBox: {
    flex: 1,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dashboardCard: {
    position: 'absolute',
    right: -16,
    top: 48,
    width: 220,
    height: 160,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: '#1F2937',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.35,
    shadowRadius: 60,
    elevation: 15,
    zIndex: 2,
  },
  windowHeader: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  windowDots: {
    flexDirection: 'row',
    gap: 6,
  },
  windowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  windowBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#374151',
  },
  dashboardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dashboardLeft: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  dashboardGrid: {
    flex: 1,
    opacity: 0.3,
  },
  dashboardRight: {
    flex: 1,
    gap: 8,
  },
  dashboardRow: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  dataPoint: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: COLORS.white,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    zIndex: 3,
  },
  dataPoint1: {
    width: 12,
    height: 12,
    right: -8,
    top: 0,
  },
  dataPoint2: {
    width: 8,
    height: 8,
    left: -8,
    bottom: 48,
  },
  dataPoint3: {
    width: 10,
    height: 10,
    right: 48,
    bottom: -24,
  },
  ctaSection: {
    width: '100%',
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 32,
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 8,
  },
  ctaTextSection: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sliderContainer: {
    width: '100%',
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  sliderTrack: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 48,
  },
  sliderText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.4)',
    letterSpacing: 0.3,
    marginHorizontal: 8,
  },
  sliderThumb: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signInText: {
    fontSize: 13,
    color: '#6B7280',
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  trustText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
});
