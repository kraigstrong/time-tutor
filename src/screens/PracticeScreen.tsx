import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  type DimensionValue,
  Easing,
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
  ExerciseMode,
  PracticeInterval,
  SubmissionResult,
  TimeFormat,
  TimeValue,
} from '../types/time';
import {
  areTimesEqual,
  createInitialAnswer,
  createInitialDigitalAnswer,
  formatDigitalTimeValue,
  formatTimeValue,
  isDigitalAnswerCorrect,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '../utils/time';

type Props = {
  mode: ExerciseMode;
  onBack: () => void;
  onOpenSettings: () => void;
  practiceInterval?: PracticeInterval;
  timeFormat?: TimeFormat;
};

type PracticeResult = SubmissionResult<
  TimeValue,
  TimeValue | DigitalTimeValue
>;

const SUCCESS_CONFETTI = [
  { color: '#F6BD39', delay: 0, drift: -20, leftPercent: 12, rotate: -18, top: 16 },
  { color: '#0FA3B1', delay: 40, drift: -16, leftPercent: 22, rotate: 12, top: 34 },
  { color: '#7ED6A5', delay: 70, drift: -10, leftPercent: 30, rotate: -8, top: 6 },
  { color: '#FF7AA2', delay: 110, drift: -6, leftPercent: 40, rotate: 18, top: 28 },
  { color: '#FF9F1C', delay: 30, drift: 0, leftPercent: 48, rotate: -14, top: 14 },
  { color: '#2D3142', delay: 95, drift: 4, leftPercent: 56, rotate: 22, top: 44 },
  { color: '#F6BD39', delay: 130, drift: 8, leftPercent: 64, rotate: -20, top: 10 },
  { color: '#0FA3B1', delay: 55, drift: 12, leftPercent: 72, rotate: 16, top: 32 },
  { color: '#7ED6A5', delay: 145, drift: 18, leftPercent: 82, rotate: -24, top: 18 },
  { color: '#FF7AA2', delay: 85, drift: 20, leftPercent: 18, rotate: 24, top: 58 },
  { color: '#FF9F1C', delay: 120, drift: -12, leftPercent: 68, rotate: -28, top: 62 },
  { color: '#2D3142', delay: 160, drift: 14, leftPercent: 86, rotate: 10, top: 54 },
  { color: '#FF7AA2', delay: 15, drift: -24, leftPercent: 8, rotate: -26, top: 24 },
  { color: '#F6BD39', delay: 28, drift: -18, leftPercent: 16, rotate: 18, top: 50 },
  { color: '#0FA3B1', delay: 48, drift: -14, leftPercent: 24, rotate: -10, top: 12 },
  { color: '#7ED6A5', delay: 64, drift: -8, leftPercent: 34, rotate: 20, top: 40 },
  { color: '#FF9F1C', delay: 88, drift: -2, leftPercent: 42, rotate: -18, top: 8 },
  { color: '#2D3142', delay: 104, drift: 2, leftPercent: 50, rotate: 26, top: 34 },
  { color: '#FF7AA2', delay: 118, drift: 6, leftPercent: 58, rotate: -12, top: 18 },
  { color: '#F6BD39', delay: 138, drift: 10, leftPercent: 66, rotate: 16, top: 48 },
  { color: '#0FA3B1', delay: 154, drift: 16, leftPercent: 76, rotate: -24, top: 12 },
  { color: '#7ED6A5', delay: 172, drift: 22, leftPercent: 90, rotate: 14, top: 42 },
  { color: '#FF9F1C', delay: 36, drift: -22, leftPercent: 14, rotate: -22, top: 72 },
  { color: '#2D3142', delay: 112, drift: 12, leftPercent: 80, rotate: 28, top: 70 },
  { color: '#7ED6A5', delay: 22, drift: -20, leftPercent: 10, rotate: 8, top: 92 },
  { color: '#FF7AA2', delay: 58, drift: -12, leftPercent: 26, rotate: -16, top: 84 },
  { color: '#F6BD39', delay: 74, drift: -6, leftPercent: 38, rotate: 24, top: 100 },
  { color: '#0FA3B1', delay: 92, drift: 0, leftPercent: 46, rotate: -20, top: 88 },
  { color: '#FF9F1C', delay: 126, drift: 8, leftPercent: 60, rotate: 12, top: 96 },
  { color: '#2D3142', delay: 142, drift: 14, leftPercent: 72, rotate: -26, top: 82 },
  { color: '#7ED6A5', delay: 166, drift: 18, leftPercent: 84, rotate: 18, top: 98 },
  { color: '#FF7AA2', delay: 184, drift: 24, leftPercent: 92, rotate: -14, top: 90 },
  { color: '#F6BD39', delay: 50, drift: -16, leftPercent: 20, rotate: 10, top: 118 },
  { color: '#0FA3B1', delay: 82, drift: -8, leftPercent: 32, rotate: -24, top: 126 },
  { color: '#FF9F1C', delay: 108, drift: 4, leftPercent: 54, rotate: 20, top: 120 },
  { color: '#2D3142', delay: 148, drift: 12, leftPercent: 70, rotate: -18, top: 132 },
] satisfies ReadonlyArray<{
  color: string;
  delay: number;
  drift: number;
  leftPercent: number;
  rotate: number;
  top: number;
}>;

export function PracticeScreen({
  mode,
  onBack,
  onOpenSettings,
  practiceInterval = '5-minute',
  timeFormat = '12-hour',
}: Props) {
  const showMeridiem = false;
  const insets = useSafeAreaInsets();
  const [promptTime, setPromptTime] = useState<TimeValue>(() =>
    randomTimeValueForInterval(practiceInterval),
  );
  const [analogAnswer, setAnalogAnswer] = useState<TimeValue>(() =>
    createInitialAnswer(promptTime.meridiem),
  );
  const [digitalAnswer, setDigitalAnswer] = useState<DigitalTimeValue>(() =>
    createInitialDigitalAnswer(timeFormat),
  );
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const { width } = useWindowDimensions();

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
  const promptClockSize = clockSize;
  const showSuccessOverlay = Boolean(result?.isCorrect);
  const showWrongAnswerOverlay = Boolean(result && !result.isCorrect);
  const successConfettiStartY = mode === 'analog-to-digital' ? -58 : -26;
  const successConfettiEndY = mode === 'analog-to-digital' ? 92 : 172;
  const confettiValues = useRef(
    SUCCESS_CONFETTI.map(() => new Animated.Value(0)),
  ).current;

  const goToNextPrompt = useCallback(() => {
    const nextPrompt = nextTimeValueForInterval(promptTime, practiceInterval);

    setPromptTime(nextPrompt);
    setAnalogAnswer(createInitialAnswer(nextPrompt.meridiem));
    setDigitalAnswer(createInitialDigitalAnswer(timeFormat));
    setResult(null);
  }, [practiceInterval, promptTime, timeFormat]);

  useEffect(() => {
    if (!result?.isCorrect) {
      return;
    }

    const timer = setTimeout(() => {
      goToNextPrompt();
    }, 1500);

    return () => clearTimeout(timer);
  }, [goToNextPrompt, result]);

  useEffect(() => {
    if (!showSuccessOverlay) {
      confettiValues.forEach(value => value.setValue(0));
      return;
    }

    Animated.parallel(
      confettiValues.map((value, index) =>
        Animated.timing(value, {
          delay: SUCCESS_CONFETTI[index].delay,
          duration: 780,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [confettiValues, showSuccessOverlay]);

  const successConfetti = useMemo(
    () =>
      SUCCESS_CONFETTI.map((piece, index) => {
        const progress = confettiValues[index];

        return (
          <Animated.View
            key={`practice-success-confetti-${index}`}
            style={[
              styles.successConfetti,
              {
                backgroundColor: piece.color,
                left: `${piece.leftPercent}%` as DimensionValue,
                top: piece.top,
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, piece.drift],
                    }),
                  },
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        successConfettiStartY,
                        successConfettiEndY,
                      ],
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        `${piece.rotate}deg`,
                        `${piece.rotate + 130}deg`,
                      ],
                    }),
                  },
                ],
                opacity: progress.interpolate({
                  inputRange: [0, 0.12, 0.82, 1],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}
          />
        );
      }),
    [confettiValues, successConfettiEndY, successConfettiStartY],
  );

  const checkAnswer = () => {
    const isCorrect =
      mode === 'digital-to-analog'
        ? areTimesEqual(analogAnswer, promptTime, {
            includeMeridiem: showMeridiem,
          })
        : isDigitalAnswerCorrect(digitalAnswer, promptTime, timeFormat);

    setResult({
      actual: mode === 'digital-to-analog' ? analogAnswer : digitalAnswer,
      expected: promptTime,
      isCorrect,
    });
  };

  const handleAnalogAnswerChange = (value: React.SetStateAction<TimeValue>) => {
    setResult(null);
    setAnalogAnswer(value);
  };

  const handleDigitalAnswerChange = (value: DigitalTimeValue) => {
    setResult(null);
    setDigitalAnswer(value);
  };

  const formatResultValue = (value: TimeValue | DigitalTimeValue): string =>
    'hour12' in value
      ? formatTimeValue(value, {
          includeMeridiem: showMeridiem,
          timeFormat,
        })
      : formatDigitalTimeValue(value, timeFormat);

  const successOverlay = showSuccessOverlay ? (
    <View pointerEvents="none" style={styles.feedbackOverlay}>
      <View style={styles.successConfettiLayer}>{successConfetti}</View>
      <View
        style={[styles.feedbackToast, styles.successFeedbackToast]}
        testID="practice-success-overlay"
      >
        <View style={styles.feedbackCopy}>
          <Text
            style={[
              styles.feedbackToastTitle,
              styles.successFeedbackToastTitle,
            ]}
          >
            Nice work!
          </Text>
        </View>
      </View>
    </View>
  ) : null;

  const wrongAnswerOverlay =
    showWrongAnswerOverlay && result ? (
      <View style={styles.feedbackOverlay}>
        <View
          style={styles.feedbackToast}
          testID="practice-wrong-answer-overlay"
        >
          <View style={styles.feedbackCopy}>
            <Text style={styles.feedbackToastTitle}>Try again</Text>
            <Text style={styles.feedbackToastText}>
              {`You entered ${formatResultValue(result.actual)}`}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setResult(null)}
            style={styles.feedbackDismissButton}
            testID="practice-dismiss-feedback-button"
          >
            <Text style={styles.feedbackDismissText}>Dismiss</Text>
          </Pressable>
        </View>
      </View>
    ) : null;

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
              >
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Practice Mode</Text>
            </View>
            <View style={styles.headerSideSlot}>
              <HeaderSettingsButton
                onPress={onOpenSettings}
                testID="practice-open-settings-button"
              />
            </View>
          </View>
        </View>

        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <View style={styles.practiceLayout}>
            <View style={styles.practiceColumn}>
              <View
                style={[
                  styles.promptCard,
                  mode === 'digital-to-analog' && styles.promptCardDigital,
                  mode === 'analog-to-digital' && styles.promptCardAnalog,
                ]}
              >
                {mode === 'digital-to-analog' ? (
                  <>
                    <Text style={styles.promptLabel}>Match this digital time</Text>
                    <View style={styles.promptStage}>
                      <Text style={styles.promptTime} testID="prompt-time">
                        {formatTimeValue(promptTime, {
                          includeMeridiem: showMeridiem,
                          timeFormat,
                        })}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text
                      style={[styles.promptLabel, styles.promptLabelAnalog]}
                    >
                      Read this analog clock
                    </Text>
                    <View
                      style={[
                        styles.promptClockWrap,
                        mode === 'analog-to-digital' &&
                          styles.promptClockWrapAnalog,
                      ]}
                    >
                      <AnalogClock size={promptClockSize} time={promptTime} />
                    </View>
                  </>
                )}
              </View>
            </View>

            <View style={styles.practiceColumn}>
              <View style={styles.answerCard}>
                <Text style={styles.cardEyebrow}>Your answer</Text>
                {mode === 'digital-to-analog' ? (
                  <View style={styles.answerOverlayWrap}>
                    <AnalogClock
                      interactive
                      onChange={handleAnalogAnswerChange}
                      onInteractionEnd={() => setClockInteractionActive(false)}
                      onInteractionStart={() => setClockInteractionActive(true)}
                      onMeridiemChange={meridiem =>
                        setAnalogAnswer(current => ({
                          ...current,
                          meridiem,
                        }))
                      }
                      practiceInterval={practiceInterval}
                      size={clockSize}
                      time={analogAnswer}
                    />
                    {successOverlay}
                    {wrongAnswerOverlay}
                  </View>
                ) : (
                  <View style={styles.answerOverlayWrap}>
                    <DigitalTimeInput
                      compact={useCompactDigitalInput}
                      onChange={handleDigitalAnswerChange}
                      practiceInterval={practiceInterval}
                      showMeridiem={showMeridiem}
                      timeFormat={timeFormat}
                      value={digitalAnswer}
                    />
                    {successOverlay}
                    {wrongAnswerOverlay}
                  </View>
                )}
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  accessibilityRole="button"
                  disabled={showSuccessOverlay}
                  onPress={checkAnswer}
                  style={[
                    styles.actionButton,
                    styles.primaryButton,
                    showSuccessOverlay && styles.actionButtonDisabled,
                  ]}
                  testID="check-answer-button"
                >
                  <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                    Check Answer
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={showSuccessOverlay}
                  onPress={goToNextPrompt}
                  style={[
                    styles.actionButton,
                    styles.secondaryButton,
                    showSuccessOverlay && styles.actionButtonDisabled,
                  ]}
                  testID="next-time-button"
                >
                  <Text style={styles.actionButtonText}>
                    {showSuccessOverlay ? 'Loading next time...' : 'Next Time'}
                  </Text>
                </Pressable>
              </View>
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
  practiceLayout: {
    gap: 16,
  },
  practiceColumn: {
    gap: 16,
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
  promptCard: {
    backgroundColor: palette.ink,
    borderRadius: 30,
    padding: 22,
    ...shadows.card,
  },
  promptCardDigital: {
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  promptCardAnalog: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 14,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  promptLabelAnalog: {
    marginTop: 4,
  },
  promptTime: {
    alignSelf: 'center',
    color: palette.white,
    fontFamily: fontFamily.display,
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    textAlign: 'center',
  },
  promptStage: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    marginTop: 10,
  },
  promptClockWrap: {
    alignItems: 'center',
    marginTop: 18,
    paddingBottom: Platform.OS === 'web' ? 14 : 0,
  },
  promptClockWrapAnalog: {
    marginTop: 8,
    paddingBottom: Platform.OS === 'web' ? 8 : 0,
  },
  answerCard: {
    backgroundColor: palette.surface,
    borderRadius: 30,
    gap: 16,
    padding: 20,
    ...shadows.card,
  },
  answerOverlayWrap: {
    position: 'relative',
  },
  feedbackOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  successConfettiLayer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  successConfetti: {
    borderRadius: 4,
    height: 14,
    position: 'absolute',
    width: 9,
  },
  feedbackToast: {
    alignItems: 'center',
    backgroundColor: '#FBEAEC',
    borderColor: palette.danger,
    borderRadius: 18,
    borderWidth: 2,
    gap: 12,
    maxWidth: '64%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  successFeedbackToast: {
    backgroundColor: '#E8F6ED',
    borderColor: palette.success,
  },
  feedbackCopy: {
    alignItems: 'center',
    gap: 2,
  },
  feedbackToastTitle: {
    color: palette.danger,
    fontFamily: fontFamily.display,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  successFeedbackToastTitle: {
    color: palette.success,
  },
  feedbackToastText: {
    color: palette.danger,
    flexShrink: 1,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  successFeedbackToastText: {
    color: palette.success,
  },
  feedbackDismissButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(182, 71, 87, 0.12)',
    borderRadius: 999,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  feedbackDismissText: {
    color: palette.danger,
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  cardEyebrow: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: palette.coral,
  },
  secondaryButton: {
    backgroundColor: palette.surfaceMuted,
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: palette.white,
  },
});
