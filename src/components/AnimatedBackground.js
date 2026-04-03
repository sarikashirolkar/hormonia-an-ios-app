import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../theme/tokens';

const { width, height } = Dimensions.get('window');

// We will use the 4 flowers we removed backgrounds for
const FLOWER_IMAGES = [
  require('../../assets/flower1.png'),
  require('../../assets/flower2.png'),
  require('../../assets/flower3.png'),
  require('../../assets/flower4.png'),
];

// Configuration for generating particles
const PARTICLE_COUNT = 15;

const FloatingFlower = ({ image, index }) => {
  // Randomize initial physics properties
  const startY = Math.random() * height + height; // start below screen
  const endY = -150; // end above screen
  const duration = 12000 + Math.random() * 8000; // 12-20s float time
  const startX = Math.random() * width;
  const swayWidth = 30 + Math.random() * 50;
  
  // Random sizing
  const size = 30 + Math.random() * 50;
  const rotationStart = Math.random() * 360;

  // Shared values
  const translateY = useSharedValue(startY);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(rotationStart);

  useEffect(() => {
    // 1. Float upwards
    translateY.value = withRepeat(
      withTiming(endY, { duration, easing: Easing.linear }),
      -1,
      false
    );

    // 2. Sway side to side (gentle wind effect)
    translateX.value = withRepeat(
      withSequence(
        withTiming(startX + swayWidth, { duration: duration / 4, easing: Easing.inOut(Easing.ease) }),
        withTiming(startX - swayWidth, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(startX, { duration: duration / 4, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 3. Very slow continued rotation
    rotate.value = withRepeat(
      withTiming(rotationStart + 180, { duration: duration * 1.5, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.Image
      source={image}
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          opacity: 0.65, // Let them blend slightly nicely
        },
        animatedStyle,
      ]}
      resizeMode="contain"
    />
  );
};

export default function AnimatedBackground({ children }) {
  // A subtle breathing gradient effect
  const bgOpacity = useSharedValue(0.85);

  useEffect(() => {
    bgOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000 }),
        withTiming(0.85, { duration: 4000 })
      ),
      -1,
      true
    );
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  }));

  const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
    id: i,
    image: FLOWER_IMAGES[i % FLOWER_IMAGES.length],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={backgroundStyle}>
        <LinearGradient
          colors={[Colors.pink50, Colors.lavender100, Colors.pink100]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Floating Flowers Layer (Removed for now) */}
      {/* 
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {particles.map((p) => (
          <FloatingFlower key={p.id} image={p.image} index={p.id} />
        ))}
      </View>
      */}

      {/* Main Content goes on top */}
      <View style={styles.contentOverlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  contentOverlay: {
    flex: 1,
  },
});
