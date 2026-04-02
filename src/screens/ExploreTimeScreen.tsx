import React, { useMemo, useState, type SetStateAction } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalogClock } from '../components/AnalogClock';
import { DigitalTimeInput } from '../components/DigitalTimeInput';
import { HeaderSettingsButton } from '../components/HeaderSettingsButton';
import { fontFamily, palette, shadows } from '../styles/theme';
import type {
  DigitalTimeValue,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '../types/time';
import {
  digitalValueToTimeValue,
  normalizeAnalogTimeFor24Hour,
  randomTimeValueForInterval,
  timeValueToDigitalValue,
} from '../utils/time';

type Props = {
  onBack: () => void;
  onOpenSettings: () => void;
  practiceInterval?: PracticeInterval;
  timeFormat?: TimeFormat;
};

export function ExploreTimeScreen({
  onBack,
  onOpenSettings,
  practiceInterval = '5-minute',
  timeFormat = '12-hour',
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [time, setTime] = useState<TimeValue>(() =>
    randomTimeValueForInterval(practiceInterval),
  );

  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const useCompactDigitalInput = !isTablet;
  const headerMaxWidth = Math.min(width - 24, 860);
  const contentMaxWidth = Math.min(
    width - 24,
    isTablet ? 860 : 620,
  );
  const clockSize = Math.max(
    Math.min(
      contentMaxWidth * (isTablet ? 0.48 : 0.78),
      isTablet ? 420 : 340,
    ),
    260,
  );

  const digitalValue = useMemo(
    () => timeValueToDigitalValue(time, timeFormat),
    [time, timeFormat],
  );

  const handleClockChange = (value: SetStateAction<TimeValue>) => {
    setTime(currentTime =>
      {
        const nextTime =
          typeof value === 'function' ? value(currentTime) : value;

        return timeFormat === '24-hour'
          ? normalizeAnalogTimeFor24Hour(currentTime, nextTime)
          : nextTime;
      },
    );
  };

  const handleDigitalChange = (value: DigitalTimeValue) => {
    setTime(currentTime =>
      digitalValueToTimeValue(value, timeFormat, currentTime.meridiem),
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom + 18, 24),
            paddingTop: Math.max(insets.top + 12, 28),
          },
        ]}
        scrollEnabled={!clockInteractionActive}
        style={styles.scrollView}
      >
        <View style={[styles.headerShell, { maxWidth: headerMaxWidth }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerSideSlot}>
              <Pressable
                accessibilityRole="button"
                onPress={onBack}
                style={styles.backButton}
                testID="explore-back-button"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Explore time</Text>
            </View>
            <View style={styles.headerSideSlot}>
              <HeaderSettingsButton
                onPress={onOpenSettings}
                testID="explore-open-settings-button"
              />
            </View>
          </View>
        </View>

        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <View style={styles.exploreLayout}>
            <View style={styles.exploreColumn}>
              <View style={styles.clockCard}>
                <Text style={styles.cardEyebrow}>Analog clock</Text>
                <AnalogClock
                  interactive
                  onChange={handleClockChange}
                  onInteractionEnd={() => setClockInteractionActive(false)}
                  onInteractionStart={() => setClockInteractionActive(true)}
                  practiceInterval={practiceInterval}
                  previewIncludeMeridiem={false}
                  showInteractionHint
                  showTimePreview
                  size={clockSize}
                  time={time}
                  timeFormat={timeFormat}
                />
              </View>
            </View>

            <View style={styles.exploreColumn}>
              <DigitalTimeInput
                compact={useCompactDigitalInput}
                onChange={handleDigitalChange}
                practiceInterval={practiceInterval}
                timeFormat={timeFormat}
                value={digitalValue}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scrollView: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  content: {
    alignSelf: 'center',
    gap: 16,
    width: '100%',
  },
  headerShell: {
    alignSelf: 'center',
    marginBottom: 16,
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerSideSlot: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 68,
  },
  backButton: {
    backgroundColor: palette.surface,
    borderRadius: 999,
    minWidth: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 15,
    fontWeight: '700',
  },
  headerCopy: {
    alignItems: 'center',
    flex: 1,
    gap: 0,
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  exploreLayout: {
    gap: 16,
  },
  exploreColumn: {
    gap: 16,
  },
  clockCard: {
    backgroundColor: palette.surface,
    borderRadius: 30,
    gap: 16,
    padding: 20,
    ...shadows.card,
  },
  cardEyebrow: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});
