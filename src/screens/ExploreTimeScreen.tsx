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
  practiceInterval?: PracticeInterval;
  timeFormat?: TimeFormat;
};

export function ExploreTimeScreen({
  onBack,
  practiceInterval = '5-minute',
  timeFormat = '12-hour',
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [time, setTime] = useState<TimeValue>(() =>
    randomTimeValueForInterval(practiceInterval),
  );

  const isTablet = width >= 768;
  const isWideWeb = Platform.OS === 'web' && width >= 1100;
  const useCompactDigitalInput = !isTablet;
  const contentMaxWidth = Math.min(
    width - 24,
    isWideWeb ? 1180 : isTablet ? 860 : 620,
  );
  const clockSize = Math.max(
    Math.min(
      contentMaxWidth * (isWideWeb ? 0.29 : isTablet ? 0.48 : 0.78),
      isWideWeb ? 360 : isTablet ? 420 : 340,
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
        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={styles.backButton}
              testID="explore-back-button"
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Explore time</Text>
              <Text style={styles.subtitle}>
                Move the clock or change the time. Everything updates instantly.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.exploreLayout,
              isWideWeb && styles.exploreLayoutWide,
            ]}
          >
            <View
              style={[
                styles.exploreColumn,
                isWideWeb && styles.clockColumn,
              ]}
            >
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

            <View
              style={[
                styles.exploreColumn,
                isWideWeb && styles.digitalColumn,
              ]}
            >
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
  exploreLayout: {
    gap: 16,
  },
  exploreLayoutWide: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  exploreColumn: {
    gap: 16,
  },
  clockColumn: {
    flex: 1,
    minWidth: 0,
  },
  digitalColumn: {
    flex: 0.9,
    minWidth: 0,
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
