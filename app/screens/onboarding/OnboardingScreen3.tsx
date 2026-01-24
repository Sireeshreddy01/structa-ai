import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#111827',
  primaryLight: '#374151',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  dotInactive: '#D1D5DB',
};

// 3D Vault cloud image
const HERO_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu0Xt271OKFpUA_qRfrtUJmo9ErXgG7hTo48iKXyQ7KI-ybFv37jaqrJ_wSsaY_WmH8VTfTJbBaF6pcnPVGgCZzjZhrS1iCZ_I60SUVLjeZ2w7LLBdlDXfEdMTbUfNnb6QmkfNLq2xNe28B_q8icKlOQwNbkuzKkfK_tBwU7U8UEp5yKCCktEU7Srt-zvPG5RTv_qNxTgoPKc8jfw2twAgIVFB-aetXQxZQM_mrbexsHXUlmZXk-Af2BG-53isM-hE0WE3MbC6eSY';

interface OnboardingScreen3Props {
  onNext?: () => void;
  onSkip?: () => void;
  currentIndex?: number;
  totalScreens?: number;
}

export const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({
  onNext,
  onSkip,
  currentIndex = 2,
  totalScreens = 3,
}) => {
  const insets = useSafeAreaInsets();
  
  // Floating icon animations
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim: Animated.Value, duration: number, delay: number) => {
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

    const anim1 = createBounce(bounce1, 3000, 0);
    const anim2 = createBounce(bounce2, 4000, 1000);

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, [bounce1, bounce2]);

  const translateY1 = bounce1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  const translateY2 = bounce2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.container}>
      {/* Background Glow Effects */}
      <View style={styles.glowTopRight} />
      <View style={styles.glowBottomLeft} />
      <View style={styles.glowMiddle} />

      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Purple glow behind image */}
          <View style={styles.imageGlow} />
          
          {/* Main Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: HERO_IMAGE_URL }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            
            {/* Floating Lock Icon */}
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.floatingIconRight,
                { transform: [{ translateY: translateY1 }] },
              ]}
            >
              <MaterialIcons name="lock" size={24} color={COLORS.primary} />
            </Animated.View>

            {/* Floating Cloud Icon */}
            <Animated.View
              style={[
                styles.floatingIcon,
                styles.floatingIconLeft,
                { transform: [{ translateY: translateY2 }] },
              ]}
            >
              <MaterialIcons name="cloud-upload" size={24} color={COLORS.primary} />
            </Animated.View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textSection}>
          {/* Accent bar */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentBar}
          />
          
          <Text style={styles.title}>
            Ready for Your{'\n'}
            <Text style={styles.titleGradient}>Workflow</Text>
          </Text>
          <Text style={styles.subtitle}>
            Export to your favorite tools in seconds. Secure, fast, and structured.
          </Text>
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={onNext}
            activeOpacity={0.9}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
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
  glowTopRight: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(17, 24, 39, 0.04)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: '20%',
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(17, 24, 39, 0.03)',
  },
  glowMiddle: {
    position: 'absolute',
    top: '40%',
    right: '10%',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(17, 24, 39, 0.02)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  imageGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(17, 24, 39, 0.06)',
  },
  imageContainer: {
    width: 256,
    height: 256,
    borderRadius: 24,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  floatingIcon: {
    position: 'absolute',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  floatingIconRight: {
    right: -16,
    top: 40,
  },
  floatingIconLeft: {
    left: -8,
    bottom: 48,
  },
  textSection: {
    marginBottom: 24,
  },
  accentBar: {
    width: 48,
    height: 6,
    borderRadius: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  titleGradient: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 26,
    color: COLORS.textSecondary,
    maxWidth: '90%',
  },
  buttonSection: {
    paddingBottom: 8,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: COLORS.primary,
    height: 72,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  getStartedText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  termsText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
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