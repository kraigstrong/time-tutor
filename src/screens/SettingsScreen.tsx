import React from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, palette, shadows } from '../styles/theme';
import type { FeatureAvailability } from '../types/features';
import type { PracticeInterval, TimeFormat } from '../types/time';
import { getSiteUrl } from '../utils/siteLinks';

type Props = {
  interval: PracticeInterval;
  onBack: () => void;
  onSelectInterval: (interval: PracticeInterval) => void;
  onSelectTimeFormat: (timeFormat: TimeFormat) => void;
  timeFormat: TimeFormat;
  timeFormat24Availability: FeatureAvailability;
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

const timeFormatOptions: Array<{
  description: string;
  label: string;
  value: TimeFormat;
}> = [
  {
    description: 'Show times like 3:15.',
    label: '12-hour',
    value: '12-hour',
  },
  {
    description: 'Show times like 15:15.',
    label: '24-hour',
    value: '24-hour',
  },
];

export function SettingsScreen({
  interval,
  onBack,
  onSelectInterval,
  onSelectTimeFormat,
  timeFormat,
  timeFormat24Availability,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [gateAnswer, setGateAnswer] = React.useState('');
  const [gateError, setGateError] = React.useState('');
  const [pendingExternalUrl, setPendingExternalUrl] = React.useState<string | null>(null);
  const [gatePrompt, setGatePrompt] = React.useState(() => createParentalGatePrompt());
  const isTablet = width >= 768;
  const headerMaxWidth = Math.min(width - 24, 860);
  const contentWidth = Math.min(width - 24, isTablet ? 760 : 560);
  const isNativeIos = Platform.OS === 'ios';
  const openExternalLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };
  const closeGate = React.useCallback(() => {
    setPendingExternalUrl(null);
    setGateAnswer('');
    setGateError('');
  }, []);
  const handleHelpLinkPress = React.useCallback(
    (url: string) => {
      if (!isNativeIos) {
        openExternalLink(url);
        return;
      }

      setGatePrompt(createParentalGatePrompt());
      setGateAnswer('');
      setGateError('');
      setPendingExternalUrl(url);
    },
    [isNativeIos],
  );
  const submitGate = React.useCallback(() => {
    if (gateAnswer.trim() === String(gatePrompt.answer) && pendingExternalUrl) {
      closeGate();
      openExternalLink(pendingExternalUrl);
      return;
    }

    setGateAnswer('');
    setGateError('Please ask a parent to try again.');
    setGatePrompt(createParentalGatePrompt());
  }, [closeGate, gateAnswer, gatePrompt.answer, pendingExternalUrl]);

  return (
    <>
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
        <View style={[styles.headerShell, { maxWidth: headerMaxWidth }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerSideSlot}>
              <Pressable
                accessibilityRole="button"
                onPress={onBack}
                style={styles.backButton}
                testID="settings-back-button"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Settings</Text>
            </View>
            <View style={styles.headerSideSlot} />
          </View>
        </View>

        <View style={[styles.content, { maxWidth: contentWidth }]}>
          <Text style={styles.subtitle}>
            Choose which time intervals to practice.
          </Text>

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

        <View style={[styles.content, styles.contentSectionSpacing, { maxWidth: contentWidth }]}>
          <View style={styles.card}>
            <Text style={styles.sectionEyebrow}>Time format</Text>
            <Text style={styles.sectionDescription}>
              Choose how digital times are shown and entered.
            </Text>
            <View style={styles.optionsColumn}>
              {timeFormatOptions.map(option => {
                const isSelected = option.value === timeFormat;
                const isLocked =
                  option.value === '24-hour' && !timeFormat24Availability.enabled;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isLocked }}
                    disabled={isLocked}
                    key={option.value}
                    onPress={() => onSelectTimeFormat(option.value)}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                      isLocked && styles.optionCardDisabled,
                    ]}
                    testID={`time-format-${option.value}`}
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
                        <View style={styles.optionTitleRow}>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && styles.optionLabelSelected,
                              isLocked && styles.optionLabelDisabled,
                            ]}
                          >
                            {option.label}
                          </Text>
                          {isLocked ? (
                            <View style={styles.lockedBadge}>
                              <Text style={styles.lockedBadgeText}>Locked</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.optionDescription,
                            isLocked && styles.optionDescriptionDisabled,
                          ]}
                        >
                          {option.description}
                        </Text>
                        {isLocked && timeFormat24Availability.reason ? (
                          <Text style={styles.lockedReason}>
                            {timeFormat24Availability.reason}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={[styles.content, styles.contentSectionSpacing, { maxWidth: contentWidth }]}>
          <View style={styles.card}>
            <Text style={styles.sectionEyebrow}>Help</Text>
            <View style={styles.linksColumn}>
              <Pressable
                accessibilityRole="link"
                onPress={() => handleHelpLinkPress(getSiteUrl('/support'))}
                style={styles.linkRow}
                testID="settings-support-link"
              >
                <Text style={styles.linkLabel}>Support</Text>
                <Text style={styles.linkArrow}>↗</Text>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                onPress={() => handleHelpLinkPress(getSiteUrl('/privacy'))}
                style={styles.linkRow}
                testID="settings-privacy-link"
              >
                <Text style={styles.linkLabel}>Privacy Policy</Text>
                <Text style={styles.linkArrow}>↗</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={closeGate}
        transparent
        visible={pendingExternalUrl !== null}
      >
        <View style={styles.gateBackdrop}>
          <View style={styles.gateCard}>
            <Text style={styles.gateTitle}>Parent Check</Text>
            <Text style={styles.gateDescription}>
              Ask a parent to answer this before opening a website.
            </Text>
            <Text style={styles.gateQuestion} testID="parental-gate-question">
              What is {gatePrompt.left} + {gatePrompt.right}?
            </Text>
            <TextInput
              accessibilityLabel="Parental gate answer"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="number-pad"
              onChangeText={text => {
                setGateAnswer(text);
                if (gateError) {
                  setGateError('');
                }
              }}
              placeholder="Enter answer"
              placeholderTextColor={palette.inkMuted}
              style={styles.gateInput}
              testID="parental-gate-input"
              value={gateAnswer}
            />
            {gateError ? (
              <Text style={styles.gateError} testID="parental-gate-error">
                {gateError}
              </Text>
            ) : null}
            <View style={styles.gateActions}>
              <Pressable onPress={closeGate} style={styles.gateSecondaryButton} testID="parental-gate-cancel">
                <Text style={styles.gateSecondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={submitGate} style={styles.gatePrimaryButton} testID="parental-gate-continue">
                <Text style={styles.gatePrimaryButtonText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createParentalGatePrompt() {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 2;

  return {
    answer: left + right,
    left,
    right,
  };
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
  contentSectionSpacing: {
    marginTop: 12,
  },
  headerShell: {
    alignSelf: 'center',
    marginBottom: 18,
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
  subtitle: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -4,
    textAlign: 'center',
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
  sectionDescription: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -6,
  },
  optionsColumn: {
    gap: 12,
  },
  linksColumn: {
    gap: 10,
  },
  linkRow: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkLabel: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: '700',
  },
  linkArrow: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 18,
    fontWeight: '700',
  },
  gateBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 53, 91, 0.34)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gateCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    maxWidth: 420,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: '100%',
    ...shadows.card,
  },
  gateTitle: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  gateDescription: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 17,
    lineHeight: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  gateQuestion: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  gateInput: {
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.ring,
    borderRadius: 18,
    borderWidth: 1,
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    textAlign: 'center',
  },
  gateError: {
    color: palette.danger,
    fontFamily: fontFamily.body,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  gateActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  gateSecondaryButton: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: 18,
    flex: 1,
    paddingVertical: 14,
  },
  gateSecondaryButtonText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 17,
    fontWeight: '700',
  },
  gatePrimaryButton: {
    alignItems: 'center',
    backgroundColor: palette.ink,
    borderRadius: 18,
    flex: 1,
    paddingVertical: 14,
  },
  gatePrimaryButtonText: {
    color: palette.white,
    fontFamily: fontFamily.body,
    fontSize: 17,
    fontWeight: '700',
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
  optionCardDisabled: {
    opacity: 0.72,
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
  optionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
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
  optionLabelDisabled: {
    color: palette.inkMuted,
  },
  optionDescription: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
  },
  optionDescriptionDisabled: {
    color: '#6D7A89',
  },
  lockedBadge: {
    backgroundColor: palette.ring,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lockedBadgeText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: '700',
  },
  lockedReason: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
