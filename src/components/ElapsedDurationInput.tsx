import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily, palette } from '../styles/theme';
import type { ElapsedDurationValue, PracticeInterval } from '../types/time';
import {
  cycleElapsedHours,
  cycleMinuteForInterval,
} from '../utils/time';

type Props = {
  value: ElapsedDurationValue;
  onChange: (value: ElapsedDurationValue) => void;
  practiceInterval?: PracticeInterval;
  disabled?: boolean;
  compact?: boolean;
};

type ControlProps = {
  compact: boolean;
  decrementTestID: string;
  disabled: boolean;
  incrementTestID: string;
  label: string;
  onDecrement: () => void;
  onIncrement: () => void;
  value: string;
  valueTestID: string;
};

export function ElapsedDurationInput({
  value,
  onChange,
  practiceInterval = '5-minute',
  disabled = false,
  compact = false,
}: Props) {
  const showMinuteControls = practiceInterval !== 'hours-only';

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={[styles.controlsRow, compact && styles.controlsRowCompact]}>
        <Control
          compact={compact}
          decrementTestID="elapsed-hours-decrement-button"
          disabled={disabled}
          incrementTestID="elapsed-hours-increment-button"
          label="Hours"
          onDecrement={() =>
            onChange({
              ...value,
              hours: cycleElapsedHours(value.hours, -1),
            })
          }
          onIncrement={() =>
            onChange({
              ...value,
              hours: cycleElapsedHours(value.hours, 1),
            })
          }
          value={String(value.hours)}
          valueTestID="elapsed-hours-value"
        />
        <Text style={[styles.separator, compact && styles.separatorCompact]}>:</Text>
        <Control
          compact={compact}
          decrementTestID="elapsed-minutes-decrement-button"
          disabled={disabled || !showMinuteControls}
          incrementTestID="elapsed-minutes-increment-button"
          label="Minutes"
          onDecrement={() =>
            onChange({
              ...value,
              minutes: cycleMinuteForInterval(
                value.minutes,
                -1,
                practiceInterval,
              ),
            })
          }
          onIncrement={() =>
            onChange({
              ...value,
              minutes: cycleMinuteForInterval(
                value.minutes,
                1,
                practiceInterval,
              ),
            })
          }
          value={String(value.minutes).padStart(2, '0')}
          valueTestID="elapsed-minutes-value"
        />
      </View>
    </View>
  );
}

function Control({
  compact,
  decrementTestID,
  disabled,
  incrementTestID,
  label,
  onDecrement,
  onIncrement,
  value,
  valueTestID,
}: ControlProps) {
  return (
    <View style={[styles.controlGroup, compact && styles.controlGroupCompact]}>
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
          onPress={onDecrement}
          style={[
            styles.controlStepper,
            compact && styles.controlStepperCompact,
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
          onPress={onIncrement}
          style={[
            styles.controlStepper,
            compact && styles.controlStepperCompact,
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
  controlLabel: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  controlLabelCompact: {
    fontSize: 12,
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
  controlStepper: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  controlStepperCompact: {
    height: 36,
    width: 36,
  },
  controlStepperAccent: {
    backgroundColor: palette.coral,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButtonText: {
    color: palette.white,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  controlButtonTextCompact: {
    fontSize: 20,
    lineHeight: 24,
  },
  controlValue: {
    color: palette.white,
    fontFamily: fontFamily.display,
    fontSize: 36,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    minWidth: 52,
    textAlign: 'center',
  },
  controlValueCompact: {
    fontSize: 30,
    minWidth: 44,
  },
});
