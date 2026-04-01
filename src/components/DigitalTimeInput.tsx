import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily, palette, shadows } from '../styles/theme';
import type { Meridiem, PracticeInterval, TimeValue } from '../types/time';
import { cycleHour, cycleMinuteForInterval } from '../utils/time';

type DigitalTimeInputProps = {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  showMeridiem?: boolean;
  practiceInterval?: PracticeInterval;
  disabled?: boolean;
  compact?: boolean;
};

type ControlCardProps = {
  label: string;
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  decrementTestID: string;
  incrementTestID: string;
  disabled?: boolean;
  compact?: boolean;
};

export function DigitalTimeInput({
  value,
  onChange,
  showMeridiem = false,
  practiceInterval = '5-minute',
  disabled = false,
  compact = false,
}: DigitalTimeInputProps) {
  const showMinuteControls = practiceInterval !== 'hours-only';

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={[styles.title, compact && styles.titleCompact]}>Enter the time</Text>
      <View style={[styles.controlsRow, compact && styles.controlsRowCompact]}>
        <ControlCard
          label="Hour"
          value={String(value.hour12)}
          compact={compact}
          disabled={disabled}
          onIncrement={() =>
            onChange({
              ...value,
              hour12: cycleHour(value.hour12, 1),
            })
          }
          onDecrement={() =>
            onChange({
              ...value,
              hour12: cycleHour(value.hour12, -1),
            })
          }
          decrementTestID="hour-decrement-button"
          incrementTestID="hour-increment-button"
        />
        <ControlCard
          label="Minute"
          value={String(value.minute).padStart(2, '0')}
          compact={compact}
          disabled={disabled || !showMinuteControls}
          onIncrement={() =>
            onChange({
              ...value,
              minute: cycleMinuteForInterval(value.minute, 1, practiceInterval),
            })
          }
          onDecrement={() =>
            onChange({
              ...value,
              minute: cycleMinuteForInterval(value.minute, -1, practiceInterval),
            })
          }
          decrementTestID="minute-decrement-button"
          incrementTestID="minute-increment-button"
        />
      </View>
      {showMeridiem ? (
        <View style={[styles.meridiemRow, compact && styles.meridiemRowCompact]}>
          {(['AM', 'PM'] as const).map((meridiem: Meridiem) => {
            const isSelected = meridiem === value.meridiem;

            return (
              <Pressable
                accessibilityRole="button"
                key={meridiem}
                onPress={() =>
                  onChange({
                    ...value,
                    meridiem,
                  })
                }
                style={[
                  styles.meridiemChip,
                  compact && styles.meridiemChipCompact,
                  isSelected && styles.meridiemChipSelected,
                ]}
                testID={`meridiem-${meridiem.toLowerCase()}-button`}
              >
                <Text
                  style={[
                    styles.meridiemChipText,
                    compact && styles.meridiemChipTextCompact,
                    isSelected && styles.meridiemChipTextSelected,
                  ]}
                >
                  {meridiem}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
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
  disabled = false,
  compact = false,
}: ControlCardProps) {
  return (
    <View
      style={[
        styles.controlCard,
        compact && styles.controlCardCompact,
        disabled && styles.controlCardDisabled,
      ]}
    >
      <Text style={[styles.controlLabel, compact && styles.controlLabelCompact]}>
        {label}
      </Text>
      <Text style={[styles.controlValue, compact && styles.controlValueCompact]}>
        {value}
      </Text>
      <View style={[styles.controlButtons, compact && styles.controlButtonsCompact]}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onDecrement}
          style={[
            styles.controlButton,
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
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onIncrement}
          style={[
            styles.controlButton,
            compact && styles.controlButtonCompact,
            styles.controlButtonAccent,
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
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 20,
    gap: 18,
    ...shadows.card,
  },
  containerCompact: {
    borderRadius: 24,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 18,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlsRowCompact: {
    gap: 10,
  },
  controlCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 10,
  },
  controlCardCompact: {
    borderRadius: 18,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  controlCardDisabled: {
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
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  controlValueCompact: {
    fontSize: 30,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButtonsCompact: {
    gap: 8,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  controlButtonCompact: {
    height: 36,
    width: 36,
  },
  controlButtonAccent: {
    backgroundColor: palette.teal,
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  controlButtonText: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
  },
  controlButtonTextCompact: {
    fontSize: 20,
  },
  meridiemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meridiemRowCompact: {
    gap: 10,
  },
  meridiemChip: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    flex: 1,
    paddingVertical: 14,
  },
  meridiemChipCompact: {
    paddingVertical: 10,
  },
  meridiemChipSelected: {
    backgroundColor: palette.coral,
  },
  meridiemChipText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 18,
    fontWeight: '700',
  },
  meridiemChipTextCompact: {
    fontSize: 15,
  },
  meridiemChipTextSelected: {
    color: palette.white,
  },
});
