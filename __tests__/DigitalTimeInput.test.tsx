import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import { DigitalTimeInput } from '../src/components/DigitalTimeInput';
import type { DigitalTimeValue } from '../src/types/time';

describe('DigitalTimeInput', () => {
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
      const [value, setValue] = React.useState<DigitalTimeValue>({
        hour: 1,
        minute: 0,
      });

      return (
        <DigitalTimeInput
          onChange={setValue}
          practiceInterval="1-minute"
          value={value}
        />
      );
    };

    const screen = render(<Wrapper />);
    const minuteIncrement = screen.getByTestId('minute-increment-button');

    fireEvent(minuteIncrement, 'pressIn');

    act(() => {
      jest.advanceTimersByTime(720);
    });

    fireEvent(minuteIncrement, 'pressOut');

    expect(Number(screen.getByTestId('minute-value').props.children)).toBeGreaterThan(1);
  });
});
