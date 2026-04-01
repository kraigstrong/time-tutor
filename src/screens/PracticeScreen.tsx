import React, { useCallback, useEffect, useState } from 'react';
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
import { CelebrationOverlay } from '../components/CelebrationOverlay';
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
  getModeDescription,
  getModeTitle,
  nextTimeValueForInterval,
  randomTimeValueForInterval,
} from '../utils/time';

type Props = {
  mode: ExerciseMode;
  onBack: () => void;
  practiceInterval?: PracticeInterval;
};

export function PracticeScreen({
  mode,
  onBack,
  practiceInterval = '5-minute',
}: Props) {
  const showMeridiem = false;
  const insets = useSafeAreaInsets();
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
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const contentMaxWidth = Math.min(width - 24, isTablet ? 860 : 620);
  const clockSize = Math.max(
    Math.min(contentMaxWidth * (isTablet ? 0.48 : 0.78), isTablet ? 420 : 340),
    260,
  );
  const activeAnswer =
    mode === 'digital-to-analog' ? analogAnswer : digitalAnswer;
  const showCelebration = result?.isCorrect ?? false;

  const goToNextPrompt = useCallback(() => {
    const nextPrompt = nextTimeValueForInterval(promptTime, practiceInterval);

    setPromptTime(nextPrompt);
    setAnalogAnswer(createInitialAnswer(nextPrompt.meridiem));
    setDigitalAnswer(createInitialAnswer(nextPrompt.meridiem));
    setResult(null);
  }, [practiceInterval, promptTime]);

  useEffect(() => {
    if (!result?.isCorrect) {
      return;
    }

    const timer = setTimeout(() => {
      goToNextPrompt();
    }, 1500);

    return () => clearTimeout(timer);
  }, [goToNextPrompt, result]);

  const checkAnswer = () => {
    setResult({
      actual: activeAnswer,
      expected: promptTime,
      isCorrect: areTimesEqual(activeAnswer, promptTime, {
        includeMeridiem: showMeridiem,
      }),
    });
  };

  return (
    <View style={styles.screen}>
      <CelebrationOverlay visible={showCelebration} />
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
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{getModeTitle(mode)}</Text>
              <Text style={styles.subtitle}>{getModeDescription(mode)}</Text>
            </View>
          </View>

          <View style={styles.promptCard}>
            {mode === 'digital-to-analog' ? (
              <>
                <Text style={styles.promptLabel}>Match this digital time</Text>
                <Text style={styles.promptTime} testID="prompt-time">
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
                interactive
                onChange={setAnalogAnswer}
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
            ) : (
              <DigitalTimeInput
                onChange={setDigitalAnswer}
                practiceInterval={practiceInterval}
                showMeridiem={showMeridiem}
                value={digitalAnswer}
              />
            )}
          </View>

          <ResultBanner result={result} showMeridiem={showMeridiem} />

          <View style={styles.actionsRow}>
            <Pressable
              accessibilityRole="button"
              disabled={showCelebration}
              onPress={checkAnswer}
              style={[
                styles.actionButton,
                styles.primaryButton,
                showCelebration && styles.actionButtonDisabled,
              ]}
              testID="check-answer-button"
            >
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Check Answer
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={showCelebration}
              onPress={goToNextPrompt}
              style={[
                styles.actionButton,
                styles.secondaryButton,
                showCelebration && styles.actionButtonDisabled,
              ]}
              testID="next-time-button"
            >
              <Text style={styles.actionButtonText}>
                {showCelebration ? 'Loading next time...' : 'Next Time'}
              </Text>
            </Pressable>
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
    paddingBottom: Platform.OS === 'web' ? 14 : 0,
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
