import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from '../src/screens/HomeScreen';

describe('HomeScreen', () => {
  it('shows all learning modes and emits the selected mode', () => {
    const onSelectMode = jest.fn();
    const onOpenSettings = jest.fn();
    const { getByText, getByTestId } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 852, width: 393, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 59 },
        }}
      >
        <HomeScreen
          onOpenSettings={onOpenSettings}
          onSelectMode={onSelectMode}
        />
      </SafeAreaProvider>,
    );

    expect(getByTestId('open-settings-button')).toBeTruthy();
    expect(getByText('Choose a mode')).toBeTruthy();
    expect(getByText('Set the Clock')).toBeTruthy();
    expect(getByText('Read the Clock')).toBeTruthy();
    expect(getByText('Explore time')).toBeTruthy();

    fireEvent.press(getByTestId('digital-to-analog-card'));

    expect(onSelectMode).toHaveBeenCalledWith('digital-to-analog');

    fireEvent.press(getByTestId('open-settings-button'));

    expect(onOpenSettings).toHaveBeenCalled();

    fireEvent.press(getByTestId('explore-time-card'));

    expect(onSelectMode).toHaveBeenCalledWith('explore-time');
  });
});
