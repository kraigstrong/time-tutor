import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, palette, shadows } from '../styles/theme';
import type { PracticeInterval } from '../types/time';

type Props = {
  interval: PracticeInterval;
  onBack: () => void;
  onSelectInterval: (interval: PracticeInterval) => void;
};

const intervalOptions: Array<{
  description: string;
  label: string;
  value: PracticeInterval;
}> = [
  {
    description: 'Every minute on the clock face.',
    label: '1 minute',
    value: '1-minute',
  },
  {
    description: 'Round to 5 minutes.',
    label: '5 minutes',
    value: '5-minute',
  },
  {
    description: 'Round to 15 minutes.',
    label: '15 minutes',
    value: '15-minute',
  },
  {
    description: 'Hours only, no minute changes.',
    label: 'Hours only',
    value: 'hours-only',
  },
];

export function SettingsScreen({
  interval,
  onBack,
  onSelectInterval,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentWidth = Math.min(width - 24, isTablet ? 760 : 560);

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: Math.max(insets.bottom + 24, 28),
          paddingTop: Math.max(insets.top + 12, 28),
        },
      ]}
      style={styles.scrollView}
    >
      <View style={[styles.content, { maxWidth: contentWidth }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.backButton}
            testID="settings-back-button"
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Choose which time intervals to practice.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionEyebrow}>Practice interval</Text>
          <View style={styles.optionsColumn}>
            {intervalOptions.map(option => {
              const isSelected = option.value === interval;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={option.value}
                  onPress={() => onSelectInterval(option.value)}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  testID={`interval-${option.value}`}
                >
                  <View style={styles.optionRow}>
                    <View
                      style={[
                        styles.optionIndicator,
                        isSelected && styles.optionIndicatorSelected,
                      ]}
                    >
                      {isSelected ? <View style={styles.optionIndicatorDot} /> : null}
                    </View>
                    <View style={styles.optionCopy}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
  },
  content: {
    alignSelf: 'center',
    gap: 18,
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  backButton: {
    backgroundColor: palette.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButtonText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 15,
    fontWeight: '700',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 34,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 30,
    gap: 16,
    padding: 22,
    ...shadows.card,
  },
  sectionEyebrow: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  optionsColumn: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionCardSelected: {
    backgroundColor: '#FFF4E8',
    borderColor: palette.coral,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  optionIndicator: {
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.ring,
    borderRadius: 999,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  optionIndicatorSelected: {
    borderColor: palette.coral,
  },
  optionIndicatorDot: {
    backgroundColor: palette.coral,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 22,
    fontWeight: '700',
  },
  optionLabelSelected: {
    color: palette.coral,
  },
  optionDescription: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
