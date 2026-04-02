import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import { ExploreTimeScreen } from '../src/screens/ExploreTimeScreen';
import * as timeUtils from '../src/utils/time';

jest.mock('../src/utils/time', () => {
  const actual = jest.requireActual('../src/utils/time');

  return {
    ...actual,
    randomTimeValueForInterval: jest.fn(),
  };
});

const mockRandomTimeValueForInterval = jest.mocked(
  timeUtils.randomTimeValueForInterval,
);

const safeAreaMetrics: Metrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 59 },
};

describe('ExploreTimeScreen', () => {
  beforeEach(() => {
    mockRandomTimeValueForInterval.mockReturnValue({
      hour12: 12,
      meridiem: 'AM',
      minute: 0,
    });
    jest
      .spyOn(ReactNative, 'useWindowDimensions')
      .mockReturnValue({ fontScale: 1, height: 844, scale: 3, width: 390 });
  });

  afterEach(() => {
    mockRandomTimeValueForInterval.mockReset();
    jest.restoreAllMocks();
  });

  it('updates the analog preview when the digital time changes in 24-hour mode', () => {
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ExploreTimeScreen
          onBack={jest.fn()}
          practiceInterval="5-minute"
          timeFormat="24-hour"
        />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('hour-increment-button'));
    fireEvent.press(screen.getByTestId('minute-increment-button'));

    expect(screen.getByTestId('analog-clock-time-preview').props.children).toBe(
      '01:05',
    );
  });

  it('updates the digital controls when the analog clock changes', () => {
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ExploreTimeScreen onBack={jest.fn()} practiceInterval="5-minute" />
      </SafeAreaProvider>,
    );

    const clockFace = screen.getByTestId('analog-clock-surface');

    fireEvent(clockFace, 'responderGrant', {
      nativeEvent: {
        locationX: 143,
        locationY: 46,
      },
    });
    fireEvent(clockFace, 'responderMove', {
      nativeEvent: {
        locationX: 59,
        locationY: 191,
      },
    });
    fireEvent(clockFace, 'responderRelease', {
      nativeEvent: {
        locationX: 59,
        locationY: 191,
      },
    });

    expect(screen.getByTestId('hour-value').props.children).toBe('11');
    expect(screen.getByTestId('minute-value').props.children).toBe('45');
  });
});
