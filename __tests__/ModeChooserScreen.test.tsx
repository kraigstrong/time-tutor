import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ModeChooserScreen } from '../src/screens/ModeChooserScreen';

describe('ModeChooserScreen', () => {
  it('shows practice and challenge options and keeps the web challenge disabled', () => {
    const onBack = jest.fn();
    const onSelectSession = jest.fn();
    const screen = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 852, width: 393, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 59 },
        }}
      >
        <ModeChooserScreen
          challengeAvailability={{
            enabled: false,
            label: '1-Minute Challenge',
            reason: 'Available in the paid mobile app',
          }}
          mode="digital-to-analog"
          onBack={onBack}
          onSelectSession={onSelectSession}
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Practice')).toBeTruthy();
    expect(screen.getByText('1-Minute Challenge')).toBeTruthy();

    fireEvent.press(screen.getByTestId('practice-session-card'));
    fireEvent.press(screen.getByTestId('challenge-session-card'));
    fireEvent(screen.getByTestId('challenge-session-card'), 'focus');

    expect(onSelectSession).toHaveBeenCalledWith('practice');
    expect(onSelectSession).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('challenge-unavailable-tooltip')).toBeTruthy();
    expect(screen.getByText('Available in the paid mobile app')).toBeTruthy();
  });
});
