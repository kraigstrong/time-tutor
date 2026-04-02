import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import { ElapsedTimeChallengeScreen } from '../src/screens/ElapsedTimeChallengeScreen';
import * as timeUtils from '../src/utils/time';

jest.mock('../src/utils/time', () => {
  const actual = jest.requireActual('../src/utils/time');

  return {
    ...actual,
    nextElapsedTimePairForInterval: jest.fn(),
    randomElapsedTimePairForInterval: jest.fn(),
  };
});

const mockNextElapsedTimePairForInterval = jest.mocked(
  timeUtils.nextElapsedTimePairForInterval,
);
const mockRandomElapsedTimePairForInterval = jest.mocked(
  timeUtils.randomElapsedTimePairForInterval,
);

const safeAreaMetrics: Metrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 59 },
};

describe('ElapsedTimeChallengeScreen', () => {
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
    mockNextElapsedTimePairForInterval.mockReset();
  });

  it('increments the score and loads a new prompt after a correct answer', () => {
    mockRandomElapsedTimePairForInterval.mockReturnValue([
      { hour12: 3, meridiem: 'PM', minute: 15 },
      { hour12: 4, meridiem: 'PM', minute: 0 },
    ]);
    mockNextElapsedTimePairForInterval.mockReturnValue([
      { hour12: 6, meridiem: 'PM', minute: 0 },
      { hour12: 7, meridiem: 'PM', minute: 0 },
    ]);

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ElapsedTimeChallengeScreen onBack={jest.fn()} onOpenSettings={jest.fn()} />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('elapsed-challenge-start-button'));

    for (let step = 0; step < 9; step += 1) {
      fireEvent.press(screen.getByTestId('elapsed-minutes-increment-button'));
    }

    fireEvent.press(screen.getByTestId('elapsed-challenge-check-answer-button'));

    expect(screen.getByText('Correct')).toBeTruthy();
    expect(screen.getByTestId('elapsed-challenge-score').props.children).toBe(1);
    expect(mockNextElapsedTimePairForInterval).toHaveBeenCalledWith(
      [
        { hour12: 3, meridiem: 'PM', minute: 15 },
        { hour12: 4, meridiem: 'PM', minute: 0 },
      ],
      '5-minute',
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(screen.queryByText('Correct')).toBeNull();
  });

  it('ends the run after one minute and shows the summary card', () => {
    mockRandomElapsedTimePairForInterval.mockReturnValue([
      { hour12: 8, meridiem: 'AM', minute: 0 },
      { hour12: 9, meridiem: 'AM', minute: 0 },
    ]);

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ElapsedTimeChallengeScreen onBack={jest.fn()} onOpenSettings={jest.fn()} />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('elapsed-challenge-start-button'));

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(screen.getByTestId('elapsed-challenge-summary')).toBeTruthy();
    expect(screen.getByText("Time's up!")).toBeTruthy();
    expect(
      screen.getByTestId('elapsed-challenge-time-remaining').props.children,
    ).toBe('0:00');
  });
});
