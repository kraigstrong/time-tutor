import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SetStateAction,
} from 'react';
import {
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
  ExerciseMode,
  PracticeInterval,
  TimeValue,
} from '../types/time';
import {
  areTimesEqual,
  createInitialAnswer,
  formatTimeValue,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '../utils/time';

type Props = {
  mode: ExerciseMode;
  onBack: () => void;
  practiceInterval?: PracticeInterval;
};

type RunStatus = 'ready' | 'running' | 'finished';
type FeedbackToast = 'success' | 'error' | null;

const CHALLENGE_DURATION_SECONDS = 60;
const SUCCESS_FLASH_DURATION_MS = 450;
const ERROR_FLASH_DURATION_MS = 550;

export function ChallengeScreen({
  mode,
  onBack,
  practiceInterval = '5-minute',
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);
  const clockSize = Math.max(
    Math.min(contentMaxWidth * (isTablet ? 0.48 : 0.78), isTablet ? 420 : 340),
    260,
  );
  const showMeridiem = false;
  const [runStatus, setRunStatus] = useState<RunStatus>('ready');
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [promptTime, setPromptTime] = useState<TimeValue | null>(null);
  const [analogAnswer, setAnalogAnswer] = useState<TimeValue>(() =>
    createInitialAnswer(),
  );
  const [digitalAnswer, setDigitalAnswer] = useState<TimeValue>(() =>
    createInitialAnswer(),
  );
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<FeedbackToast>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeAnswer =
    mode === 'digital-to-analog' ? analogAnswer : digitalAnswer;
  const previewClockTime = promptTime ?? createInitialAnswer();

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (runStatus !== 'running') {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(current => {
        if (current <= 1) {
          setRunStatus('finished');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [runStatus]);

  useEffect(() => {
    if (runStatus === 'finished') {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      setFeedbackToast(null);
      setIsAdvancing(false);
    }
  }, [runStatus]);

  const loadPrompt = useCallback(
    (nextPrompt: TimeValue) => {
      setPromptTime(nextPrompt);
      setAnalogAnswer(createInitialAnswer(nextPrompt.meridiem));
      setDigitalAnswer(createInitialAnswer(nextPrompt.meridiem));
    },
    [],
  );

  const startRun = useCallback(() => {
    const nextPrompt = randomTimeValueForInterval(practiceInterval);

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    loadPrompt(nextPrompt);
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setRunStatus('running');
  }, [loadPrompt, practiceInterval]);

  const handlePlayAgain = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setPromptTime(null);
    setAnalogAnswer(createInitialAnswer());
    setDigitalAnswer(createInitialAnswer());
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setRunStatus('ready');
  }, []);

  const handleAnalogAnswerChange = (value: SetStateAction<TimeValue>) => {
    setAnalogAnswer(value);
  };

  const handleDigitalAnswerChange = (value: TimeValue) => {
    setDigitalAnswer(value);
  };

  const checkAnswer = () => {
    if (runStatus !== 'running' || !promptTime || isAdvancing) {
      return;
    }

    const isCorrect = areTimesEqual(activeAnswer, promptTime, {
      includeMeridiem: showMeridiem,
    });

    if (isCorrect) {
      const nextPrompt = nextTimeValueForInterval(promptTime, practiceInterval);

      setScore(current => current + 1);
      setFeedbackToast('success');
      setIsAdvancing(true);

      feedbackTimerRef.current = setTimeout(() => {
        loadPrompt(nextPrompt);
        setFeedbackToast(null);
        setIsAdvancing(false);
        feedbackTimerRef.current = null;
      }, SUCCESS_FLASH_DURATION_MS);

      return;
    }

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    setFeedbackToast('error');

    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackToast(null);
      feedbackTimerRef.current = null;
    }, ERROR_FLASH_DURATION_MS);
  };

  const feedbackToastOverlay = feedbackToast ? (
    <View pointerEvents="none" style={styles.feedbackToastOverlay}>
      <View
        style={[
          styles.feedbackToast,
          feedbackToast === 'success' ? styles.successToast : styles.errorToast,
        ]}
      >
        <Text
          style={[
            styles.feedbackToastText,
            feedbackToast === 'success'
              ? styles.successToastText
              : styles.errorToastText,
          ]}
        >
          {feedbackToast === 'success' ? 'Correct' : 'Try Again'}
        </Text>
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
        scrollEnabled={!clockInteractionActive && !isAdvancing}
        style={styles.scrollView}
      >
        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <View style={styles.headerRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={styles.backButton}
              testID="challenge-back-button"
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Challenge Mode</Text>
              <Text style={styles.subtitle}>
                {mode === 'digital-to-analog'
                  ? 'Set as many clocks as you can before time runs out.'
                  : 'Read as many clocks as you can before time runs out.'}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Time left</Text>
              <Text style={styles.statValue} testID="challenge-time-remaining">
                {formatCountdown(timeRemaining)}
              </Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue} testID="challenge-score">
                {score}
              </Text>
            </View>
          </View>

          <View style={styles.promptCard}>
            {mode === 'digital-to-analog' ? (
              <>
                <Text style={styles.promptLabel}>Match this digital time</Text>
                <View style={styles.promptStage}>
                  {promptTime ? (
                    <Text style={styles.promptTime} testID="challenge-prompt-time">
                      {formatTimeValue(promptTime, {
                        includeMeridiem: showMeridiem,
                      })}
                    </Text>
                  ) : (
                    <Text style={styles.promptPlaceholder}>
                      Tap Go when you&apos;re ready to start.
                    </Text>
                  )}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.promptLabel}>Read this analog clock</Text>
                <View style={styles.promptClockWrap}>
                  <AnalogClock size={clockSize} time={previewClockTime} />
                  {feedbackToastOverlay}
                  {runStatus === 'ready' ? (
                    <View style={styles.startOverlay} pointerEvents="box-none">
                      <Pressable
                        accessibilityRole="button"
                        onPress={startRun}
                        style={[styles.actionButton, styles.startActionButton, styles.startButton]}
                        testID="challenge-start-button"
                      >
                        <Text
                          style={[styles.actionButtonText, styles.primaryButtonText]}
                        >
                          Go
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </>
            )}
          </View>

          <View style={styles.answerCard}>
            <Text style={styles.cardEyebrow}>Your answer</Text>
            {mode === 'digital-to-analog' ? (
              <View style={styles.answerClockWrap}>
                <AnalogClock
                  interactive={runStatus === 'running' && !isAdvancing}
                  onChange={handleAnalogAnswerChange}
                  onInteractionEnd={() => setClockInteractionActive(false)}
                  onInteractionStart={() => setClockInteractionActive(true)}
                  practiceInterval={practiceInterval}
                  size={clockSize}
                  showInteractionHint
                  time={analogAnswer}
                />
                {feedbackToastOverlay}
                {runStatus === 'ready' ? (
                  <View style={styles.startOverlay} pointerEvents="box-none">
                    <Pressable
                      accessibilityRole="button"
                      onPress={startRun}
                      style={[styles.actionButton, styles.startActionButton, styles.startButton]}
                      testID="challenge-start-button"
                    >
                      <Text
                        style={[styles.actionButtonText, styles.primaryButtonText]}
                      >
                        Go
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : (
              <DigitalTimeInput
                disabled={runStatus !== 'running' || isAdvancing}
                onChange={handleDigitalAnswerChange}
                practiceInterval={practiceInterval}
                showMeridiem={showMeridiem}
                value={digitalAnswer}
              />
            )}
          </View>

          {runStatus === 'finished' ? (
            <View style={styles.summaryCard} testID="challenge-summary">
              <Text style={styles.summaryTitle}>Time&apos;s up!</Text>
              <Text style={styles.summaryBody}>
                You got {score} correct in 1 minute.
              </Text>
              <View style={styles.summaryActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handlePlayAgain}
                  style={[styles.actionButton, styles.primaryButton]}
                  testID="challenge-play-again-button"
                >
                  <Text
                    style={[styles.actionButtonText, styles.primaryButtonText]}
                  >
                    Play Again
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={onBack}
                  style={[styles.actionButton, styles.secondaryButton]}
                  testID="challenge-summary-back-button"
                >
                  <Text style={styles.actionButtonText}>Back</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              disabled={runStatus !== 'running' || isAdvancing}
              onPress={checkAnswer}
              style={[
                styles.actionButton,
                styles.primaryButton,
                (runStatus !== 'running' || isAdvancing) &&
                  styles.actionButtonDisabled,
              ]}
              testID="challenge-check-answer-button"
            >
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Check Answer
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function formatCountdown(timeRemaining: number): string {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
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
    gap: 12,
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
    gap: 2,
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
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    flex: 1,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...shadows.card,
  },
  statLabel: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  promptCard: {
    backgroundColor: palette.ink,
    borderRadius: 30,
    paddingHorizontal: 22,
    paddingVertical: 16,
    ...shadows.card,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
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
    marginTop: 10,
    paddingBottom: 8,
    position: 'relative',
  },
  promptPlaceholder: {
    alignSelf: 'center',
    color: '#D8E5F0',
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  answerCard: {
    backgroundColor: palette.surface,
    borderRadius: 30,
    gap: 12,
    padding: 16,
    ...shadows.card,
  },
  answerClockWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  startOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardEyebrow: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  summaryCard: {
    backgroundColor: palette.surface,
    borderRadius: 30,
    gap: 12,
    padding: 22,
    ...shadows.card,
  },
  feedbackToastOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  feedbackToast: {
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  successToast: {
    backgroundColor: '#E8F6ED',
    borderColor: palette.success,
  },
  errorToast: {
    backgroundColor: '#FBEAEC',
    borderColor: palette.danger,
  },
  feedbackToastText: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    fontWeight: '700',
  },
  successToastText: {
    color: palette.success,
  },
  errorToastText: {
    color: palette.danger,
  },
  summaryTitle: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryBody: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  startButton: {
    minWidth: 120,
    shadowColor: '#12355B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  primaryButton: {
    backgroundColor: palette.coral,
  },
  startActionButton: {
    backgroundColor: palette.success,
  },
  secondaryButton: {
    backgroundColor: palette.surfaceMuted,
    flex: 1,
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
