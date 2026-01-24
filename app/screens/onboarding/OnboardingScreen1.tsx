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
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#000000',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  textPrimary: '#000000',
  textMuted: '#666666',
  white: '#FFFFFF',
  meshGlow: 'rgba(200, 200, 200, 0.15)',
  homeIndicator: 'rgba(0, 0, 0, 0.1)',
};

// 3D monochrome obsidian abstract shape
const HERO_IMAGE_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8V3iH1GH6RLx-47FDegKX5NnOkpAyMRvqOxg65QgenaqJrgZEAx-aeLwzfqjpx8zGlY409RQBau4b_VIetzYUU5Fpfm_MJIXdB-4dzA9EI5dtALet57XE_UqrBiw9iakFd5OfG_DlN_sHiBRwY6bFpi3xur24AjXzajGtb9_UHNJ0XHgV1qV7vJrcWb3gErcDhKyPK51LQdjxCUhp1ezroBX3a6tixmjZwyXYAv7HsDffP7aOgD8eFV1P8AHdr74DwDdnuexE7PM';

interface OnboardingScreen1Props {
  onNext?: () => void;
  onSkip?: () => void;
  currentIndex?: number;
  totalScreens?: number;
}

export const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({
  onNext,
  onSkip,
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
    outputRange: [0, -12],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Monochrome Mesh Background */}
      <View style={styles.meshBackground} />

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom || 10 }]}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Blur glow behind image */}
          <View style={styles.imageGlow} />
          
          {/* Main Image */}
          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ translateY }] },
            ]}
          >
            <Image
              source={{ uri: HERO_IMAGE_URL }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Text Content */}
        <View style={styles.textSection}>
          <Text style={styles.title}>
            Digitize the{'\n'}
            <Text style={styles.titleMuted}>Unstructured</Text>
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

          <TouchableOpacity
            style={styles.nextButton}
            onPress={onNext}
            activeOpacity={0.85}
          >
            <MaterialIcons name="arrow-forward" size={28} color={COLORS.white} />
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
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: 'rgba(200, 200, 200, 0.4)',
  },
  imageContainer: {
    width: width - 48,
    aspectRatio: 1,
    maxWidth: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  textSection: {
    marginTop: 32,
    marginBottom: 16,
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
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingVertical: 16,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
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

export default OnboardingScreen1;
