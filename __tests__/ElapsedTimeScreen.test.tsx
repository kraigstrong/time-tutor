import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import { ElapsedTimeScreen } from '../src/screens/ElapsedTimeScreen';
import * as timeUtils from '../src/utils/time';

jest.mock('../src/utils/time', () => {
  const actual = jest.requireActual('../src/utils/time');

  return {
    ...actual,
    randomElapsedTimePairForInterval: jest.fn(),
  };
});

const mockRandomElapsedTimePairForInterval = jest.mocked(
  timeUtils.randomElapsedTimePairForInterval,
);

const safeAreaMetrics: Metrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 59 },
};

describe('ElapsedTimeScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(ReactNative, 'useWindowDimensions')
      .mockReturnValue({ fontScale: 1, height: 844, scale: 3, width: 390 });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
    mockRandomElapsedTimePairForInterval.mockReset();
  });

  it('shows AM/PM in 12-hour mode and accepts the correct elapsed duration', () => {
    mockRandomElapsedTimePairForInterval.mockReturnValue([
      { hour12: 3, meridiem: 'PM', minute: 15 },
      { hour12: 4, meridiem: 'PM', minute: 0 },
    ]);

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ElapsedTimeScreen onBack={jest.fn()} onOpenSettings={jest.fn()} />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('3:15 PM')).toBeTruthy();
    expect(screen.getByText('4:00 PM')).toBeTruthy();

    for (let step = 0; step < 9; step += 1) {
      fireEvent.press(screen.getByTestId('elapsed-minutes-increment-button'));
    }

    fireEvent.press(screen.getByTestId('elapsed-check-answer-button'));

    expect(screen.getByTestId('elapsed-success-overlay')).toBeTruthy();
  });

  it('shows a temporary wrong-answer overlay and respects 24-hour prompt formatting', () => {
    mockRandomElapsedTimePairForInterval.mockReturnValue([
      { hour12: 11, meridiem: 'AM', minute: 0 },
      { hour12: 12, meridiem: 'PM', minute: 30 },
    ]);

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ElapsedTimeScreen onBack={jest.fn()} onOpenSettings={jest.fn()} timeFormat="24-hour" />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('11:00')).toBeTruthy();
    expect(screen.getByText('12:30')).toBeTruthy();

    fireEvent.press(screen.getByTestId('elapsed-check-answer-button'));

    expect(screen.getByTestId('elapsed-wrong-answer-overlay')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(950);
    });

    expect(screen.queryByTestId('elapsed-wrong-answer-overlay')).toBeNull();
  });
});
