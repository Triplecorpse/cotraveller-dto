/** What a day's start or end is measured from. */
export enum DayTimeKind {
  /** A time on the clock. */
  EXACT = 'exact',
  /** Minutes before or after sunrise at the place, on that date. */
  SUNRISE = 'sunrise',
  /** Minutes before or after sunset at the place, on that date. */
  SUNSET = 'sunset',
}

/**
 * When a day starts or ends. Both values are always there, so switching
 * the kind back and forth keeps what was typed; only the kind's own is used.
 */
export interface DayTimeDto {
  kind: DayTimeKind;
  /** The time for `EXACT`, local `HH:mm` at the destination, e.g. `09:00`. */
  time: string;
  /** For `SUNRISE` and `SUNSET`: minutes after it, negative for before, up to `MAX_SUN_OFFSET_MINUTES` either way. */
  offsetMinutes: number;
}

/**
 * What the traveller asks of a day: the comfortable day, which the plan
 * keeps to, and the limits, which it never goes past. It goes outside the
 * comfortable day only to fit places in. All local at the destination.
 */
export interface DayHoursDto {
  /** When the traveller likes the first visit (or the way to it) to start. */
  comfortStart: DayTimeDto;
  /** When the traveller likes the day to be over, the way back to the start included. */
  comfortEnd: DayTimeDto;
  /** The day never starts before this. */
  maxStart: DayTimeDto;
  /** The day is never over after this. */
  maxEnd: DayTimeDto;
  /** When lunch should start, local `HH:mm`; it moves to the visit boundary closest to it. */
  lunchStart: string;
  /** How long lunch takes, 0 to `MAX_TRIP_PLAN_LUNCH_MINUTES`; 0 for none. */
  lunchMinutes: number;
}

/** Longest lunch break accepted, in minutes. */
export const MAX_TRIP_PLAN_LUNCH_MINUTES = 180;

/** The farthest a time is set from sunrise or sunset, in minutes, either way. */
export const MAX_SUN_OFFSET_MINUTES = 240;

/** The shortest comfortable day that can be planned, in minutes: shorter ones are a typo. */
export const MIN_DAY_MINUTES = 120;

/** A time on the clock, with no offset from the sun. */
export function exactTime(time: string): DayTimeDto {
  return { kind: DayTimeKind.EXACT, time, offsetMinutes: 0 };
}

/** The day proposed before the traveller sets their own. */
export const DEFAULT_DAY_HOURS: Readonly<DayHoursDto> = {
  comfortStart: exactTime('09:00'),
  comfortEnd: exactTime('18:00'),
  maxStart: exactTime('08:00'),
  maxEnd: exactTime('20:00'),
  lunchStart: '13:00',
  lunchMinutes: 60,
};

/** `HH:mm` → minutes after midnight; null for anything else. */
export function clockMinutes(time: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/**
 * How many minutes `later` is after `earlier` when that can be told without
 * a date: both on the clock, or both from the same sun event. Null otherwise
 * (sunrise against a time of day): the day it is worked out for decides.
 */
function minutesBetween(earlier: DayTimeDto, later: DayTimeDto): number | null {
  if (earlier.kind !== later.kind) {
    return null;
  }
  if (earlier.kind !== DayTimeKind.EXACT) {
    return later.offsetMinutes - earlier.offsetMinutes;
  }
  const from = clockMinutes(earlier.time);
  const to = clockMinutes(later.time);
  return from === null || to === null ? null : to - from;
}

/**
 * Why the day's hours don't hold together, in the traveller's words; null
 * when they do. What depends on a date (sunrise against a time of day) can't
 * be told here: the plan keeps such a day inside its limits when it works it
 * out. Cotraveller-back and the pages use this one check.
 */
export function dayHoursProblem(hours: DayHoursDto): string | null {
  const times = [hours.comfortStart, hours.comfortEnd, hours.maxStart, hours.maxEnd];
  const lunchStart = clockMinutes(hours.lunchStart);
  if (lunchStart === null || times.some((time) => time.kind === DayTimeKind.EXACT && clockMinutes(time.time) === null)) {
    return 'Enter each time as hours and minutes.';
  }
  const offsets = times.filter((time) => time.kind !== DayTimeKind.EXACT).map((time) => time.offsetMinutes);
  if (offsets.some((offset) => !Number.isInteger(offset) || Math.abs(offset) > MAX_SUN_OFFSET_MINUTES)) {
    return `A time is at most ${MAX_SUN_OFFSET_MINUTES / 60} hours from sunrise or sunset, in whole minutes.`;
  }
  const length = minutesBetween(hours.comfortStart, hours.comfortEnd);
  if (length !== null && length < MIN_DAY_MINUTES) {
    return 'The day must be at least 2 hours long.';
  }
  if ((minutesBetween(hours.maxStart, hours.comfortStart) ?? 0) < 0) {
    return 'The comfortable day can’t start before your earliest start.';
  }
  if ((minutesBetween(hours.comfortEnd, hours.maxEnd) ?? 0) < 0) {
    return 'The comfortable day can’t end after your latest end.';
  }
  const start = hours.comfortStart.kind === DayTimeKind.EXACT ? clockMinutes(hours.comfortStart.time) : null;
  const end = hours.comfortEnd.kind === DayTimeKind.EXACT ? clockMinutes(hours.comfortEnd.time) : null;
  if ((start !== null && lunchStart <= start) || (end !== null && lunchStart + hours.lunchMinutes > end)) {
    return 'Lunch must start after the day starts and end before it ends.';
  }
  return null;
}
