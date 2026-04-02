import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily, palette } from '../styles/theme';
import type {
  DigitalTimeValue,
  PracticeInterval,
  TimeFormat,
} from '../types/time';
import {
  cycleDigitalHour,
  cycleMinuteForInterval,
} from '../utils/time';

type DigitalTimeInputProps = {
  value: DigitalTimeValue;
  onChange: (value: DigitalTimeValue) => void;
  showMeridiem?: boolean;
  practiceInterval?: PracticeInterval;
  disabled?: boolean;
  compact?: boolean;
  timeFormat?: TimeFormat;
};

type ControlCardProps = {
  label: string;
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  decrementTestID: string;
  incrementTestID: string;
  valueTestID: string;
  disabled?: boolean;
  compact?: boolean;
};

export function DigitalTimeInput({
  value,
  onChange,
  practiceInterval = '5-minute',
  disabled = false,
  compact = false,
  timeFormat = '12-hour',
}: DigitalTimeInputProps) {
  const showMinuteControls = practiceInterval !== 'hours-only';
  const latestValueRef = useRef(value);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  const commitNextValue = useCallback(
    (nextValue: DigitalTimeValue) => {
      latestValueRef.current = nextValue;
      onChange(nextValue);
    },
    [onChange],
  );

  const stepHour = useCallback(
    (direction: 1 | -1) => {
      const currentValue = latestValueRef.current;
      const nextValue = {
        ...currentValue,
        hour: cycleDigitalHour(currentValue.hour, direction, timeFormat),
      };

      commitNextValue(nextValue);
    },
    [commitNextValue, timeFormat],
  );

  const stepMinute = useCallback(
    (direction: 1 | -1) => {
      const currentValue = latestValueRef.current;
      const nextValue = {
        ...currentValue,
        minute: cycleMinuteForInterval(
          currentValue.minute,
          direction,
          practiceInterval,
        ),
      };

      commitNextValue(nextValue);
    },
    [commitNextValue, practiceInterval],
  );

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.controlsRow, compact && styles.controlsRowCompact]}>
        <ControlCard
          label="Hour"
          value={
            timeFormat === '24-hour'
              ? String(value.hour).padStart(2, '0')
              : String(value.hour)
          }
          compact={compact}
          disabled={disabled}
          onIncrement={() => stepHour(1)}
          onDecrement={() => stepHour(-1)}
          decrementTestID="hour-decrement-button"
          incrementTestID="hour-increment-button"
          valueTestID="hour-value"
        />
        <Text style={[styles.separator, compact && styles.separatorCompact]}>:</Text>
        <ControlCard
          label="Minute"
          value={String(value.minute).padStart(2, '0')}
          compact={compact}
          disabled={disabled || !showMinuteControls}
          onIncrement={() => stepMinute(1)}
          onDecrement={() => stepMinute(-1)}
          decrementTestID="minute-decrement-button"
          incrementTestID="minute-increment-button"
          valueTestID="minute-value"
        />
      </View>
      <Text style={[styles.tipText, compact && styles.tipTextCompact]}>
        Tip: press and hold + or - to adjust faster.
      </Text>
    </View>
  );
}

function ControlCard({
  label,
  value,
  onIncrement,
  onDecrement,
  decrementTestID,
  incrementTestID,
  valueTestID,
  disabled = false,
  compact = false,
}: ControlCardProps) {
  const holdDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const stopRepeating = useCallback(() => {
    if (holdDelayTimeoutRef.current) {
      clearTimeout(holdDelayTimeoutRef.current);
      holdDelayTimeoutRef.current = null;
    }
    if (repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => stopRepeating, [stopRepeating]);

  const startRepeating = useCallback(
    (action: () => void) => {
      stopRepeating();
      longPressTriggeredRef.current = true;

      const startedAt = Date.now();

      const tick = () => {
        action();

        const elapsed = Date.now() - startedAt;
        const nextDelay =
          elapsed >= 1200 ? 42 : elapsed >= 550 ? 90 : 140;

        repeatTimeoutRef.current = setTimeout(tick, nextDelay);
      };

      tick();
    },
    [stopRepeating],
  );

  const scheduleRepeating = useCallback(
    (action: () => void) => {
      stopRepeating();
      longPressTriggeredRef.current = false;

      holdDelayTimeoutRef.current = setTimeout(() => {
        holdDelayTimeoutRef.current = null;
        startRepeating(action);
      }, 220);
    },
    [startRepeating, stopRepeating],
  );

  const handlePress = useCallback((action: () => void) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    action();
  }, []);

  return (
    <View
      style={[
        styles.controlGroup,
        compact && styles.controlGroupCompact,
      ]}
    >
      <Text style={[styles.controlLabel, compact && styles.controlLabelCompact]}>
        {label}
      </Text>
      <View
        style={[
          styles.controlShell,
          compact && styles.controlShellCompact,
          disabled && styles.controlShellDisabled,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPressIn={() => scheduleRepeating(onDecrement)}
          onPress={() => handlePress(onDecrement)}
          onPressOut={stopRepeating}
          style={[
            styles.controlStepper,
            compact && styles.controlButtonCompact,
            disabled && styles.controlButtonDisabled,
          ]}
          testID={decrementTestID}
        >
          <Text
            style={[
              styles.controlButtonText,
              compact && styles.controlButtonTextCompact,
            ]}
          >
            -
          </Text>
        </Pressable>
        <Text
          style={[styles.controlValue, compact && styles.controlValueCompact]}
          numberOfLines={1}
          testID={valueTestID}
        >
          {value}
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPressIn={() => scheduleRepeating(onIncrement)}
          onPress={() => handlePress(onIncrement)}
          onPressOut={stopRepeating}
          style={[
            styles.controlStepper,
            compact && styles.controlButtonCompact,
            styles.controlStepperAccent,
            disabled && styles.controlButtonDisabled,
          ]}
          testID={incrementTestID}
        >
          <Text
            style={[
              styles.controlButtonText,
              compact && styles.controlButtonTextCompact,
            ]}
          >
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  containerCompact: {
    gap: 10,
  },
  controlsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  controlsRowCompact: {
    gap: 10,
  },
  separator: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 64,
    paddingTop: 24,
  },
  separatorCompact: {
    fontSize: 34,
    lineHeight: 54,
    paddingTop: 20,
  },
  controlGroup: {
    alignItems: 'center',
    gap: 8,
  },
  controlGroupCompact: {
    gap: 6,
  },
  controlShell: {
    alignItems: 'center',
    backgroundColor: palette.ink,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    minHeight: 64,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  controlShellCompact: {
    gap: 6,
    minHeight: 54,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  controlShellDisabled: {
    opacity: 0.8,
  },
  controlLabel: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controlLabelCompact: {
    fontSize: 12,
  },
  controlValue: {
    color: palette.white,
    fontFamily: fontFamily.display,
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    minWidth: 52,
    textAlign: 'center',
  },
  controlValueCompact: {
    fontSize: 30,
    minWidth: 44,
  },
  controlStepper: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  controlButtonCompact: {
    height: 36,
    width: 36,
  },
  controlStepperAccent: {
    backgroundColor: palette.teal,
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  tipText: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  tipTextCompact: {
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 240,
  },
  controlButtonText: {
    color: palette.white,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
  },
  controlButtonTextCompact: {
    fontSize: 20,
  },
});
