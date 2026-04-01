import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, Pressable, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const MESSAGES = [
  '완벽한 하루!',
  '대단해요!',
  '꾸준함이 힘이에요',
  '오늘도 해냈어요!',
  '멋져요!',
  '습관이 되고 있어요',
];

const CONFETTI_COLORS = ['#4A90D9', '#7B68EE', '#FF6B6B', '#51CF66', '#FFD43B', '#FF922B', '#DA77F2', '#20C997'];
const CONFETTI_COUNT = 30;

interface ConfettiPieceProps {
  index: number;
  visible: boolean;
}

function ConfettiPiece({ index, visible }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const startX = (Math.random() - 0.5) * SCREEN_W;
  const size = 6 + Math.random() * 8;
  const delay = Math.random() * 400;

  useEffect(() => {
    if (visible) {
      translateX.value = startX;
      opacity.value = withDelay(delay, withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(1300, withTiming(0, { duration: 400 }))
      ));
      translateY.value = withDelay(
        delay,
        withTiming(SCREEN_H * 0.6 + Math.random() * 200, { duration: 1500 + Math.random() * 800 })
      );
      rotate.value = withDelay(
        delay,
        withTiming(360 + Math.random() * 720, { duration: 2000 })
      );
    } else {
      translateY.value = -50;
      opacity.value = 0;
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: SCREEN_W / 2,
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: 2,
        },
        style,
      ]}
    />
  );
}

interface CelebrationOverlayProps {
  visible: boolean;
  onDone: () => void;
}

export function CelebrationOverlay({ visible, onDone }: CelebrationOverlayProps) {
  const scale = useSharedValue(0);
  const bgOpacity = useSharedValue(0);

  const message = useMemo(
    () => MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    [visible]
  );

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      bgOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(1800, withTiming(0, { duration: 400 }, () => {
          runOnJS(onDone)();
        }))
      );

      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
    } else {
      scale.value = 0;
      bgOpacity.value = 0;
    }
  }, [visible]);

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={onDone}>
      <Animated.View style={[styles.container, bgStyle]}>
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiPiece key={i} index={i} visible={visible} />
        ))}

        <Animated.View style={[styles.content, contentStyle]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  text: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
