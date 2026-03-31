export const MINUTE_STEPS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
] as const;

export const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const MERIDIEMS = ['AM', 'PM'] as const;

export type MinuteStep = (typeof MINUTE_STEPS)[number];
export type Hour12 = (typeof HOURS_12)[number];
export type Meridiem = (typeof MERIDIEMS)[number];
export type ExerciseMode = 'digital-to-analog' | 'analog-to-digital';

export type TimeValue = {
  hour12: Hour12;
  minute: MinuteStep;
  meridiem: Meridiem;
};

export type SubmissionResult = {
  isCorrect: boolean;
  expected: TimeValue;
  actual: TimeValue;
};
