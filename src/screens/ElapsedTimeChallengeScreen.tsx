import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { ElapsedDurationInput } from '../components/ElapsedDurationInput';
import { HeaderSettingsButton } from '../components/HeaderSettingsButton';
import { fontFamily, palette, shadows } from '../styles/theme';
import type {
  ElapsedDurationValue,
  PracticeInterval,
  TimeFormat,
  TimeValue,
} from '../types/time';
import {
  createInitialElapsedDuration,
  formatTimeValue,
  isElapsedDurationCorrect,
  nextElapsedTimePairForInterval,
  randomElapsedTimePairForInterval,
} from '../utils/time';

type Props = {
  onBack: () => void;
  onOpenSettings: () => void;
  practiceInterval?: PracticeInterval;
  timeFormat?: TimeFormat;
};

type PromptPair = readonly [TimeValue, TimeValue];
type RunStatus = 'ready' | 'running' | 'finished';
type FeedbackToast = 'success' | 'error' | null;

const CHALLENGE_DURATION_SECONDS = 60;
const SUCCESS_FLASH_DURATION_MS = 450;
const ERROR_FLASH_DURATION_MS = 550;

export function ElapsedTimeChallengeScreen({
  onBack,
  onOpenSettings,
  practiceInterval = '5-minute',
  timeFormat = '12-hour',
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const useMobileWebLayout = Platform.OS === 'web';
  const isTablet = width >= 768 && !useMobileWebLayout;
  const useCompactInput = !isTablet;
  const headerMaxWidth = Math.min(width - 24, 860);
  const contentMaxWidth = Math.min(
    width - 24,
    isTablet ? 860 : 620,
  );
  const [runStatus, setRunStatus] = useState<RunStatus>('ready');
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [promptPair, setPromptPair] = useState<PromptPair | null>(null);
  const [answer, setAnswer] = useState<ElapsedDurationValue>(() =>
    createInitialElapsedDuration(),
  );
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<FeedbackToast>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const loadPrompt = useCallback((nextPrompt: PromptPair) => {
    setPromptPair(nextPrompt);
    setAnswer(createInitialElapsedDuration());
  }, []);

  const startRun = useCallback(() => {
    const nextPrompt = randomElapsedTimePairForInterval(practiceInterval);

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

    setPromptPair(null);
    setAnswer(createInitialElapsedDuration());
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setFeedbackToast(null);
    setIsAdvancing(false);
    setRunStatus('ready');
  }, []);

  const checkAnswer = () => {
    if (runStatus !== 'running' || !promptPair || isAdvancing) {
      return;
    }

    const isCorrect = isElapsedDurationCorrect(answer, promptPair[0], promptPair[1]);

    if (isCorrect) {
      const nextPrompt = nextElapsedTimePairForInterval(promptPair, practiceInterval);

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

  const formatPromptTime = (value: TimeValue) =>
    formatTimeValue(value, {
      includeMeridiem: timeFormat === '12-hour',
      timeFormat,
    });

  const renderPromptTime = (value: TimeValue, testID: string) => {
    const formatted = formatPromptTime(value);

    if (timeFormat === '12-hour') {
      const [mainTime, meridiem] = formatted.split(' ');

      return (
        <View style={styles.promptTimeInlineRow} testID={testID}>
          <Text numberOfLines={1} style={styles.promptTimeMain}>
            {mainTime}
          </Text>
          <Text numberOfLines={1} style={styles.promptTimeSuffix}>
            {meridiem}
          </Text>
        </View>
      );
    }

    return (
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={styles.promptTimeValue}
        testID={testID}
      >
        {formatted}
      </Text>
    );
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
        style={styles.scrollView}
      >
        <View style={[styles.headerShell, { maxWidth: headerMaxWidth }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerSideSlot}>
              <Pressable
                accessibilityRole="button"
                onPress={onBack}
                style={styles.backButton}
                testID="elapsed-challenge-back-button"
              >
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            </View>
            <View style={styles.headerCopy}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                numberOfLines={1}
                style={styles.title}
              >
                Challenge Mode
              </Text>
            </View>
            <View style={styles.headerSideSlot}>
              <HeaderSettingsButton
                onPress={onOpenSettings}
                testID="elapsed-challenge-open-settings-button"
              />
            </View>
          </View>
        </View>

        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          <View style={styles.challengeLayout}>
            <View style={styles.challengeColumn}>
              <View style={styles.statsRow}>
                <View style={styles.statChip}>
                  <Text style={styles.statLabel}>Time left</Text>
                  <Text
                    style={styles.statValue}
                    testID="elapsed-challenge-time-remaining"
                  >
                    {formatCountdown(timeRemaining)}
                  </Text>
                </View>
                <View style={styles.statChip}>
                  <Text style={styles.statLabel}>Score</Text>
                  <Text style={styles.statValue} testID="elapsed-challenge-score">
                    {score}
                  </Text>
                </View>
              </View>

              <View style={styles.promptCard}>
                <Text style={styles.promptLabel}>How much time passes?</Text>
                <View style={styles.promptStage}>
                  {promptPair ? (
                    <View style={styles.promptTimesRow}>
                      <View style={styles.promptTimeCard}>
                        <Text style={styles.promptTimeEyebrow}>Start</Text>
                        {renderPromptTime(
                          promptPair[0],
                          'elapsed-challenge-start-time',
                        )}
                      </View>
                      <View style={styles.connectorPill}>
                        <Text style={styles.connectorText}>to</Text>
                      </View>
                      <View style={styles.promptTimeCard}>
                        <Text style={styles.promptTimeEyebrow}>End</Text>
                        {renderPromptTime(
                          promptPair[1],
                          'elapsed-challenge-end-time',
                        )}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.promptPlaceholder}>
                      Tap Go when you&apos;re ready to start.
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.challengeColumn}>
              <View style={styles.answerCard}>
                <Text style={styles.cardEyebrow}>Your answer</Text>
                <View style={styles.answerOverlayWrap}>
                  <ElapsedDurationInput
                    compact={useCompactInput}
                    disabled={runStatus !== 'running' || isAdvancing}
                    onChange={setAnswer}
                    practiceInterval={practiceInterval}
                    value={answer}
                  />
                  {feedbackToastOverlay}
                  {runStatus === 'ready' ? (
                    <View style={styles.startOverlay} pointerEvents="box-none">
                      <Pressable
                        accessibilityRole="button"
                        onPress={startRun}
                        style={[
                          styles.actionButton,
                          styles.startActionButton,
                          styles.startButton,
                        ]}
                        testID="elapsed-challenge-start-button"
                      >
                        <Text
                          style={[
                            styles.actionButtonText,
                            styles.primaryButtonText,
                          ]}
                        >
                          Go
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>

              {runStatus === 'finished' ? (
                <View style={styles.summaryCard} testID="elapsed-challenge-summary">
                  <Text style={styles.summaryTitle}>Time&apos;s up!</Text>
                  <Text style={styles.summaryBody}>
                    You got {score} correct in 1 minute.
                  </Text>
                  <View style={styles.summaryActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={handlePlayAgain}
                      style={[styles.actionButton, styles.primaryButton]}
                      testID="elapsed-challenge-play-again-button"
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
                      testID="elapsed-challenge-summary-back-button"
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
                  testID="elapsed-challenge-check-answer-button"
                >
                  <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                    Check Answer
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
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
  headerShell: {
    alignSelf: 'center',
    marginBottom: 12,
    width: '100%',
  },
  challengeLayout: {
    gap: 12,
  },
  challengeColumn: {
    gap: 12,
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
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
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
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
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
  promptStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 106,
  },
  promptPlaceholder: {
    alignSelf: 'center',
    color: '#D8E5F0',
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  promptTimesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  promptTimeCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
    flexShrink: 1,
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 26,
  },
  promptTimeInlineRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    minWidth: 0,
  },
  promptTimeMain: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 21,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    lineHeight: 25,
  },
  promptTimeSuffix: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: 2,
  },
  connectorPill: {
    alignItems: 'center',
    backgroundColor: '#274B73',
    borderRadius: 999,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 10,
    paddingVertical: 9,
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
    minHeight: 118,
    justifyContent: 'center',
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  successToast: {
    backgroundColor: '#E1F4E9',
  },
  errorToast: {
    backgroundColor: '#F9E0E4',
  },
  feedbackToastText: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  successToastText: {
    color: palette.success,
  },
  errorToastText: {
    color: palette.danger,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  startActionButton: {
    minWidth: 140,
  },
  startButton: {
    backgroundColor: palette.success,
  },
  primaryButton: {
    backgroundColor: palette.coral,
  },
  secondaryButton: {
    backgroundColor: '#F4E7D4',
  },
  actionButtonDisabled: {
    opacity: 0.75,
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
  summaryCard: {
    backgroundColor: palette.surface,
    borderRadius: 30,
    gap: 16,
    padding: 20,
    ...shadows.card,
  },
  summaryTitle: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryBody: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
