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
  surfaceLight: '#F3F4F6',
  textPrimary: '#000000',
  textMuted: '#6B7280',
  textSubtle: '#9CA3AF',
  white: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.06)',
  dotInactive: '#E5E7EB',
  homeIndicator: 'rgba(0, 0, 0, 0.1)',
};

interface OnboardingScreen2Props {
  onNext?: () => void;
  onSkip?: () => void;
  currentIndex?: number;
  totalScreens?: number;
}

export const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({
  onNext,
  onSkip,
  currentIndex = 1,
  totalScreens = 3,
}) => {
  const insets = useSafeAreaInsets();

  // Floating animations for each card
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

    const anim1 = createFloat(float1, 6000, 0);
    const anim2 = createFloat(float2, 7000, 1000);
    const anim3 = createFloat(float3, 8000, 2000);

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
    outputRange: [0, -10],
  });

  const translateY2 = float2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const translateY3 = float3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background Glows */}
      <View style={styles.glowBg1} />
      <View style={styles.glowBg2} />

      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom || 8 }]}>
        {/* Hero Section - Floating Cards */}
        <View style={styles.heroSection}>
          <View style={styles.cardsContainer}>
            {/* JSON Card - Left */}
            <Animated.View
              style={[
                styles.glassCard,
                styles.cardLeft,
                { transform: [{ translateY: translateY1 }, { rotate: '-12deg' }] },
              ]}
            >
              <View style={styles.iconBox}>
                <MaterialIcons name="data-object" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.placeholderLines}>
                <View style={[styles.line, { width: '75%' }]} />
                <View style={[styles.line, { width: '50%' }]} />
                <View style={[styles.line, { width: '100%' }]} />
              </View>
              <Text style={styles.cardLabel}>JSON</Text>
            </Animated.View>

            {/* CSV Card - Right */}
            <Animated.View
              style={[
                styles.glassCard,
                styles.cardRight,
                { transform: [{ translateY: translateY2 }, { rotate: '12deg' }] },
              ]}
            >
              <View style={styles.iconBox}>
                <MaterialIcons name="table-chart" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.placeholderLines}>
                <View style={[styles.line, { width: '100%' }]} />
                <View style={[styles.line, { width: '100%' }]} />
                <View style={[styles.line, { width: '100%' }]} />
              </View>
              <Text style={styles.cardLabel}>CSV</Text>
            </Animated.View>

            {/* PDF Card - Center (Front) */}
            <Animated.View
              style={[
                styles.glassCardMain,
                styles.cardCenter,
                { transform: [{ translateY: translateY3 }] },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.blackDot} />
                <View style={styles.dotsGroup}>
                  <View style={styles.smallDot} />
                  <View style={styles.smallDot} />
                </View>
              </View>
              <View style={styles.iconBoxLarge}>
                <MaterialIcons name="picture-as-pdf" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.placeholderLinesLarge}>
                <View style={[styles.lineLarge, { width: '100%' }]} />
                <View style={[styles.lineLarge, { width: '85%' }]} />
                <View style={[styles.lineLarge, { width: '65%' }]} />
              </View>
              <View style={styles.parsedBadge}>
                <MaterialIcons name="auto-awesome" size={14} color={COLORS.primary} />
                <Text style={styles.parsedText}>PARSED</Text>
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textSection}>
          <Text style={styles.title}>
            AI-Powered{'\n'}
            <Text style={styles.titleUnderline}>Logic</Text>
          </Text>
          <Text style={styles.subtitle}>
            Our neural engine understands layouts and extracts intent automatically, transforming chaotic documents into structured data.
          </Text>
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationSection}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {Array.from({ length: totalScreens }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={onNext}
            activeOpacity={0.85}
          >
            <MaterialIcons name="arrow-forward" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

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
  glowBg1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  glowBg2: {
    position: 'absolute',
    bottom: '25%',
    right: '10%',
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: '#F9FAFB',
    opacity: 0.8,
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
  cardsContainer: {
    width: 256,
    height: 256,
    position: 'relative',
  },
  glassCard: {
    position: 'absolute',
    width: 160,
    height: 208,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  glassCardMain: {
    position: 'absolute',
    width: 176,
    height: 240,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 12,
  },
  cardLeft: {
    top: 0,
    left: 16,
    zIndex: 1,
  },
  cardRight: {
    top: 16,
    right: 16,
    zIndex: 1,
  },
  cardCenter: {
    top: 32,
    left: '50%',
    marginLeft: -88,
    zIndex: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBoxLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderLines: {
    width: '100%',
    gap: 8,
    opacity: 0.3,
  },
  placeholderLinesLarge: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 8,
    opacity: 0.4,
  },
  line: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  lineLarge: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  cardLabel: {
    position: 'absolute',
    bottom: 16,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.textSubtle,
    textTransform: 'uppercase',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  blackDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  dotsGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  smallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  parsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingTop: 16,
  },
  parsedText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.primary,
  },
  textSection: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  titleUnderline: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    textDecorationColor: '#D1D5DB',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    color: COLORS.textMuted,
  },
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSubtle,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: COLORS.dotInactive,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  homeIndicator: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  homeIndicatorBar: {
    width: 128,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.homeIndicator,
  },
});

export default OnboardingScreen2;
