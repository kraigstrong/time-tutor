import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { palette, shadows } from '../styles/theme';
import { SettingsGearIcon } from './SettingsGearIcon';

type Props = {
  onPress: () => void;
  testID?: string;
};

export function HeaderSettingsButton({ onPress, testID }: Props) {
  return (
    <Pressable
      accessibilityLabel="Open settings"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.button}
      testID={testID}
    >
      <SettingsGearIcon size={27} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
    ...shadows.card,
  },
});
