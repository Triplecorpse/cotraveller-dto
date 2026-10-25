import { TravelMode } from './trip.dto';

/**
 * The travel modes the trip builder plans for. Car and public transport
 * come later: they need parking and timetables.
 */
export const TRIP_PLAN_TRAVEL_MODES: readonly TravelMode[] = [TravelMode.FOOT, TravelMode.BICYCLE];

/** Most places one plan takes: the travel-time matrix is at most 31 × 31 with the start. */
export const MAX_TRIP_PLAN_PLACES = 30;

/** Longest lunch break the builder accepts, in minutes. */
export const MAX_TRIP_PLAN_LUNCH_MINUTES = 180;

/**
 * What the traveller asks of each day: when it starts and ends, and the
 * lunch break, all as local `HH:mm` at the destination. The day starts
 * before lunch, and lunch ends before the day does.
 */
export interface TripPlanSettingsDto {
  /** When the first visit (or the way to it) starts, e.g. `09:00`. */
  dayStart: string;
  /** When the day is over, the way back to the start included, e.g. `18:00`. */
  dayEnd: string;
  /** When lunch should start, e.g. `13:00`; it moves to the visit boundary closest to it. */
  lunchStart: string;
  /** How long lunch takes, 0 to `MAX_TRIP_PLAN_LUNCH_MINUTES`; 0 for none. */
  lunchMinutes: number;
}

/** What the builder proposes when the traveller hasn't chosen yet. */
export const DEFAULT_TRIP_PLAN_SETTINGS: Readonly<TripPlanSettingsDto> = {
  dayStart: '09:00',
  dayEnd: '18:00',
  lunchStart: '13:00',
  lunchMinutes: 60,
};

/** Why a place on the trip isn't in the plan. */
export enum TripPlanLeftOutReason {
  /** Its hours are known and it opens on none of the trip's days, or never long enough for a visit. */
  CLOSED = 'closed',
  /** The trip's days are full. */
  NO_TIME = 'no-time',
  /** It has no coordinates, so no way to it can be worked out. */
  NO_LOCATION = 'no-location',
}

/** The way from one stop (or the start) to the next. */
export interface TripPlanLegDto {
  /** Time on the way, in seconds, as the router works it out for the trip's travel mode. */
  seconds: number;
  /** Length of the way, in metres. */
  meters: number;
  /**
   * The way as `[longitude, latitude]` points, for a map; null when the
   * router didn't give it.
   */
  geometry: [number, number][] | null;
}

/** One visit in a day's plan. */
export interface TripPlanStopDto {
  /** The trip place (`ListPlaceDto.id`). */
  listPlaceId: string;
  /** When the traveller gets there, local `HH:mm`. */
  arrive: string;
  /** When they leave, local `HH:mm`. */
  leave: string;
  /** Minutes waited on arrival for the place to open; 0 for none. */
  waitMinutes: number;
  /** How long the visit is planned for, in minutes (lunch inside it not counted). */
  visitMinutes: number;
  /** The visit is shorter than the place deserves: a day isn't long enough for it. */
  shortened: boolean;
  /**
   * Lunch is taken during this visit (a long one, such as a zoo); `leave`
   * includes it.
   */
  lunchInside: boolean;
  /**
   * Whether the place's opening hours were known for the day: true when
   * the visit fits them, false when unknown. Null when the plan has no
   * dates, so no hours were checked.
   */
  hoursKnown: boolean | null;
  /** The way here; null for the day's first stop when the day starts at it. */
  leg: TripPlanLegDto | null;
}

/** A lunch break between two visits. */
export interface TripPlanLunchDto {
  /** Local `HH:mm`. */
  start: string;
  /** Local `HH:mm`. */
  end: string;
  /** How many of the day's stops come before it (0: before the first). */
  afterStops: number;
}

/** One day of the plan. */
export interface TripPlanDayDto {
  /** 1 for the first day. */
  day: number;
  /** The calendar date (`YYYY-MM-DD`) for a trip with dates; null otherwise. */
  date: string | null;
  /** When the day starts, local `HH:mm`. */
  start: string;
  /** When it is over (the last visit left, or back at the start), local `HH:mm`. */
  end: string;
  stops: TripPlanStopDto[];
  /** The lunch break between visits; null when lunch is inside a visit, off, or the day is over before it. */
  lunch: TripPlanLunchDto | null;
  /** The way back to the trip's starting address; null when the day doesn't return there. */
  returnLeg: TripPlanLegDto | null;
}

/** A place left out of the plan, and why. */
export interface TripPlanLeftOutDto {
  listPlaceId: string;
  reason: TripPlanLeftOutReason;
}

/**
 * A trip's plan: its places in the order to visit them, day by day, with
 * the time on the way, the visits and lunch. Built on request
 * (`POST /trips/:tripId/plan`) and kept until built again.
 */
export interface TripPlanDto {
  tripId: string;
  settings: TripPlanSettingsDto;
  /** The trip's travel mode when the plan was built. */
  travelMode: TravelMode;
  /**
   * Every day starts and ends at the trip's exact starting address (a
   * hotel). Otherwise the first day starts at the first place, and each
   * next day at the place after the day before's last.
   */
  startsAtOrigin: boolean;
  /** Opening hours were checked: the trip has dates. */
  hoursChecked: boolean;
  /**
   * The trip changed since the plan was built: places added or removed,
   * or where, how or when edited. The plan is still shown, to be built
   * again.
   */
  stale: boolean;
  /** ISO 8601. */
  builtAt: string;
  days: TripPlanDayDto[];
  leftOut: TripPlanLeftOutDto[];
}

/** Body of `POST /trips/:tripId/plan`. */
export interface BuildTripPlanRequestDto {
  settings: TripPlanSettingsDto;
}
