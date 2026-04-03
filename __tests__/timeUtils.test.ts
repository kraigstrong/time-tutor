import {
  applyMinuteDrag,
  areTimesEqual,
  cycleMinute,
  cycleDigitalHour,
  cycleMinuteForInterval,
  durationToElapsedMinutes,
  createInitialDigitalAnswer,
  deriveHourFromAngle,
  elapsedMinutesToDuration,
  formatElapsedDurationValue,
  formatDigitalTimeValue,
  formatTimeValue,
  getElapsedMinutes,
  getClockHandAngles,
  getMinuteOptions,
  isDigitalAnswerCorrect,
  isElapsedDurationCorrect,
  digitalValueToTimeValue,
  nextTimeValue,
  nextElapsedTimePairForInterval,
  nextTimeValueForInterval,
  normalizeAnalogTimeFor24Hour,
  randomElapsedTimePairForInterval,
  randomTimeValue,
  randomTimeValueForInterval,
  snapMinuteFromAngle,
  snapMinuteFromAngleForInterval,
  stepDigitalTimeValue,
  timeValueToDigitalValue,
  to24HourVariants,
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

  it('supports the configured practice intervals', () => {
    expect(getMinuteOptions('1-minute')).toHaveLength(60);
    expect(getMinuteOptions('15-minute')).toEqual([0, 15, 30, 45]);
    expect(getMinuteOptions('hours-only')).toEqual([0]);

    const everyMinute = randomTimeValueForInterval('1-minute', () => 0.51);
    const quarterHour = randomTimeValueForInterval('15-minute', () => 0.9);
    const hoursOnly = randomTimeValueForInterval('hours-only', () => 0.25);

    expect(everyMinute.minute).toBe(30);
    expect(quarterHour.minute).toBe(45);
    expect(hoursOnly.minute).toBe(0);
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
    expect(snapMinuteFromAngleForInterval(92, '1-minute')).toBe(15);
    expect(snapMinuteFromAngleForInterval(100, '15-minute')).toBe(15);
    expect(snapMinuteFromAngleForInterval(182, 'hours-only')).toBe(0);
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
    expect(
      formatTimeValue(
        { hour12: 3, meridiem: 'PM', minute: 5 },
        { timeFormat: '24-hour' },
      ),
    ).toBe('15:05');
    expect(formatDigitalTimeValue({ hour: 23, minute: 0 }, '24-hour')).toBe(
      '23:00',
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

  it('cycles minutes using the configured interval', () => {
    expect(cycleMinute(55, 1)).toBe(0);
    expect(cycleDigitalHour(23, 1, '24-hour')).toBe(0);
    expect(cycleDigitalHour(12, 1, '12-hour')).toBe(1);
    expect(cycleMinuteForInterval(14, 1, '1-minute')).toBe(15);
    expect(cycleMinuteForInterval(0, 1, '15-minute')).toBe(15);
    expect(cycleMinuteForInterval(0, 1, 'hours-only')).toBe(0);
  });

  it('keeps digital stepping continuous when minute wrapping crosses the hour', () => {
    expect(
      stepDigitalTimeValue(
        { hour: 0, minute: 59 },
        'minute',
        1,
        { practiceInterval: '1-minute', timeFormat: '24-hour' },
      ),
    ).toEqual({
      hour: 1,
      minute: 0,
    });

    expect(
      stepDigitalTimeValue(
        { hour: 0, minute: 0 },
        'minute',
        -1,
        { practiceInterval: '1-minute', timeFormat: '24-hour' },
      ),
    ).toEqual({
      hour: 23,
      minute: 59,
    });
  });

  it('creates valid initial digital answers for both display formats', () => {
    expect(createInitialDigitalAnswer('12-hour')).toEqual({
      hour: 12,
      minute: 0,
    });
    expect(createInitialDigitalAnswer('24-hour')).toEqual({
      hour: 0,
      minute: 0,
    });
  });

  it('formats and validates elapsed durations', () => {
    expect(
      getElapsedMinutes(
        { hour12: 11, meridiem: 'AM', minute: 30 },
        { hour12: 1, meridiem: 'PM', minute: 0 },
      ),
    ).toBe(90);

    expect(elapsedMinutesToDuration(90)).toEqual({
      hours: 1,
      minutes: 30,
    });

    expect(durationToElapsedMinutes({ hours: 1, minutes: 30 })).toBe(90);
    expect(formatElapsedDurationValue({ hours: 1, minutes: 30 })).toBe('1:30');
    expect(
      isElapsedDurationCorrect(
        { hours: 1, minutes: 30 },
        { hour12: 11, meridiem: 'AM', minute: 30 },
        { hour12: 1, meridiem: 'PM', minute: 0 },
      ),
    ).toBe(true);
  });

  it('converts between internal and digital values for explore mode', () => {
    expect(
      timeValueToDigitalValue(
        { hour12: 3, meridiem: 'PM', minute: 15 },
        '24-hour',
      ),
    ).toEqual({
      hour: 15,
      minute: 15,
    });

    expect(
      digitalValueToTimeValue(
        { hour: 23, minute: 0 },
        '24-hour',
        'AM',
      ),
    ).toEqual({
      hour12: 11,
      meridiem: 'PM',
      minute: 0,
    });

    expect(
      digitalValueToTimeValue(
        { hour: 4, minute: 30 },
        '12-hour',
        'PM',
      ),
    ).toEqual({
      hour12: 4,
      meridiem: 'PM',
      minute: 30,
    });
  });

  it('accepts both 24-hour equivalents for the same analog clock', () => {
    expect(
      to24HourVariants({ hour12: 11, meridiem: 'PM', minute: 0 }),
    ).toEqual([
      { hour: 11, minute: 0 },
      { hour: 23, minute: 0 },
    ]);

    expect(
      isDigitalAnswerCorrect(
        { hour: 11, minute: 0 },
        { hour12: 11, meridiem: 'PM', minute: 0 },
        '24-hour',
      ),
    ).toBe(true);
    expect(
      isDigitalAnswerCorrect(
        { hour: 23, minute: 0 },
        { hour12: 11, meridiem: 'PM', minute: 0 },
        '24-hour',
      ),
    ).toBe(true);
    expect(
      isDigitalAnswerCorrect(
        { hour: 10, minute: 0 },
        { hour12: 11, meridiem: 'PM', minute: 0 },
        '24-hour',
      ),
    ).toBe(false);
  });

  it('keeps analog edits continuous in 24-hour explore mode', () => {
    expect(
      normalizeAnalogTimeFor24Hour(
        { hour12: 12, meridiem: 'PM', minute: 0 },
        { hour12: 1, meridiem: 'PM', minute: 0 },
      ),
    ).toEqual({
      hour12: 1,
      meridiem: 'PM',
      minute: 0,
    });

    expect(
      normalizeAnalogTimeFor24Hour(
        { hour12: 11, meridiem: 'PM', minute: 0 },
        { hour12: 12, meridiem: 'PM', minute: 0 },
      ),
    ).toEqual({
      hour12: 12,
      meridiem: 'AM',
      minute: 0,
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

  it('picks a new visible time within the selected interval', () => {
    const randomValues = [
      0.2, 0, 0, // 3:00 AM
      0.2, 0, 0.99, // 3:00 PM, same visible time
      0.51, 0.99, 0, // 7:45 AM
    ];

    const next = nextTimeValueForInterval(
      { hour12: 3, meridiem: 'PM', minute: 0 },
      '15-minute',
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
      minute: 45,
    });
  });

  it('generates ordered elapsed-time pairs and avoids repeating them', () => {
    const pair = randomElapsedTimePairForInterval('15-minute', () => 0.25);

    expect(getElapsedMinutes(pair[0], pair[1])).toBeGreaterThan(0);
    expect(pair[0].minute % 15).toBe(0);
    expect(pair[1].minute % 15).toBe(0);

    const next = nextElapsedTimePairForInterval(
      [
        { hour12: 8, meridiem: 'AM', minute: 0 },
        { hour12: 9, meridiem: 'AM', minute: 0 },
      ],
      'hours-only',
      () => 0.1,
    );

    expect(next).not.toEqual([
      { hour12: 8, meridiem: 'AM', minute: 0 },
      { hour12: 9, meridiem: 'AM', minute: 0 },
    ]);
    expect(next[0].minute).toBe(0);
    expect(next[1].minute).toBe(0);
  });
});
