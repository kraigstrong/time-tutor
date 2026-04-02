import React, { useState } from 'react';
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
import type { FeatureAvailability } from '../types/features';
import type { PlayableMode, SessionType } from '../types/time';
import { getHomeModeTitle } from '../utils/time';

type Props = {
  challengeAvailability: FeatureAvailability;
  mode: PlayableMode;
  onBack: () => void;
  onSelectSession: (sessionType: SessionType) => void;
};

export function ModeChooserScreen({
  challengeAvailability,
  mode,
  onBack,
  onSelectSession,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 760 : 560);
  const [showChallengeHint, setShowChallengeHint] = useState(false);

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
      <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.backButton}
            testID="mode-chooser-back-button"
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{getHomeModeTitle(mode)}</Text>
            <Text style={styles.subtitle}>Choose how you want to play.</Text>
          </View>
        </View>

        <View style={styles.cardColumn}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onSelectSession('practice')}
            style={[styles.optionCard, { borderColor: palette.coral }]}
            testID="practice-session-card"
          >
            <View
              style={[
                styles.optionAccent,
                { backgroundColor: palette.coral },
              ]}
            />
            <Text style={styles.optionTitle}>Practice</Text>
            <Text style={styles.optionDescription}>
              Go at your own pace with instant feedback on each answer.
            </Text>
          </Pressable>

          <View style={styles.challengeWrap}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !challengeAvailability.enabled }}
              onBlur={() => setShowChallengeHint(false)}
              onFocus={() => setShowChallengeHint(true)}
              onHoverIn={() => setShowChallengeHint(true)}
              onHoverOut={() => setShowChallengeHint(false)}
              onPress={() => {
                if (challengeAvailability.enabled) {
                  onSelectSession('challenge');
                }
              }}
              style={[
                styles.optionCard,
                styles.challengeCard,
                {
                  borderColor: challengeAvailability.enabled
                    ? palette.gold
                    : palette.ring,
                },
                !challengeAvailability.enabled && styles.optionCardDisabled,
              ]}
              testID="challenge-session-card"
            >
              <View
                style={[
                  styles.optionAccent,
                  {
                    backgroundColor: challengeAvailability.enabled
                      ? palette.gold
                      : palette.ring,
                  },
                ]}
              />
              <View style={styles.challengeHeadingRow}>
                <Text
                  style={[
                    styles.optionTitle,
                    !challengeAvailability.enabled && styles.optionTitleDisabled,
                  ]}
                >
                  {challengeAvailability.label}
                </Text>
                {!challengeAvailability.enabled ? (
                  <View style={styles.paidOnlyBadge}>
                    <Text style={styles.paidOnlyBadgeText}>Mobile only</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.optionDescription,
                  !challengeAvailability.enabled &&
                    styles.optionDescriptionDisabled,
                ]}
              >
                Answer as many clocks as you can in one minute.
              </Text>
            </Pressable>

            {!challengeAvailability.enabled &&
            challengeAvailability.reason &&
            showChallengeHint ? (
              <View style={styles.tooltip} testID="challenge-unavailable-tooltip">
                <Text style={styles.tooltipText}>
                  {challengeAvailability.reason}
                </Text>
              </View>
            ) : null}
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
  cardColumn: {
    gap: 14,
  },
  optionCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    borderWidth: 2,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 22,
    ...shadows.card,
  },
  challengeCard: {
    backgroundColor: '#FFF7E7',
  },
  optionCardDisabled: {
    backgroundColor: palette.surfaceMuted,
    opacity: 0.7,
  },
  optionAccent: {
    borderRadius: 999,
    height: 12,
    marginBottom: 16,
    width: 64,
  },
  challengeHeadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  optionTitle: {
    color: palette.ink,
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontWeight: '700',
  },
  optionTitleDisabled: {
    color: palette.inkMuted,
  },
  optionDescription: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  optionDescriptionDisabled: {
    color: '#6D7A89',
  },
  challengeWrap: {
    gap: 10,
  },
  tooltip: {
    alignSelf: 'flex-start',
    backgroundColor: palette.ink,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tooltipText: {
    color: palette.white,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '600',
  },
  paidOnlyBadge: {
    backgroundColor: 'rgba(18, 53, 91, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  paidOnlyBadgeText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: '700',
  },
});
