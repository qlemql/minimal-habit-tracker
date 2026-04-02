import { useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, Text, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { NotificationFeedbackType } from 'expo-haptics';
import { hapticNotification } from '@/utils/haptics';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const MESSAGES = [
  '오늘도 해냈어요!',
  '완벽한 하루 ✨',
  '꾸준함이 만드는 변화',
  '작은 실천, 큰 차이',
  '오늘의 흐름 완성!',
  '내일도 이어가요',
];

const CONFETTI_COLORS = ['#4A90D9', '#7B68EE', '#FF6B6B', '#51CF66', '#FFD43B', '#FF922B', '#DA77F2', '#20C997'];
const CONFETTI_COUNT = 30;

const CONFETTI_CONFIG = Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  startX: (Math.random() - 0.5) * SCREEN_W,
  size: 6 + Math.random() * 8,
  delay: Math.random() * 400,
  fallDistance: SCREEN_H * 0.6 + Math.random() * 200,
  fallDuration: 1500 + Math.random() * 800,
  rotateDeg: 360 + Math.random() * 720,
}));

interface ConfettiPieceProps {
  config: typeof CONFETTI_CONFIG[number];
  visible: boolean;
}

function ConfettiPiece({ config, visible }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = config.startX;
      opacity.value = withDelay(config.delay, withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(1300, withTiming(0, { duration: 400 }))
      ));
      translateY.value = withDelay(
        config.delay,
        withTiming(config.fallDistance, { duration: config.fallDuration })
      );
      rotate.value = withDelay(
        config.delay,
        withTiming(config.rotateDeg, { duration: 2000 })
      );
    } else {
      translateY.value = -50;
      opacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          width: config.size,
          height: config.size * 1.5,
          backgroundColor: config.color,
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

  const handleDone = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (visible) {
      hapticNotification(NotificationFeedbackType.Success);

      bgOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(2800, withTiming(0, { duration: 400 }, (finished) => {
          if (finished) {
            runOnJS(handleDone)();
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {CONFETTI_CONFIG.map((config, i) => (
          <ConfettiPiece key={i} config={config} visible={visible} />
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
