import { DEFAULT_DAY_HOURS, type DayHoursDto } from './day-hours.dto';
import type { ContentLanguage, InterfaceLanguage } from './language.dto';
import { TravelMode } from './trip.dto';

/**
 * How long the traveller likes to be on the way by one travel mode, one
 * way, in minutes. Times rather than distances: a climb takes longer
 * than the same distance on the flat, and the router's times know it.
 */
export interface TravelTimeLimitsDto {
  /**
   * Comfortable: what the trip builder keeps to when it can. A plan
   * prefers ways within it; on foot, a walk past it gets a warning.
   */
  comfortMinutes: number;
  /**
   * The longest ever planned, at least `comfortMinutes`. The search looks
   * as far as this takes at the mode's usual speed
   * (`TRAVEL_SPEEDS_KMH`), and the trip builder plans no way longer.
   */
  maxMinutes: number;
}

/** The traveller's times for every travel mode. On foot also counts for the walks of a car or public transport trip. */
export type TravelTimesDto = Record<TravelMode, TravelTimeLimitsDto>;

/**
 * The traveller's own settings, kept with their account
 * (`GET`/`PATCH /settings`): their usual day, how long they like to be on
 * the way, and their languages. The trip builder proposes the day; the
 * times shape the search and every plan.
 */
export interface UserSettingsDto extends DayHoursDto {
  /**
   * How long the traveller likes to be on the way, by travel mode. On foot
   * is also the walk from where the car is left to a place (a car park
   * farther is still taken when it has the quickest walk, up to the
   * longest, with a warning), and every walk in a public transport
   * connection. By car, a drive whose walk is shorter than the
   * comfortable walk is walked instead.
   */
  travelTimes: TravelTimesDto;
  /**
   * By public transport: fewer changes even when the way takes longer.
   * The trip builder then counts each change as much more effort
   * (`AVOID_TRANSFERS_FACTOR`).
   */
  avoidTransfers: boolean;
  /**
   * The language the app's screens are shown in, chosen in the header;
   * null until the traveller chooses one (the page's own choice then
   * stands, and is kept here once they are signed in).
   */
  interfaceLanguage: InterfaceLanguage | null;
  /**
   * The language places are shown in: their names, and the About texts
   * written or translated for them. Null: the interface language.
   */
  contentLanguage: ContentLanguage | null;
}

/**
 * Each mode's usual speed as the crow flies, in km/h: what a time on the
 * way becomes as a search radius. Slower than on the way itself, as no
 * way is a straight line. By car about 150 km in 3 hours, the backend's
 * widest search (cotraveller-back's `MAX_SEARCH_RADIUS_M`).
 */
export const TRAVEL_SPEEDS_KMH: Readonly<Record<TravelMode, number>> = {
  [TravelMode.FOOT]: 3.5,
  [TravelMode.BICYCLE]: 12,
  [TravelMode.TRANSIT]: 18,
  [TravelMode.CAR]: 50,
};

/** The times proposed: today's search areas (3.5 km on foot, 18 km by bicycle, 27 km by public transport, 150 km by car). */
export const DEFAULT_TRAVEL_TIMES: Readonly<TravelTimesDto> = {
  [TravelMode.FOOT]: { comfortMinutes: 25, maxMinutes: 60 },
  [TravelMode.BICYCLE]: { comfortMinutes: 45, maxMinutes: 90 },
  [TravelMode.TRANSIT]: { comfortMinutes: 45, maxMinutes: 90 },
  [TravelMode.CAR]: { comfortMinutes: 60, maxMinutes: 180 },
};

/** The shortest time accepted, in minutes. */
export const MIN_TRAVEL_MINUTES = 5;

/** The longest time accepted, in minutes: 10 hours. */
export const MAX_TRAVEL_MINUTES = 600;

/** A walk up to this many times the comfortable one is still taken (+50%). */
export const COMFORT_WALK_TOLERANCE = 1.5;

/** With `avoidTransfers`, a change counts as this many times the effort. */
export const AVOID_TRANSFERS_FACTOR = 3;

/** A traveller's settings before they change any: the trip builder's proposed day, the proposed times. */
export const DEFAULT_USER_SETTINGS: Readonly<UserSettingsDto> = {
  ...DEFAULT_DAY_HOURS,
  travelTimes: DEFAULT_TRAVEL_TIMES,
  avoidTransfers: false,
  interfaceLanguage: null,
  contentLanguage: null,
};

/**
 * Why the times don't hold together, in the traveller's words; null when
 * they do: every mode there, each time a whole number of minutes from
 * `MIN_TRAVEL_MINUTES` to `MAX_TRAVEL_MINUTES`, the longest at least the
 * comfortable one.
 */
export function travelTimesProblem(times: TravelTimesDto): string | null {
  for (const mode of Object.values(TravelMode)) {
    const limits = times?.[mode];
    if (!limits) {
      return `The times for ${mode} are missing.`;
    }
    for (const minutes of [limits.comfortMinutes, limits.maxMinutes]) {
      if (!Number.isInteger(minutes) || minutes < MIN_TRAVEL_MINUTES || minutes > MAX_TRAVEL_MINUTES) {
        return `Each time is ${MIN_TRAVEL_MINUTES} to ${MAX_TRAVEL_MINUTES} minutes.`;
      }
    }
    if (limits.maxMinutes < limits.comfortMinutes) {
      return 'The longest time must be at least the comfortable one.';
    }
  }
  return null;
}

/** Body of `PATCH /settings`: only the settings to change. `travelTimes` is sent whole. */
export type UpdateUserSettingsRequestDto = Partial<UserSettingsDto>;
