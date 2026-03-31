import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsScreen } from '../src/screens/SettingsScreen';

describe('SettingsScreen', () => {
  it('renders interval options and emits the selected interval', () => {
    const onBack = jest.fn();
    const onSelectInterval = jest.fn();
    const screen = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 852, width: 393, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 59 },
        }}
      >
        <SettingsScreen
          interval="5-minute"
          onBack={onBack}
          onSelectInterval={onSelectInterval}
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('1 minute')).toBeTruthy();
    expect(screen.getByText('5 minutes')).toBeTruthy();
    expect(screen.getByText('15 minutes')).toBeTruthy();
    expect(screen.getByText('Hours only')).toBeTruthy();

    fireEvent.press(screen.getByTestId('interval-hours-only'));
    fireEvent.press(screen.getByTestId('settings-back-button'));

    expect(onSelectInterval).toHaveBeenCalledWith('hours-only');
    expect(onBack).toHaveBeenCalled();
  });
});
