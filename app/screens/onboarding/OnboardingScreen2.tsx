import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#111827',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  dotInactive: '#D1D5DB',
  yellow: '#FEF3C7',
  yellowIcon: '#D97706',
  green: '#DCFCE7',
  greenIcon: '#16A34A',
  red: '#FEE2E2',
  redIcon: '#EF4444',
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
    const createFloatAnimation = (anim: Animated.Value, duration: number, delay: number) => {
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

    const anim1 = createFloatAnimation(float1, 6000, 0);
    const anim2 = createFloatAnimation(float2, 7000, 1000);
    const anim3 = createFloatAnimation(float3, 8000, 2000);

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
      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* Hero Section with Floating Cards */}
        <View style={styles.heroSection}>
          {/* Purple Glow Background */}
          <View style={styles.glowBg1} />
          <View style={styles.glowBg2} />

          {/* Cards Container */}
          <View style={styles.cardsContainer}>
            {/* JSON Card - Left */}
            <Animated.View
              style={[
                styles.glassCard,
                styles.cardLeft,
                { transform: [{ translateY: translateY1 }, { rotate: '-12deg' }] },
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: COLORS.yellow }]}>
                <MaterialIcons name="data-object" size={24} color={COLORS.yellowIcon} />
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
              <View style={[styles.iconBox, { backgroundColor: COLORS.green }]}>
                <MaterialIcons name="table-chart" size={24} color={COLORS.greenIcon} />
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
                <View style={styles.redDot} />
                <View style={styles.dotsGroup}>
                  <View style={styles.smallDot} />
                  <View style={styles.smallDot} />
                </View>
              </View>
              <View style={[styles.iconBoxLarge, { backgroundColor: COLORS.red }]}>
                <MaterialIcons name="picture-as-pdf" size={28} color={COLORS.redIcon} />
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
            <Text style={styles.titleAccent}>Logic</Text>
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
            <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Home Indicator */}
        <View style={[styles.homeIndicator, { paddingBottom: insets.bottom || 8 }]}>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowBg1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(17, 24, 39, 0.04)',
  },
  glowBg2: {
    position: 'absolute',
    bottom: '20%',
    right: '10%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(17, 24, 39, 0.03)',
  },
  cardsContainer: {
    width: width - 80,
    height: 280,
    position: 'relative',
  },
  glassCard: {
    position: 'absolute',
    width: 130,
    height: 170,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  glassCardMain: {
    position: 'absolute',
    width: 150,
    height: 200,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 12,
  },
  cardLeft: {
    left: 0,
    top: 30,
    zIndex: 1,
  },
  cardRight: {
    right: 0,
    top: 20,
    zIndex: 1,
  },
  cardCenter: {
    left: '50%',
    marginLeft: -75,
    top: 10,
    zIndex: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBoxLarge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  placeholderLines: {
    width: '100%',
    gap: 6,
    opacity: 0.4,
  },
  line: {
    height: 5,
    backgroundColor: '#4B5563',
    borderRadius: 3,
  },
  placeholderLinesLarge: {
    width: '100%',
    gap: 8,
    paddingHorizontal: 8,
  },
  lineLarge: {
    height: 7,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  cardLabel: {
    position: 'absolute',
    bottom: 12,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F87171',
  },
  dotsGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  smallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4B5563',
  },
  parsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    gap: 6,
  },
  parsedText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.primary,
  },
  textSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  titleAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  skipButton: {
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: 4,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.dotInactive,
  },
  dotActive: {
    width: 24,
    height: 8,
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  homeIndicator: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  homeIndicatorBar: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
