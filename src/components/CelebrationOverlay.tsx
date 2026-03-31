import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { fontFamily, palette } from '../styles/theme';

type CelebrationOverlayProps = {
  visible: boolean;
};

const CONFETTI_COLORS = [
  '#F05D5E',
  '#F6BD39',
  '#0FA3B1',
  '#2D3142',
  '#7ED6A5',
  '#FF7AA2',
  '#7A5CFA',
  '#FF9F1C',
];

const CONFETTI_LAYOUT = [
  { delay: 0, drift: -18, leftPercent: 10, rotation: -28, top: 18 },
  { delay: 30, drift: -22, leftPercent: 14, rotation: 26, top: 42 },
  { delay: 40, drift: -10, leftPercent: 18, rotation: 18, top: 2 },
  { delay: 70, drift: -14, leftPercent: 22, rotation: -32, top: 58 },
  { delay: 80, drift: -6, leftPercent: 28, rotation: -12, top: 22 },
  { delay: 120, drift: -2, leftPercent: 38, rotation: 12, top: 10 },
  { delay: 20, drift: 0, leftPercent: 50, rotation: -8, top: 0 },
  { delay: 90, drift: 2, leftPercent: 56, rotation: 28, top: 52 },
  { delay: 140, drift: 6, leftPercent: 60, rotation: 18, top: 14 },
  { delay: 60, drift: 10, leftPercent: 70, rotation: -16, top: 6 },
  { delay: 110, drift: 12, leftPercent: 74, rotation: 30, top: 46 },
  { delay: 100, drift: 14, leftPercent: 80, rotation: 24, top: 20 },
  { delay: 145, drift: 18, leftPercent: 84, rotation: -26, top: 60 },
  { delay: 160, drift: 18, leftPercent: 88, rotation: -20, top: 8 },
];

export function CelebrationOverlay({ visible }: CelebrationOverlayProps) {
  const { width } = useWindowDimensions();
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const messageScale = useRef(new Animated.Value(0.92)).current;
  const confettiValues = useRef(
    CONFETTI_LAYOUT.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (!visible) {
      messageOpacity.setValue(0);
      messageScale.setValue(0.92);
      confettiValues.forEach(value => value.setValue(0));
      return;
    }

    Animated.parallel([
      Animated.timing(messageOpacity, {
        duration: 180,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(messageScale, {
        friction: 7,
        tension: 120,
        toValue: 1,
        useNativeDriver: true,
      }),
      ...confettiValues.map((value, index) =>
        Animated.timing(value, {
          delay: CONFETTI_LAYOUT[index].delay,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
      ),
    ]).start();
  }, [confettiValues, messageOpacity, messageScale, visible]);

  const confettiPieces = useMemo(
    () =>
      CONFETTI_LAYOUT.map((piece, index) => {
        const progress = confettiValues[index];

        return (
          <Animated.View
            key={`confetti-${index}`}
            style={[
              styles.confetti,
              {
                backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                left: `${piece.leftPercent}%`,
                top: piece.top,
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, piece.drift],
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 92],
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        `${piece.rotation}deg`,
                        `${piece.rotation + 120}deg`,
                      ],
                    }),
                  },
                ],
                opacity: progress.interpolate({
                  inputRange: [0, 0.15, 0.9, 1],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}
          />
        );
      }),
    [confettiValues],
  );

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <View style={styles.celebrationWrap}>
        {confettiPieces}
        <Animated.View
          style={[
            styles.messageCard,
            {
              maxWidth: Math.min(width - 40, 360),
              opacity: messageOpacity,
              transform: [{ scale: messageScale }],
            },
          ]}
        >
          <Text style={styles.messageTitle}>Nice work!</Text>
          <Text style={styles.messageBody}>New challenge coming up...</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  celebrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    position: 'relative',
    width: '100%',
  },
  messageCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 249, 242, 0.96)',
    borderColor: '#F1BD63',
    borderRadius: 24,
    borderWidth: 2,
    paddingHorizontal: 22,
    paddingVertical: 16,
    shadowColor: '#12355B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  messageTitle: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 26,
    fontWeight: '700',
  },
  messageBody: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 15,
    marginTop: 4,
  },
  confetti: {
    borderRadius: 5,
    height: 18,
    position: 'absolute',
    top: 24,
    width: 12,
  },
});
