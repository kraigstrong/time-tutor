import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fontFamily, palette, shadows } from '../styles/theme';
import type { Meridiem, TimeValue } from '../types/time';
import { cycleHour, cycleMinute } from '../utils/time';

type DigitalTimeInputProps = {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  showMeridiem?: boolean;
};

type ControlCardProps = {
  label: string;
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  decrementTestID: string;
  incrementTestID: string;
};

export function DigitalTimeInput({
  value,
  onChange,
  showMeridiem = false,
}: DigitalTimeInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the time</Text>
      <View style={styles.controlsRow}>
        <ControlCard
          label="Hour"
          value={String(value.hour12)}
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
          onIncrement={() =>
            onChange({
              ...value,
              minute: cycleMinute(value.minute, 1),
            })
          }
          onDecrement={() =>
            onChange({
              ...value,
              minute: cycleMinute(value.minute, -1),
            })
          }
          decrementTestID="minute-decrement-button"
          incrementTestID="minute-increment-button"
        />
      </View>
      {showMeridiem ? (
        <View style={styles.meridiemRow}>
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
                  isSelected && styles.meridiemChipSelected,
                ]}
                testID={`meridiem-${meridiem.toLowerCase()}-button`}
              >
                <Text
                  style={[
                    styles.meridiemChipText,
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
}: ControlCardProps) {
  return (
    <View style={styles.controlCard}>
      <Text style={styles.controlLabel}>{label}</Text>
      <Text style={styles.controlValue}>{value}</Text>
      <View style={styles.controlButtons}>
        <Pressable
          accessibilityRole="button"
          onPress={onDecrement}
          style={styles.controlButton}
          testID={decrementTestID}
        >
          <Text style={styles.controlButtonText}>-</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onIncrement}
          style={[styles.controlButton, styles.controlButtonAccent]}
          testID={incrementTestID}
        >
          <Text style={styles.controlButtonText}>+</Text>
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
  title: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
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
  controlLabel: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controlValue: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  controlButtonAccent: {
    backgroundColor: palette.teal,
  },
  controlButtonText: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
  },
  meridiemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  meridiemChip: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 999,
    flex: 1,
    paddingVertical: 14,
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
  meridiemChipTextSelected: {
    color: palette.white,
  },
});
