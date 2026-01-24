import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#111827',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  dotInactive: '#D1D5DB',
};

// 3D Abstract purple shape illustration
const HERO_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS0uQw90XNi69IZ0VWmGo7qYa5Av2dPjnKcq2-Rdvz6E7-ceSY0tGcWFsWrsDjpvGGgaqQAd3yN3nkKl7qCEbEOJcRtQW5bN7RWyW9MfufG56icffuwdSsDLVLCwQ-LRRUCDCWbrz1F1M1wc0WgqUqKylR7VkIvsXKNCnOMoIFdBmBaX6LDVxKJSWPkQ5eOPjWnG_AL0-5kOfEeACL6GzaXF7fusPqDLXkc_KOWUPGbiCoIsKHPWIPF0W8ZIAkzwhthc5VzHFTNAI';

interface OnboardingScreen1Props {
  onNext?: () => void;
  onSkip?: () => void;
  currentIndex?: number;
  totalScreens?: number;
}

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  onNext,
  onSkip,
  currentIndex = 0,
  totalScreens = 3,
}) => {
  const insets = useSafeAreaInsets();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    floating.start();
    return () => floating.stop();
  }, [floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* Hero Image Card */}
        <Animated.View
          style={[
            styles.heroCard,
            { transform: [{ translateY }] },
          ]}
        >
          <Image
            source={{ uri: HERO_IMAGE_URL }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Text Content */}
        <View style={styles.textSection}>
          <Text style={styles.title}>
            Digitize the{'\n'}
            <Text style={styles.titleAccent}>Unstructured</Text>
          </Text>
          <Text style={styles.subtitle}>
            Transform any document into structured data with human-like precision.
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
  heroCard: {
    width: width - 48,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 46,
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  titleAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 26,
    color: COLORS.textSecondary,
  },
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  skipButton: {
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
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
  dotActive: {
    width: 24,
    height: 8,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.dotInactive,
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
    shadowOpacity: 0.4,
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
