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

import { ElapsedDurationInput } from '../components/ElapsedDurationInput';
import { fontFamily, palette, shadows } from '../styles/theme';
import type {
  ElapsedDurationValue,
  PracticeInterval,
  SubmissionResult,
  TimeFormat,
  TimeValue,
} from '../types/time';
import {
  createInitialElapsedDuration,
  elapsedMinutesToDuration,
  formatTimeValue,
  getElapsedMinutes,
  isElapsedDurationCorrect,
  nextElapsedTimePairForInterval,
  randomElapsedTimePairForInterval,
} from '../utils/time';

type Props = {
  onBack: () => void;
  practiceInterval?: PracticeInterval;
  timeFormat?: TimeFormat;
};

type PromptPair = readonly [TimeValue, TimeValue];
type ElapsedResult = SubmissionResult<ElapsedDurationValue, ElapsedDurationValue>;

const SUCCESS_CONFETTI = [
  { color: '#F6BD39', delay: 0, drift: -20, leftPercent: 12, rotate: -18, top: -42 },
  { color: '#0FA3B1', delay: 40, drift: -16, leftPercent: 22, rotate: 12, top: -24 },
  { color: '#7ED6A5', delay: 70, drift: -10, leftPercent: 30, rotate: -8, top: -52 },
  { color: '#FF7AA2', delay: 110, drift: -6, leftPercent: 40, rotate: 18, top: -30 },
  { color: '#FF9F1C', delay: 30, drift: 0, leftPercent: 48, rotate: -14, top: -44 },
  { color: '#2D3142', delay: 95, drift: 4, leftPercent: 56, rotate: 22, top: -14 },
  { color: '#F6BD39', delay: 130, drift: 8, leftPercent: 64, rotate: -20, top: -48 },
  { color: '#0FA3B1', delay: 55, drift: 12, leftPercent: 72, rotate: 16, top: -26 },
  { color: '#7ED6A5', delay: 145, drift: 18, leftPercent: 82, rotate: -24, top: -40 },
  { color: '#FF7AA2', delay: 85, drift: 20, leftPercent: 18, rotate: 24, top: 0 },
  { color: '#FF9F1C', delay: 120, drift: -12, leftPercent: 68, rotate: -28, top: 4 },
  { color: '#2D3142', delay: 160, drift: 14, leftPercent: 86, rotate: 10, top: -4 },
  { color: '#FF7AA2', delay: 15, drift: -24, leftPercent: 8, rotate: -26, top: -34 },
  { color: '#F6BD39', delay: 28, drift: -18, leftPercent: 16, rotate: 18, top: -8 },
  { color: '#0FA3B1', delay: 48, drift: -14, leftPercent: 24, rotate: -10, top: -46 },
  { color: '#7ED6A5', delay: 64, drift: -8, leftPercent: 34, rotate: 20, top: -18 },
  { color: '#FF9F1C', delay: 88, drift: -2, leftPercent: 42, rotate: -18, top: -50 },
  { color: '#2D3142', delay: 104, drift: 2, leftPercent: 50, rotate: 26, top: -24 },
  { color: '#FF7AA2', delay: 118, drift: 6, leftPercent: 58, rotate: -12, top: -40 },
  { color: '#F6BD39', delay: 138, drift: 10, leftPercent: 66, rotate: 16, top: -10 },
  { color: '#0FA3B1', delay: 154, drift: 16, leftPercent: 76, rotate: -24, top: -46 },
  { color: '#7ED6A5', delay: 172, drift: 22, leftPercent: 90, rotate: 14, top: -16 },
  { color: '#FF9F1C', delay: 36, drift: -22, leftPercent: 14, rotate: -22, top: 14 },
  { color: '#2D3142', delay: 112, drift: 12, leftPercent: 80, rotate: 28, top: 12 },
  { color: '#7ED6A5', delay: 22, drift: -20, leftPercent: 10, rotate: 8, top: 26 },
  { color: '#FF7AA2', delay: 58, drift: -12, leftPercent: 26, rotate: -16, top: 20 },
  { color: '#F6BD39', delay: 74, drift: -6, leftPercent: 38, rotate: 24, top: 34 },
  { color: '#0FA3B1', delay: 92, drift: 0, leftPercent: 46, rotate: -20, top: 24 },
  { color: '#FF9F1C', delay: 126, drift: 8, leftPercent: 60, rotate: 12, top: 30 },
  { color: '#2D3142', delay: 142, drift: 14, leftPercent: 72, rotate: -26, top: 18 },
  { color: '#7ED6A5', delay: 166, drift: 18, leftPercent: 84, rotate: 18, top: 32 },
  { color: '#FF7AA2', delay: 184, drift: 24, leftPercent: 92, rotate: -14, top: 22 },
  { color: '#F6BD39', delay: 50, drift: -16, leftPercent: 20, rotate: 10, top: 46 },
  { color: '#0FA3B1', delay: 82, drift: -8, leftPercent: 32, rotate: -24, top: 54 },
  { color: '#FF9F1C', delay: 108, drift: 4, leftPercent: 54, rotate: 20, top: 48 },
  { color: '#2D3142', delay: 148, drift: 12, leftPercent: 70, rotate: -18, top: 60 },
] satisfies ReadonlyArray<{
  color: string;
  delay: number;
  drift: number;
  leftPercent: number;
  rotate: number;
  top: number;
}>;

export function ElapsedTimeScreen({
  onBack,
  practiceInterval = '5-minute',
  timeFormat = '12-hour',
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWideWeb = Platform.OS === 'web' && width >= 1100;
  const contentMaxWidth = Math.min(
    width - 24,
    isWideWeb ? 1180 : isTablet ? 860 : 620,
  );
  const useCompactInput = !isTablet;
  const [promptPair, setPromptPair] = useState<PromptPair>(() =>
    randomElapsedTimePairForInterval(practiceInterval),
  );
  const [answer, setAnswer] = useState<ElapsedDurationValue>(() =>
    createInitialElapsedDuration(),
  );
  const [result, setResult] = useState<ElapsedResult | null>(null);
  const wrongAnswerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiValues = useRef(
    SUCCESS_CONFETTI.map(() => new Animated.Value(0)),
  ).current;
  const showSuccessOverlay = Boolean(result?.isCorrect);
  const showWrongAnswerOverlay = Boolean(result && !result.isCorrect);

  const goToNextPrompt = useCallback(() => {
    setPromptPair(current =>
      nextElapsedTimePairForInterval(current, practiceInterval),
    );
    setAnswer(createInitialElapsedDuration());
    setResult(null);
  }, [practiceInterval]);

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

  useEffect(
    () => () => {
      if (wrongAnswerTimerRef.current) {
        clearTimeout(wrongAnswerTimerRef.current);
      }
    },
    [],
  );

  const checkAnswer = () => {
    const [startTime, endTime] = promptPair;
    const isCorrect = isElapsedDurationCorrect(answer, startTime, endTime);
    const expectedDuration = elapsedMinutesToDuration(
      getElapsedMinutes(startTime, endTime),
    );

    setResult({
      actual: answer,
      expected: expectedDuration,
      isCorrect,
    });

    if (!isCorrect) {
      if (wrongAnswerTimerRef.current) {
        clearTimeout(wrongAnswerTimerRef.current);
      }

      wrongAnswerTimerRef.current = setTimeout(() => {
        setResult(current => (current?.isCorrect ? current : null));
        wrongAnswerTimerRef.current = null;
      }, 900);
    }
  };

  const formatPromptTime = (value: TimeValue): string =>
    formatTimeValue(value, {
      includeMeridiem: timeFormat === '12-hour',
      timeFormat,
    });

  const successConfetti = useMemo(
    () =>
      SUCCESS_CONFETTI.map((piece, index) => {
        const progress = confettiValues[index];

        return (
          <Animated.View
            key={`elapsed-success-confetti-${index}`}
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
                      outputRange: [-42, 128],
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
    [confettiValues],
  );

  const successOverlay = showSuccessOverlay ? (
    <View pointerEvents="none" style={styles.feedbackOverlay}>
      <View style={styles.successConfettiLayer}>{successConfetti}</View>
      <View
        style={[styles.feedbackToast, styles.successFeedbackToast]}
        testID="elapsed-success-overlay"
      >
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
  ) : null;

  const wrongAnswerOverlay =
    showWrongAnswerOverlay && result ? (
      <View pointerEvents="none" style={styles.feedbackOverlay}>
        <View
          style={styles.feedbackToast}
          testID="elapsed-wrong-answer-overlay"
        >
          <Text style={styles.feedbackToastTitle}>Try again</Text>
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
        style={styles.scrollView}
      >
        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={styles.backButton}
              testID="elapsed-back-button"
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Practice Mode</Text>
              <Text style={styles.subtitle}>
                Figure out how much time passes between the two clocks.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.layout,
              isWideWeb && styles.layoutWide,
            ]}
          >
            <View style={[styles.column, isWideWeb && styles.promptColumn]}>
              <View style={styles.promptCard}>
                <Text style={styles.promptLabel}>How much time passes?</Text>
                <View style={styles.promptTimesRow}>
                  <View style={styles.promptTimeCard}>
                    <Text style={styles.promptTimeEyebrow}>Start</Text>
                    <Text style={styles.promptTimeValue} testID="elapsed-start-time">
                      {formatPromptTime(promptPair[0])}
                    </Text>
                  </View>
                  <View style={styles.connectorPill}>
                    <Text style={styles.connectorText}>to</Text>
                  </View>
                  <View style={styles.promptTimeCard}>
                    <Text style={styles.promptTimeEyebrow}>End</Text>
                    <Text style={styles.promptTimeValue} testID="elapsed-end-time">
                      {formatPromptTime(promptPair[1])}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.column, isWideWeb && styles.answerColumn]}>
              <View style={styles.answerCard}>
                <Text style={styles.cardEyebrow}>Elapsed time</Text>
                <View style={styles.answerOverlayWrap}>
                  <ElapsedDurationInput
                    compact={useCompactInput}
                    onChange={value => {
                      setResult(null);
                      setAnswer(value);
                    }}
                    practiceInterval={practiceInterval}
                    value={answer}
                  />
                  {successOverlay}
                  {wrongAnswerOverlay}
                </View>
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
                  testID="elapsed-check-answer-button"
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
                  testID="elapsed-next-time-button"
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
  layout: {
    gap: 16,
  },
  layoutWide: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  column: {
    gap: 16,
  },
  promptColumn: {
    flex: 0.92,
    minWidth: 0,
  },
  answerColumn: {
    flex: 1.08,
    minWidth: 0,
  },
  promptCard: {
    backgroundColor: palette.ink,
    borderRadius: 30,
    gap: 18,
    padding: 22,
    ...shadows.card,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  promptTimesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  promptTimeCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  promptTimeEyebrow: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  promptTimeValue: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  connectorPill: {
    alignItems: 'center',
    backgroundColor: '#274B73',
    borderRadius: 999,
    justifyContent: 'center',
    minWidth: 54,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  connectorText: {
    color: palette.white,
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: '700',
  },
  answerCard: {
    backgroundColor: palette.surface,
    borderRadius: 30,
    gap: 16,
    padding: 20,
    ...shadows.card,
  },
  cardEyebrow: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  answerOverlayWrap: {
    minHeight: 110,
    justifyContent: 'center',
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
    width: 8,
  },
  feedbackToast: {
    alignItems: 'center',
    backgroundColor: '#F8E9EC',
    borderColor: palette.danger,
    borderRadius: 26,
    borderWidth: 2,
    gap: 12,
    justifyContent: 'center',
    maxWidth: 250,
    paddingHorizontal: 18,
    paddingVertical: 16,
    width: '86%',
  },
  successFeedbackToast: {
    backgroundColor: '#E4F3EA',
    borderColor: palette.success,
    maxWidth: 200,
    paddingVertical: 18,
  },
  feedbackCopy: {
    alignItems: 'center',
    gap: 4,
  },
  feedbackToastTitle: {
    color: palette.danger,
    fontFamily: fontFamily.display,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  successFeedbackToastTitle: {
    color: palette.success,
  },
  feedbackToastText: {
    color: palette.danger,
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    textAlign: 'center',
  },
  feedbackDismissButton: {
    backgroundColor: '#F3D9DE',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  feedbackDismissText: {
    color: palette.danger,
    fontFamily: fontFamily.body,
    fontSize: 14,
    fontWeight: '700',
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
    minHeight: 58,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  actionButtonDisabled: {
    opacity: 0.75,
  },
  primaryButton: {
    backgroundColor: palette.coral,
  },
  secondaryButton: {
    backgroundColor: '#F4E7D4',
  },
  actionButtonText: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: palette.white,
  },
});
