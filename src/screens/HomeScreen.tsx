import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsGearIcon } from '../components/SettingsGearIcon';
import { fontFamily, palette, shadows } from '../styles/theme';
import type { HomeMode } from '../types/time';

type Props = {
  onOpenSettings: () => void;
  onSelectMode: (mode: HomeMode) => void;
};

const modeCards: Array<{
  accentColor: string;
  description: string;
  mode: HomeMode;
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
  {
    accentColor: palette.gold,
    description: 'Move the clock or change the digital time and watch them sync.',
    mode: 'explore-time',
    title: 'Explore Time',
  },
];

export function HomeScreen({ onOpenSettings, onSelectMode }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;
  const contentWidth = Math.min(width - 24, isTablet ? 760 : 560);

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
      <View style={styles.backgroundBubbleLarge} />
      <View style={styles.backgroundBubbleSmall} />
      <View style={[styles.content, { maxWidth: contentWidth }]}>
        <View style={styles.headerSection}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>Time Tutor</Text>
            <Pressable
              accessibilityLabel="Open settings"
              accessibilityRole="button"
              onPress={onOpenSettings}
              style={styles.settingsButton}
              testID="open-settings-button"
            >
              <SettingsGearIcon size={27} />
            </Pressable>
          </View>
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
    paddingHorizontal: 12,
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
  headerSection: {
    alignItems: 'stretch',
    gap: 8,
    paddingBottom: 6,
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    color: palette.ink,
    flex: 1,
    fontFamily: fontFamily.display,
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
    ...shadows.card,
  },
  modePrompt: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
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
