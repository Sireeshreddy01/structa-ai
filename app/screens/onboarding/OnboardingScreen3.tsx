import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#000000',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#F9FAFB',
  textPrimary: '#000000',
  textMuted: '#666666',
  white: '#FFFFFF',
  border: '#E5E7EB',
  homeIndicator: 'rgba(0, 0, 0, 0.1)',
};

interface OnboardingScreen3Props {
  onNext?: () => void;
  onSkip?: () => void;
  currentIndex?: number;
  totalScreens?: number;
}

export const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({
  onNext,
  onSkip,
}) => {
  const insets = useSafeAreaInsets();

  // Floating animations
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createFloat = (anim: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createFloat(float1, 3000, 0);
    const anim2 = createFloat(float2, 3500, 300);
    const anim3 = createFloat(float3, 4000, 600);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [float1, float2, float3]);

  const translateY1 = float1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const translateY2 = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const translateY3 = float3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Monochrome Mesh Background */}
      <View style={styles.meshBackground} />

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom || 10 }]}>
        {/* Hero Section - Export Icons */}
        <View style={styles.heroSection}>
          {/* Blur glow */}
          <View style={styles.imageGlow} />

          {/* Icons Container */}
          <View style={styles.iconsContainer}>
            {/* Cloud Upload Icon */}
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.iconCloud,
                { transform: [{ translateY: translateY1 }] },
              ]}
            >
              <MaterialIcons name="cloud-upload" size={32} color={COLORS.primary} />
            </Animated.View>

            {/* Lock/Security Icon */}
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.iconLock,
                { transform: [{ translateY: translateY2 }] },
              ]}
            >
              <MaterialIcons name="lock" size={28} color={COLORS.primary} />
            </Animated.View>

            {/* Sync/Export Icon */}
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.iconSync,
                { transform: [{ translateY: translateY3 }] },
              ]}
            >
              <MaterialIcons name="sync" size={30} color={COLORS.primary} />
            </Animated.View>

            {/* Center Vault Icon */}
            <View style={styles.centerIcon}>
              <MaterialIcons name="folder" size={64} color={COLORS.primary} />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textSection}>
          <Text style={styles.title}>
            Ready for{'\n'}
            <Text style={styles.titleMuted}>Your Workflow</Text>
          </Text>
          <Text style={styles.subtitle}>
            Export to your favorite tools in seconds. Secure, fast, and always structured.
          </Text>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={onNext}
          activeOpacity={0.9}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <MaterialIcons name="arrow-forward" size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Terms Text */}
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>

        {/* Home Indicator */}
        <View style={styles.homeIndicator}>
          <View style={styles.homeIndicatorBar} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  meshBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
  },
  iconsContainer: {
    width: 240,
    height: 240,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingIcon: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCloud: {
    top: 10,
    left: 20,
  },
  iconLock: {
    top: 30,
    right: 10,
  },
  iconSync: {
    bottom: 20,
    left: 40,
  },
  centerIcon: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  textSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 48,
    letterSpacing: -1,
    color: COLORS.textPrimary,
    marginBottom: 24,
  },
  titleMuted: {
    color: COLORS.textPrimary,
    opacity: 0.4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    color: COLORS.textMuted,
    paddingRight: 16,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 12,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  homeIndicator: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  homeIndicatorBar: {
    width: 128,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.homeIndicator,
  },
});

export default OnboardingScreen3;
