import {
  applyMinuteDrag,
  areTimesEqual,
  deriveHourFromAngle,
  formatTimeValue,
  getClockHandAngles,
  nextTimeValue,
  randomTimeValue,
  snapMinuteFromAngle,
} from '../src/utils/time';

describe('time utilities', () => {
  it('generates valid 12-hour times in 5-minute steps', () => {
    for (let index = 0; index < 200; index += 1) {
      const time = randomTimeValue();

      expect(time.hour12).toBeGreaterThanOrEqual(1);
      expect(time.hour12).toBeLessThanOrEqual(12);
      expect(time.minute % 5).toBe(0);
      expect(['AM', 'PM']).toContain(time.meridiem);
    }
  });

  it('computes analog hand angles accurately', () => {
    expect(
      getClockHandAngles({
        hour12: 3,
        meridiem: 'PM',
        minute: 30,
      }),
    ).toEqual({
      hourAngle: 105,
      minuteAngle: 180,
    });
  });

  it('snaps gesture angles to supported clock values', () => {
    expect(snapMinuteFromAngle(238)).toBe(40);
    expect(deriveHourFromAngle(271)).toBe(9);
  });

  it('distinguishes noon and midnight correctly', () => {
    expect(
      areTimesEqual(
        { hour12: 12, meridiem: 'AM', minute: 0 },
        { hour12: 12, meridiem: 'PM', minute: 0 },
      ),
    ).toBe(false);
    expect(formatTimeValue({ hour12: 12, meridiem: 'PM', minute: 0 })).toBe(
      '12:00 PM',
    );
  });

  it('advances and rewinds the hour when minute dragging wraps past 12', () => {
    expect(
      applyMinuteDrag(
        { hour12: 10, meridiem: 'AM', minute: 55 },
        0,
      ),
    ).toEqual({
      hour12: 11,
      meridiem: 'AM',
      minute: 0,
    });

    expect(
      applyMinuteDrag(
        { hour12: 12, meridiem: 'PM', minute: 0 },
        55,
      ),
    ).toEqual({
      hour12: 11,
      meridiem: 'AM',
      minute: 55,
    });
  });

  it('picks a new visible time when generating the next prompt', () => {
    const randomValues = [
      0.2, 0.42, 0, // 3:25 AM
      0.2, 0.42, 0.99, // 3:25 PM
      0.51, 0.2, 0, // 7:10 AM
    ];

    const next = nextTimeValue(
      { hour12: 3, meridiem: 'PM', minute: 25 },
      () => {
        const value = randomValues.shift();

        if (value === undefined) {
          throw new Error('Ran out of mocked random values');
        }

        return value;
      },
    );

    expect(next).toEqual({
      hour12: 7,
      meridiem: 'AM',
      minute: 10,
    });
  });
});
