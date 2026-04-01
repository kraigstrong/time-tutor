import React, { useCallback, useEffect, useState, type SetStateAction } from 'react';
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
import { ResultBanner } from '../components/ResultBanner';
import { fontFamily, palette, shadows } from '../styles/theme';
import type {
  ExerciseMode,
  PracticeInterval,
  SubmissionResult,
  TimeValue,
} from '../types/time';
import {
  areTimesEqual,
  createInitialAnswer,
  formatTimeValue,
  getModeTitle,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '../utils/time';

type Props = {
  mode: ExerciseMode;
  onBack: () => void;
  practiceInterval?: PracticeInterval;
};

type RunStatus = 'ready' | 'running' | 'finished';

const CHALLENGE_DURATION_SECONDS = 60;

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
  const [promptTime, setPromptTime] = useState<TimeValue>(() =>
    randomTimeValueForInterval(practiceInterval),
  );
  const [analogAnswer, setAnalogAnswer] = useState<TimeValue>(() =>
    createInitialAnswer(promptTime.meridiem),
  );
  const [digitalAnswer, setDigitalAnswer] = useState<TimeValue>(() =>
    createInitialAnswer(promptTime.meridiem),
  );
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [clockInteractionActive, setClockInteractionActive] = useState(false);
  const activeAnswer =
    mode === 'digital-to-analog' ? analogAnswer : digitalAnswer;

  useEffect(() => {
    if (runStatus !== 'ready') {
      return;
    }

    setRunStatus('running');
  }, [runStatus]);

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
      setResult(null);
    }
  }, [runStatus]);

  const loadPrompt = useCallback(
    (nextPrompt: TimeValue) => {
      setPromptTime(nextPrompt);
      setAnalogAnswer(createInitialAnswer(nextPrompt.meridiem));
      setDigitalAnswer(createInitialAnswer(nextPrompt.meridiem));
      setResult(null);
    },
    [],
  );

  const handlePlayAgain = useCallback(() => {
    const nextPrompt = randomTimeValueForInterval(practiceInterval);

    loadPrompt(nextPrompt);
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setRunStatus('ready');
  }, [loadPrompt, practiceInterval]);

  const handleAnalogAnswerChange = (value: SetStateAction<TimeValue>) => {
    setResult(null);
    setAnalogAnswer(value);
  };

  const handleDigitalAnswerChange = (value: TimeValue) => {
    setResult(null);
    setDigitalAnswer(value);
  };

  const checkAnswer = () => {
    if (runStatus !== 'running') {
      return;
    }

    const isCorrect = areTimesEqual(activeAnswer, promptTime, {
      includeMeridiem: showMeridiem,
    });

    if (isCorrect) {
      setScore(current => current + 1);
      loadPrompt(nextTimeValueForInterval(promptTime, practiceInterval));
      return;
    }

    setResult({
      actual: activeAnswer,
      expected: promptTime,
      isCorrect: false,
    });
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
              testID="challenge-back-button"
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>1-Minute Challenge</Text>
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
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Mode</Text>
              <Text style={styles.statValueSmall}>{getModeTitle(mode)}</Text>
            </View>
          </View>

          <View style={styles.promptCard}>
            {mode === 'digital-to-analog' ? (
              <>
                <Text style={styles.promptLabel}>Match this digital time</Text>
                <Text style={styles.promptTime} testID="challenge-prompt-time">
                  {formatTimeValue(promptTime, {
                    includeMeridiem: showMeridiem,
                  })}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.promptLabel}>Read this analog clock</Text>
                <View style={styles.promptClockWrap}>
                  <AnalogClock size={clockSize} time={promptTime} />
                </View>
              </>
            )}
          </View>

          <View style={styles.answerCard}>
            <Text style={styles.cardEyebrow}>Your answer</Text>
            {mode === 'digital-to-analog' ? (
              <AnalogClock
                interactive={runStatus !== 'finished'}
                onChange={handleAnalogAnswerChange}
                onInteractionEnd={() => setClockInteractionActive(false)}
                onInteractionStart={() => setClockInteractionActive(true)}
                practiceInterval={practiceInterval}
                size={clockSize}
                time={analogAnswer}
              />
            ) : (
              <DigitalTimeInput
                disabled={runStatus === 'finished'}
                onChange={handleDigitalAnswerChange}
                practiceInterval={practiceInterval}
                showMeridiem={showMeridiem}
                value={digitalAnswer}
              />
            )}
          </View>

          <ResultBanner result={result} showMeridiem={showMeridiem} />

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
              onPress={checkAnswer}
              style={[styles.actionButton, styles.primaryButton]}
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statChip: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    flex: 1,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statValueSmall: {
    color: palette.ink,
    fontFamily: fontFamily.body,
    fontSize: 16,
    fontWeight: '700',
  },
  promptCard: {
    backgroundColor: palette.ink,
    borderRadius: 30,
    padding: 22,
    ...shadows.card,
  },
  promptLabel: {
    color: '#D8E5F0',
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 18,
    textAlign: 'center',
  },
  promptTime: {
    color: palette.white,
    fontFamily: fontFamily.display,
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  promptClockWrap: {
    alignItems: 'center',
    marginTop: 18,
    paddingBottom: 14,
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
    minHeight: 56,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: palette.coral,
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
