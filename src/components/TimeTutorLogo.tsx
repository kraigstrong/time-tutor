import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

import { fontFamily, palette } from '../styles/theme';

type TimeTutorLogoProps = {
  compact?: boolean;
};

export function TimeTutorLogo({ compact = false }: TimeTutorLogoProps) {
  const size = compact ? 72 : 92;
  const frameSize = size + 22;
  const centerX = frameSize / 2;
  const centerY = compact ? frameSize / 2 + 4 : frameSize / 2 + 6;
  const radius = size / 2 - 2;
  const tickOuterRadius = radius - 9;
  const tickInnerRadiusMajor = radius - 19;
  const tickInnerRadiusMinor = radius - 14;
  const hourHandLength = radius * 0.44;
  const minuteHandLength = radius * 0.64;
  const capWidth = compact ? 28 : 34;
  const capHeight = compact ? 8 : 10;
  const capTop = centerY - radius - (compact ? 3 : 5);
  const capPoints = [
    `${centerX - capWidth} ${capTop}`,
    `${centerX} ${capTop - capHeight}`,
    `${centerX + capWidth} ${capTop}`,
    `${centerX} ${capTop + capHeight}`,
  ].join(' ');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.markWrap,
          compact && styles.markWrapCompact,
          { height: frameSize, width: frameSize },
        ]}
      >
        <Svg height={frameSize} width={frameSize}>
          <Circle
            cx={centerX}
            cy={centerY}
            fill="#FFF8EE"
            r={radius}
            stroke="#FFDCC2"
            strokeWidth={4}
          />
          <Circle
            cx={centerX}
            cy={centerY}
            fill="none"
            r={radius - 9}
            stroke={palette.ring}
            strokeWidth={compact ? 3 : 4}
          />
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = index * 30;
            const outer = getPoint(angle, tickOuterRadius, centerX, centerY);
            const inner = getPoint(
              angle,
              index % 3 === 0 ? tickInnerRadiusMajor : tickInnerRadiusMinor,
              centerX,
              centerY,
            );

            return (
              <Line
                key={`tick-${angle}`}
                stroke={palette.ink}
                strokeLinecap="round"
                strokeWidth={compact ? 3 : 4}
                x1={inner.x}
                x2={outer.x}
                y1={inner.y}
                y2={outer.y}
              />
            );
          })}
          <Polygon
            fill={palette.ink}
            points={capPoints}
          />
          <Line
            stroke={palette.ink}
            strokeLinecap="round"
            strokeWidth={compact ? 4 : 5}
            x1={centerX}
            x2={centerX}
            y1={capTop + capHeight - 1}
            y2={capTop + capHeight + (compact ? 8 : 10)}
          />
          <Line
            stroke={palette.gold}
            strokeLinecap="round"
            strokeWidth={compact ? 2 : 2.5}
            x1={centerX + capWidth * 0.54}
            x2={centerX + capWidth * 0.78}
            y1={capTop + 1}
            y2={capTop + (compact ? 16 : 20)}
          />
          <Circle
            cx={centerX + capWidth * 0.8}
            cy={capTop + (compact ? 18 : 22)}
            fill={palette.ink}
            r={compact ? 2.5 : 3}
          />
          <Line
            stroke={palette.coral}
            strokeLinecap="round"
            strokeWidth={compact ? 5 : 6}
            x1={centerX}
            x2={centerX}
            y1={centerY}
            y2={centerY - minuteHandLength}
          />
          <Line
            stroke={palette.teal}
            strokeLinecap="round"
            strokeWidth={compact ? 5 : 6}
            x1={centerX}
            x2={centerX + hourHandLength * 0.8}
            y1={centerY}
            y2={centerY + hourHandLength * 0.28}
          />
          <Circle
            cx={centerX}
            cy={centerY}
            fill={palette.teal}
            r={compact ? 6 : 7}
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

function getPoint(
  angle: number,
  distance: number,
  centerX: number,
  centerY: number,
) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: centerX + Math.sin(radians) * distance,
    y: centerY - Math.cos(radians) * distance,
  };
}
