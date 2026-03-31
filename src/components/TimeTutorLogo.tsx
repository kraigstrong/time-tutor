import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

import { fontFamily, palette } from '../styles/theme';

type TimeTutorLogoProps = {
  compact?: boolean;
};

export function TimeTutorLogo({ compact = false }: TimeTutorLogoProps) {
  const size = compact ? 72 : 92;
  const radius = size / 2;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.markWrap,
          compact && styles.markWrapCompact,
          { height: size + 22, width: size + 22 },
        ]}
      >
        <Svg height={size + 22} width={size + 22}>
          <Circle
            cx={radius + 11}
            cy={radius + 11}
            fill="#FFF8EE"
            r={radius}
            stroke={palette.ink}
            strokeWidth={4}
          />
          <Circle
            cx={radius + 11}
            cy={radius + 11}
            fill="none"
            r={radius - 9}
            stroke={palette.ring}
            strokeWidth={2}
          />
          <Rect
            fill={palette.ink}
            height={26}
            rx={8}
            width={40}
            x={radius - 9}
            y={radius + 22}
          />
          <SvgText
            fill={palette.white}
            fontFamily={fontFamily.display}
            fontSize="12"
            fontWeight="700"
            textAnchor="middle"
            x={radius + 11}
            y={radius + 39}
          >
            3:25
          </SvgText>
          <Line
            stroke={palette.coral}
            strokeLinecap="round"
            strokeWidth={4}
            x1={radius + 11}
            x2={radius + 11}
            y1={radius + 11}
            y2={radius - 12}
          />
          <Line
            stroke={palette.teal}
            strokeLinecap="round"
            strokeWidth={4}
            x1={radius + 11}
            x2={radius + 31}
            y1={radius + 11}
            y2={radius + 1}
          />
          <Circle
            cx={radius + 11}
            cy={radius + 11}
            fill={palette.gold}
            r={5}
          />
        </Svg>
      </View>
      <View style={styles.wordmarkWrap}>
        <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>
          Time Tutor
        </Text>
        <Text style={styles.submark}>Analog + digital practice</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  markWrap: {
    alignItems: 'center',
    backgroundColor: '#FDE4CC',
    borderRadius: 28,
    justifyContent: 'center',
  },
  markWrapCompact: {
    borderRadius: 22,
  },
  wordmarkWrap: {
    alignItems: 'center',
    gap: 2,
  },
  wordmark: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
  },
  wordmarkCompact: {
    fontSize: 20,
  },
  submark: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
