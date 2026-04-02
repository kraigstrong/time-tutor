import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { ElapsedDurationInput } from '../src/components/ElapsedDurationInput';
import type { ElapsedDurationValue } from '../src/types/time';

describe('ElapsedDurationInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('repeats and accelerates while holding an increment button', () => {
    const Wrapper = () => {
      const [value, setValue] = React.useState<ElapsedDurationValue>({
        hours: 0,
        minutes: 0,
      });

      return (
        <ElapsedDurationInput
          onChange={setValue}
          practiceInterval="1-minute"
          value={value}
        />
      );
    };

    const screen = render(<Wrapper />);
    const minuteIncrement = screen.getByTestId('elapsed-minutes-increment-button');

    fireEvent(minuteIncrement, 'pressIn');

    act(() => {
      jest.advanceTimersByTime(720);
    });

    fireEvent(minuteIncrement, 'pressOut');

    expect(
      Number(screen.getByTestId('elapsed-minutes-value').props.children),
    ).toBeGreaterThan(1);
  });
});
