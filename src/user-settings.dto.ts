import { DEFAULT_DAY_HOURS, type DayHoursDto } from './day-hours.dto';

/**
 * The traveller's own settings, kept with their account
 * (`GET`/`PATCH /settings`): their usual day, and how far they like to
 * walk. The trip builder proposes the day; the walks shape every plan.
 */
export interface UserSettingsDto extends DayHoursDto {
  /**
   * The comfortable walk from where the car is left to a place, in metres
   * (`RECOMMENDED_COMFORT_WALK_METERS`). A car park farther on foot is
   * still taken when it has the shortest walk (up to `maxWalkMeters`), with
   * a warning. Between places a drive shorter than this is walked, and the
   * car stays while the place is within `COMFORT_WALK_TOLERANCE` times
   * this of it; farther, it moves to another car park.
   */
  comfortWalkMeters: number;
  /**
   * The longest walk ever planned, in metres; null for no limit (for
   * hikers). The car-park search goes no farther. Places farther on foot
   * are left out of a plan: on foot, more than this from the hotel (or from
   * every other place without one); by car, more than this from any car
   * park when no road reaches them (a road's place is driven to instead).
   */
  maxWalkMeters: number | null;
}

/** The comfortable walk proposed: 2 km. */
export const RECOMMENDED_COMFORT_WALK_METERS = 2_000;

/** A walk up to this many times the comfortable one is still taken (+50%). */
export const COMFORT_WALK_TOLERANCE = 1.5;

/** The shortest comfortable (and longest) walk accepted, in metres. */
export const MIN_WALK_SETTING_METERS = 100;

/** The longest comfortable walk accepted, in metres: the car park search ends at 64 km. */
export const MAX_COMFORT_WALK_METERS = 20_000;

/** The longest limit accepted besides none, in metres. */
export const MAX_WALK_LIMIT_METERS = 100_000;

/** A traveller's settings before they change any: the trip builder's proposed day, the recommended walks. */
export const DEFAULT_USER_SETTINGS: Readonly<UserSettingsDto> = {
  ...DEFAULT_DAY_HOURS,
  comfortWalkMeters: RECOMMENDED_COMFORT_WALK_METERS,
  maxWalkMeters: null,
};

/** Body of `PATCH /settings`: only the settings to change. */
export type UpdateUserSettingsRequestDto = Partial<UserSettingsDto>;
