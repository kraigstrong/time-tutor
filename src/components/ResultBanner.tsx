import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, fontFamily, shadows } from '../styles/theme';
import { formatTimeValue } from '../utils/time';
import type { SubmissionResult } from '../types/time';

type ResultBannerProps = {
  result: SubmissionResult | null;
  showMeridiem?: boolean;
};

export function ResultBanner({
  result,
  showMeridiem = true,
}: ResultBannerProps) {
  if (!result) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        result.isCorrect ? styles.successContainer : styles.errorContainer,
      ]}
    >
      <Text style={styles.title}>
        {result.isCorrect ? 'Correct! Nice work.' : 'Not quite yet.'}
      </Text>
      <Text style={styles.body}>
        {result.isCorrect
          ? `You matched ${formatTimeValue(result.expected, {
              includeMeridiem: showMeridiem,
            })} exactly.`
          : `You entered ${formatTimeValue(result.actual, {
              includeMeridiem: showMeridiem,
            })}.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 18,
    gap: 6,
    ...shadows.card,
  },
  successContainer: {
    backgroundColor: '#E8F6ED',
  },
  errorContainer: {
    backgroundColor: '#FBEAEC',
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
