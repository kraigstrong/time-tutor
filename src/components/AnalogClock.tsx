import React, { useMemo, useRef, type SetStateAction } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

import { fontFamily, palette, shadows } from '../styles/theme';
import type { Hour12, Meridiem, TimeValue } from '../types/time';
import {
  applyMinuteDrag,
  angleFromTouch,
  deriveHourFromAngle,
  formatTimeValue,
  getClockHandAngles,
  snapMinuteFromAngle,
} from '../utils/time';

type AnalogClockProps = {
  time: TimeValue;
  size: number;
  interactive?: boolean;
  onChange?: (value: SetStateAction<TimeValue>) => void;
  showMeridiemToggle?: boolean;
  showTimePreview?: boolean;
  onMeridiemChange?: (meridiem: Meridiem) => void;
};

type HandName = 'hour' | 'minute';

export function AnalogClock({
  time,
  size,
  interactive = false,
  onChange,
  showMeridiemToggle = false,
  showTimePreview = false,
  onMeridiemChange,
}: AnalogClockProps) {
  const activeHandRef = useRef<HandName | null>(null);
  const webClockInteractionStyle =
    Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          touchAction: 'none',
          userSelect: 'none',
        } as const)
      : undefined;
  const webSvgStyle =
    Platform.OS === 'web'
      ? ({
          userSelect: 'none',
        } as any)
      : undefined;
  const radius = size / 2;
  const hourLength = size * 0.2;
  const minuteLength = size * 0.29;
  const numeralRadius = size * 0.34;
  const { hourAngle, minuteAngle } = getClockHandAngles(time);

  const hourTip = useMemo(
    () => getTipPoint(hourAngle, hourLength, radius),
    [hourAngle, hourLength, radius],
  );
  const minuteTip = useMemo(
    () => getTipPoint(minuteAngle, minuteLength, radius),
    [minuteAngle, minuteLength, radius],
  );

  const updateFromTouch = (event: GestureResponderEvent, hand: HandName) => {
    if (!onChange) {
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const angle = angleFromTouch(locationX, locationY, size);

    if (hand === 'minute') {
      onChange(currentTime =>
        applyMinuteDrag(currentTime, snapMinuteFromAngle(angle)),
      );

      return;
    }

    onChange(currentTime => ({
      ...currentTime,
      hour12: deriveHourFromAngle(angle),
    }));
  };

  const handleGrant = (event: GestureResponderEvent) => {
    if (!interactive) {
      return;
    }

    activeHandRef.current = pickHand(
      event,
      size,
      hourTip,
      minuteTip,
      radius,
    );

    if (activeHandRef.current) {
      updateFromTouch(event, activeHandRef.current);
    }
  };

  const handleMove = (event: GestureResponderEvent) => {
    if (activeHandRef.current) {
      updateFromTouch(event, activeHandRef.current);
    }
  };

  const handleEnd = () => {
    activeHandRef.current = null;
  };

  return (
    <View style={styles.container}>
      <View
        onMoveShouldSetResponder={() => interactive}
        onResponderGrant={handleGrant}
        onResponderMove={handleMove}
        onResponderRelease={handleEnd}
        onResponderTerminate={handleEnd}
        onStartShouldSetResponder={() => interactive}
        style={[
          styles.clockShell,
          interactive && webClockInteractionStyle,
          { height: size, width: size },
        ]}
        testID="analog-clock-surface"
      >
        <Svg
          height={size}
          pointerEvents="none"
          style={webSvgStyle}
          width={size}
        >
          <Circle
            cx={radius}
            cy={radius}
            fill={palette.surface}
            r={radius - 4}
            stroke={palette.ring}
            strokeWidth={6}
          />
          {Array.from({ length: 60 }).map((_, index) => {
            const angle = index * 6;
            const outer = getTipPoint(angle, radius - 18, radius);
            const inner = getTipPoint(
              angle,
              radius - (index % 5 === 0 ? 38 : 28),
              radius,
            );

            return (
              <Line
                key={`tick-${index}`}
                stroke={index % 5 === 0 ? palette.ink : palette.ring}
                strokeLinecap="round"
                strokeWidth={index % 5 === 0 ? 4 : 2}
                x1={inner.x}
                x2={outer.x}
                y1={inner.y}
                y2={outer.y}
              />
            );
          })}
          {Array.from({ length: 12 }).map((_, index) => {
            const hour = (index + 1) as Hour12;
            const point = getTipPoint(hour * 30, numeralRadius, radius);

            return (
              <SvgText
                fill={palette.ink}
                fontFamily={fontFamily.display}
                fontSize={size * 0.06}
                fontWeight="700"
                key={`numeral-${hour}`}
                textAnchor="middle"
                x={point.x}
                y={point.y + size * 0.02}
              >
                {hour}
              </SvgText>
            );
          })}
          <Line
            stroke={palette.ink}
            strokeLinecap="round"
            strokeWidth={size * 0.04}
            x1={radius}
            x2={hourTip.x}
            y1={radius}
            y2={hourTip.y}
          />
          <Line
            stroke={palette.coral}
            strokeLinecap="round"
            strokeWidth={size * 0.026}
            x1={radius}
            x2={minuteTip.x}
            y1={radius}
            y2={minuteTip.y}
          />
          <Circle
            cx={radius}
            cy={radius}
            fill={palette.teal}
            r={size * 0.04}
          />
        </Svg>
      </View>
      {interactive ? (
        <Text style={styles.helperText}>Tap a hand and drag it around the clock.</Text>
      ) : null}
      {showTimePreview ? (
        <Text style={styles.timePreview}>{formatTimeValue(time)}</Text>
      ) : null}
      {showMeridiemToggle ? (
        <View style={styles.meridiemRow}>
          {(['AM', 'PM'] as const).map((option: Meridiem) => {
            const isSelected = option === time.meridiem;

            return (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => onMeridiemChange?.(option)}
                style={[
                  styles.meridiemChip,
                  isSelected && styles.meridiemChipSelected,
                ]}
                testID={`clock-meridiem-${option.toLowerCase()}-button`}
              >
                <Text
                  style={[
                    styles.meridiemText,
                    isSelected && styles.meridiemTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function getTipPoint(angle: number, length: number, radius: number) {
  const radians = (angle * Math.PI) / 180;

  return {
    x: radius + Math.sin(radians) * length,
    y: radius - Math.cos(radians) * length,
  };
}

function pickHand(
  event: GestureResponderEvent,
  size: number,
  hourTip: { x: number; y: number },
  minuteTip: { x: number; y: number },
  radius: number,
): HandName {
  const isWeb = Platform.OS === 'web';
  const { locationX, locationY } = event.nativeEvent;
  const distanceToHour = getDistance(locationX, locationY, hourTip.x, hourTip.y);
  const distanceToMinute = getDistance(
    locationX,
    locationY,
    minuteTip.x,
    minuteTip.y,
  );
  const centerDistance = getDistance(locationX, locationY, radius, radius);
  const touchThreshold = Math.max(size * (isWeb ? 0.16 : 0.11), isWeb ? 42 : 28);

  if (distanceToHour <= touchThreshold || distanceToMinute <= touchThreshold) {
    return distanceToHour < distanceToMinute ? 'hour' : 'minute';
  }

  return centerDistance < radius * (isWeb ? 0.64 : 0.58) ? 'hour' : 'minute';
}

function getDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  clockShell: {
    alignItems: 'center',
    backgroundColor: palette.backgroundAccent,
    borderRadius: 999,
    justifyContent: 'center',
    padding: 6,
    ...shadows.card,
  },
  helperText: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
    textAlign: 'center',
  },
  timePreview: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  meridiemRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  meridiemChip: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    flex: 1,
    paddingVertical: 12,
  },
  meridiemChipSelected: {
    backgroundColor: palette.coral,
  },
  meridiemText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 18,
    fontWeight: '700',
  },
  meridiemTextSelected: {
    color: palette.white,
  },
});
