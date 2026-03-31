import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { TimeTutorLogo } from '../components/TimeTutorLogo';
import { fontFamily, palette, shadows } from '../styles/theme';
import type { ExerciseMode } from '../types/time';

type Props = {
  onSelectMode: (mode: ExerciseMode) => void;
};

const modeCards: Array<{
  accentColor: string;
  description: string;
  mode: ExerciseMode;
  title: string;
}> = [
  {
    accentColor: palette.coral,
    description: 'See a digital time, then set the analog clock to match it.',
    mode: 'digital-to-analog',
    title: 'Set the Clock',
  },
  {
    accentColor: palette.teal,
    description: 'Read the analog clock and enter the matching digital time.',
    mode: 'analog-to-digital',
    title: 'Read the Clock',
  },
];

export function HomeScreen({ onSelectMode }: Props) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentWidth = Math.min(width - 24, isTablet ? 760 : 560);
  const logoCompact = width < 380;

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      <View style={styles.backgroundBubbleLarge} />
      <View style={styles.backgroundBubbleSmall} />
      <View style={[styles.content, { maxWidth: contentWidth }]}>
        <View style={styles.logoSection}>
          <TimeTutorLogo compact={logoCompact} />
          <Text style={styles.modePrompt}>Choose a mode</Text>
        </View>

        <View style={styles.cardColumn}>
          {modeCards.map(card => (
            <Pressable
              accessibilityRole="button"
              key={card.mode}
              onPress={() => onSelectMode(card.mode)}
              style={[styles.modeCard, { borderColor: card.accentColor }]}
              testID={`${card.mode}-card`}
            >
              <View
                style={[
                  styles.modeAccent,
                  {
                    backgroundColor: card.accentColor,
                  },
                ]}
              />
              <Text style={styles.modeTitle}>{card.title}</Text>
              <Text style={styles.modeDescription}>{card.description}</Text>
            </Pressable>
          ))}
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
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  backgroundBubbleLarge: {
    backgroundColor: palette.backgroundAccent,
    borderRadius: 999,
    height: 220,
    opacity: 0.5,
    position: 'absolute',
    right: -50,
    top: -20,
    width: 220,
  },
  backgroundBubbleSmall: {
    backgroundColor: '#DDEFE8',
    borderRadius: 999,
    height: 140,
    left: -30,
    opacity: 0.8,
    position: 'absolute',
    top: '32%',
    width: 140,
  },
  content: {
    alignSelf: 'center',
    gap: 18,
    width: '100%',
  },
  logoSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  modePrompt: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 26,
    fontWeight: '700',
  },
  cardColumn: {
    gap: 14,
  },
  modeCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    borderWidth: 2,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 22,
    ...shadows.card,
  },
  modeAccent: {
    borderRadius: 999,
    height: 12,
    marginBottom: 16,
    width: 64,
  },
  modeTitle: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontWeight: '700',
  },
  modeDescription: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
});
