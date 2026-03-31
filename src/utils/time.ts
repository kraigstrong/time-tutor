import {
  HOURS_12,
  MERIDIEMS,
  MINUTE_STEPS,
  type ExerciseMode,
  type Hour12,
  type Meridiem,
  type MinuteStep,
  type TimeValue,
} from '../types/time';

export const FULL_CIRCLE_DEGREES = 360;

type TimeFormattingOptions = {
  includeMeridiem?: boolean;
};

type TimeComparisonOptions = {
  includeMeridiem?: boolean;
};

export function randomTimeValue(random = Math.random): TimeValue {
  const hour12 = HOURS_12[Math.floor(random() * HOURS_12.length)] as Hour12;
  const minute = MINUTE_STEPS[
    Math.floor(random() * MINUTE_STEPS.length)
  ] as MinuteStep;
  const meridiem = MERIDIEMS[Math.floor(random() * MERIDIEMS.length)] as Meridiem;

  return {
    hour12,
    minute,
    meridiem,
  };
}

export function nextTimeValue(
  previous: TimeValue,
  random = Math.random,
): TimeValue {
  let candidate = randomTimeValue(random);
  let attempts = 0;

  while (
    attempts < 24 &&
    areTimesEqual(candidate, previous, { includeMeridiem: false })
  ) {
    candidate = randomTimeValue(random);
    attempts += 1;
  }

  if (!areTimesEqual(candidate, previous, { includeMeridiem: false })) {
    return candidate;
  }

  return {
    ...candidate,
    hour12: cycleHour(previous.hour12, 1),
    minute: previous.minute,
    meridiem: previous.meridiem,
  };
}

export function formatTimeValue(
  time: TimeValue,
  options: TimeFormattingOptions = {},
): string {
  const includeMeridiem = options.includeMeridiem ?? true;
  const base = `${time.hour12}:${String(time.minute).padStart(2, '0')}`;

  return includeMeridiem ? `${base} ${time.meridiem}` : base;
}

export function areTimesEqual(
  left: TimeValue,
  right: TimeValue,
  options: TimeComparisonOptions = {},
): boolean {
  const includeMeridiem = options.includeMeridiem ?? true;

  return (
    left.hour12 === right.hour12 &&
    left.minute === right.minute &&
    (!includeMeridiem || left.meridiem === right.meridiem)
  );
}

export function getClockHandAngles(time: TimeValue) {
  return {
    hourAngle: ((time.hour12 % 12) + time.minute / 60) * 30,
    minuteAngle: time.minute * 6,
  };
}

export function snapMinuteFromAngle(angle: number): MinuteStep {
  const stepIndex = Math.round(normalizeAngle(angle) / 30) % MINUTE_STEPS.length;

  return MINUTE_STEPS[stepIndex] as MinuteStep;
}

export function deriveHourFromAngle(angle: number): Hour12 {
  const normalized = normalizeAngle(angle);
  const hourIndex = Math.round(normalized / 30) % HOURS_12.length;

  return (hourIndex === 0 ? 12 : hourIndex) as Hour12;
}

export function angleFromTouch(
  touchX: number,
  touchY: number,
  size: number,
): number {
  const radius = size / 2;
  const deltaX = touchX - radius;
  const deltaY = touchY - radius;
  const radians = Math.atan2(deltaY, deltaX);
  const degrees = (radians * 180) / Math.PI;

  return normalizeAngle(degrees + 90);
}

export function getModeTitle(mode: ExerciseMode): string {
  return mode === 'digital-to-analog' ? 'Set the Clock' : 'Read the Clock';
}

export function getModeDescription(mode: ExerciseMode): string {
  return mode === 'digital-to-analog'
    ? 'Drag the clock hands until the analog clock matches the digital time.'
    : 'Read the analog clock, then enter the matching digital time.';
}

export function createInitialAnswer(meridiem: Meridiem = 'AM'): TimeValue {
  return {
    hour12: 12,
    minute: 0,
    meridiem,
  };
}

export function cycleHour(hour: Hour12, delta: number): Hour12 {
  const index = HOURS_12.indexOf(hour);
  const nextIndex = modulo(index + delta, HOURS_12.length);

  return HOURS_12[nextIndex] as Hour12;
}

export function cycleMinute(minute: MinuteStep, delta: number): MinuteStep {
  const index = MINUTE_STEPS.indexOf(minute);
  const nextIndex = modulo(index + delta, MINUTE_STEPS.length);

  return MINUTE_STEPS[nextIndex] as MinuteStep;
}

export function toggleMeridiem(current: Meridiem): Meridiem {
  return current === 'AM' ? 'PM' : 'AM';
}

export function applyMinuteDrag(time: TimeValue, nextMinute: MinuteStep): TimeValue {
  const wrappedForward = time.minute >= 45 && nextMinute <= 15;
  const wrappedBackward = time.minute <= 15 && nextMinute >= 45;

  if (wrappedForward) {
    const nextHour = cycleHour(time.hour12, 1);

    return {
      hour12: nextHour,
      meridiem: time.hour12 === 11 ? toggleMeridiem(time.meridiem) : time.meridiem,
      minute: nextMinute,
    };
  }

  if (wrappedBackward) {
    const nextHour = cycleHour(time.hour12, -1);

    return {
      hour12: nextHour,
      meridiem: time.hour12 === 12 ? toggleMeridiem(time.meridiem) : time.meridiem,
      minute: nextMinute,
    };
  }

  return {
    ...time,
    minute: nextMinute,
  };
}

function normalizeAngle(angle: number): number {
  return ((angle % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES;
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
