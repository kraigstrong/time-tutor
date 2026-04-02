import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ModeChooserScreen } from '../src/screens/ModeChooserScreen';

describe('ModeChooserScreen', () => {
  it('shows practice and challenge options and allows challenge when available', () => {
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
            enabled: true,
            label: '1-Minute Challenge',
          }}
          mode="digital-to-analog"
          onBack={onBack}
          onOpenSettings={jest.fn()}
          onSelectSession={onSelectSession}
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Practice')).toBeTruthy();
    expect(screen.getByText('1-Minute Challenge')).toBeTruthy();

    fireEvent.press(screen.getByTestId('practice-session-card'));
    fireEvent.press(screen.getByTestId('challenge-session-card'));

    expect(onSelectSession).toHaveBeenCalledWith('practice');
    expect(onSelectSession).toHaveBeenCalledWith('challenge');
    expect(onSelectSession).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('challenge-unavailable-tooltip')).toBeNull();
  });

  it('renders the elapsed time title for that mode', () => {
    const screen = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 852, width: 393, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 59 },
        }}
      >
        <ModeChooserScreen
          challengeAvailability={{
            enabled: true,
            label: '1-Minute Challenge',
          }}
          mode="elapsed-time"
          onBack={jest.fn()}
          onOpenSettings={jest.fn()}
          onSelectSession={jest.fn()}
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Elapsed Time')).toBeTruthy();
    expect(screen.getByText('Practice')).toBeTruthy();
  });
});
