import { ParkingKind } from './parking.dto';
import type { OpeningPeriodDto } from './place-result.dto';
import { PublicHolidayHours } from './public-holiday-hours.enum';
import { TravelMode } from './trip.dto';
import { COMFORT_WALK_TOLERANCE } from './user-settings.dto';

/**
 * The travel modes the trip builder plans for. Public transport comes
 * later: it needs timetables.
 */
export const TRIP_PLAN_TRAVEL_MODES: readonly TravelMode[] = [TravelMode.FOOT, TravelMode.BICYCLE, TravelMode.CAR];

/** The vehicle a car trip goes in: how tall it is decides which car parks it fits. */
export enum VehicleType {
  CAR = 'car',
  SUV = 'suv',
  VAN = 'van',
  CAMPER = 'camper',
}

/**
 * How tall each vehicle is taken to be, in metres, against a car park's
 * height limit (OSM `maxheight`). A little over the usual: a roof box
 * or an aerial shouldn't scrape.
 */
export const VEHICLE_HEIGHT_METERS: Readonly<Record<VehicleType, number>> = {
  [VehicleType.CAR]: 1.6,
  [VehicleType.SUV]: 2.0,
  [VehicleType.VAN]: 2.5,
  [VehicleType.CAMPER]: 3.2,
};

/** Vehicles bigger than an SUV: a car park with no known height limit gets a warning for them. */
export function isLargeVehicle(type: VehicleType): boolean {
  return VEHICLE_HEIGHT_METERS[type] > VEHICLE_HEIGHT_METERS[VehicleType.SUV];
}

/**
 * How car parks are looked for around a place, in metres in a straight
 * line: ring after ring, the car parks in each walked to the place along
 * footpaths, the shortest walk kept. The search stops once no car park
 * farther off can be walked from in less (a walk is never shorter than
 * the straight line), or at the traveller's longest walk
 * (`carParkSearchMeters`) — the last ring when they set no limit.
 */
export const TRIP_PLAN_CAR_PARK_RINGS_METERS: readonly number[] = [
  500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000,
];

/**
 * Where a road reaches the place, for plans built before the traveller's
 * walking settings (2026-10-26, `TripPlanDto.walks` absent): the farthest
 * a car park was looked for and the longest walk from it. Since then
 * `carParkSearchMeters`.
 */
export const TRIP_PLAN_CAR_PARK_METERS = 1_000;

/**
 * By car, for plans built before the traveller's walking settings: a drive
 * shorter than this was walked. Since then `walkBelowMeters`.
 */
export const TRIP_PLAN_WALK_BELOW_METERS = 2_000;

/**
 * The walks a plan was built with: the traveller's settings
 * (`UserSettingsDto`) when it was built.
 */
export interface TripPlanWalksDto {
  /** The comfortable walk from where the car is left, in metres. */
  comfortWalkMeters: number;
  /** The longest walk planned, in metres; null for no limit. */
  maxWalkMeters: number | null;
}

/**
 * By car: the farthest a car park is looked for (in a straight line) and
 * walked from (along footpaths), in metres — the traveller's longest walk,
 * or the last ring (`TRIP_PLAN_CAR_PARK_RINGS_METERS`) with no limit. The
 * search goes ring by ring from the place and stops at the first that
 * can't hold a shorter walk, so it usually ends near. A walk longer than
 * the comfortable one is planned with a warning (`walkBeyondComfort`).
 */
export function carParkSearchMeters(walks: TripPlanWalksDto): number {
  const last = TRIP_PLAN_CAR_PARK_RINGS_METERS[TRIP_PLAN_CAR_PARK_RINGS_METERS.length - 1];
  return Math.min(walks.maxWalkMeters ?? last, last);
}

/** A walk from a car park longer than the traveller's comfortable walk: the plan warns of it. */
export function walkBeyondComfort(walkMeters: number, walks: TripPlanWalksDto): boolean {
  return walkMeters > walks.comfortWalkMeters;
}

/**
 * By car, between places: the car stays where it is while the next place
 * is within this many metres of it, and the group walks — the comfortable
 * walk and half again, never past the longest. Farther, the car is moved
 * to the next car park.
 */
export function carMoveMeters(walks: TripPlanWalksDto): number {
  return Math.min(walks.comfortWalkMeters * COMFORT_WALK_TOLERANCE, walks.maxWalkMeters ?? Infinity);
}

/**
 * By car: a drive shorter than this, in metres, isn't taken — the group
 * walks to the next place and the car stays where it is, to be walked
 * back to before the next drive. The comfortable walk, never past the
 * longest. The car itself is moved once the place is more than
 * `carMoveMeters` from it.
 */
export function walkBelowMeters(walks: TripPlanWalksDto): number {
  return Math.min(walks.comfortWalkMeters, walks.maxWalkMeters ?? Infinity);
}

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
  /**
   * By car: drive to the car park with the shortest walk to the place
   * (`TRIP_PLAN_CAR_PARK_RINGS_METERS`) and walk the rest; a place with its
   * own parking is driven to. Off: drive to each place. Ignored on foot and
   * by bicycle.
   */
  parkNearby: boolean;
  /**
   * By car, with `parkNearby` only: the driver drops the group at the
   * entrance, parks and walks back, and after the visit brings the car
   * round to pick them up.
   */
  dropOffFirst: boolean;
  /** By car: the vehicle, for car parks' height limits. */
  vehicleType: VehicleType;
}

/** What the builder proposes when the traveller hasn't chosen yet. */
export const DEFAULT_TRIP_PLAN_SETTINGS: Readonly<TripPlanSettingsDto> = {
  dayStart: '09:00',
  dayEnd: '18:00',
  lunchStart: '13:00',
  lunchMinutes: 60,
  parkNearby: true,
  dropOffFirst: false,
  vehicleType: VehicleType.CAR,
};

/** Why a place on the trip isn't in the plan. */
export enum TripPlanLeftOutReason {
  /** Its hours are known and it opens on none of the trip's days, or never long enough for a visit. */
  CLOSED = 'closed',
  /** The trip's days are full. */
  NO_TIME = 'no-time',
  /** It has no coordinates, so no way to it can be worked out. */
  NO_LOCATION = 'no-location',
  /**
   * Farther on foot than the traveller's longest walk
   * (`UserSettingsDto.maxWalkMeters`): on foot, from the hotel (or from
   * every other place without one); by car, from every car park, no road
   * reaching it.
   */
  TOO_FAR = 'too-far',
}

/** How a car trip reaches a place. */
export enum TripPlanArrival {
  /** Driven to the place itself (car parks weren't asked for). */
  ENTRANCE = 'entrance',
  /**
   * The place has parking of its own: driven to it. When its car park is
   * known (a customers' car park in or by its outline, or one it is
   * tagged with) the drive ends there and `parking` is it, with the walk
   * to the entrance; otherwise `parking` is null and the drive ends at
   * the place.
   */
  OWN_PARKING = 'own-parking',
  /** Parked at a car park nearby, then on foot (`parking`). */
  CAR_PARK = 'car-park',
  /** Dropped off at the entrance; the driver parks at `parking` (`driver`). */
  DROP_OFF = 'drop-off',
  /** No car park the vehicle fits within the traveller's longest walk (`carParkSearchMeters`), or none open: driven to the place. */
  NO_CAR_PARK = 'no-car-park',
  /**
   * No road reaches the place (the car router finds no way to it, walking
   * does): parked at the car park the vehicle fits with the shortest walk,
   * however far (`TRIP_PLAN_CAR_PARK_RINGS_METERS`) up to the traveller's
   * longest walk, and the rest on foot; whatever the parking settings, as
   * no one can be driven there. `parking` is null when none was found
   * (without a longest walk): check how to get there. With one, a place
   * with no car park within it is left out (`TOO_FAR`).
   */
  NO_ROAD = 'no-road',
  /**
   * Walked from the place before: the drive would be shorter than
   * `walkBelowMeters`, so the car stays where it is (`leg` is
   * the walk).
   */
  ON_FOOT = 'on-foot',
}

/** A walk: seconds and metres on foot, and its way for a map. */
export interface TripPlanWalkDto {
  seconds: number;
  meters: number;
  /** Along footpaths, as `[longitude, latitude]` points; null when the router didn't give it. */
  geometry?: [number, number][] | null;
}

/** The car park a visit uses, and the walk between it and the place. */
export interface TripPlanCarParkDto {
  /** `ParkingDto.id`. */
  parkingId: string;
  /** Its name, else its operator's, else a plain one ("Car park"). */
  name: string;
  kind: ParkingKind | null;
  /** Whether it charges; null when unknown. */
  fee: boolean | null;
  /** The price as OSM writes it, e.g. "2 EUR/hour". */
  charge: string | null;
  /** Spaces, when known. */
  capacity: number | null;
  /** Its height limit in metres, when known. */
  maxHeightMeters: number | null;
  /** The vehicle is bigger than an SUV and the car park's height limit is unknown: check before driving in. */
  heightUnknown: boolean;
  /**
   * On foot from the car park to the place: seconds and metres. The
   * router's time counts the climb; the walk back to the car (`toCar`,
   * `returnToCar`) is timed the other way, downhill where this is uphill.
   */
  walkSeconds: number;
  walkMeters: number;
  /**
   * Metres climbed on the way from the car park to the place, when the
   * router gave the walk's heights; null otherwise and for plans built
   * before 2026-10-26.
   */
  walkClimbMeters?: number | null;
  /** At the start of a marked hiking trail, or by a trailhead (OSM): where hikers park. */
  trailhead?: boolean;
  /** Where it is, `[longitude, latitude]`, for a map. */
  location: [number, number];
  /**
   * The walk from it to the place as `[longitude, latitude]` points, along
   * footpaths, for a map (the way back is the same); null when the router
   * didn't give it, or for plans built before 2026-10-26.
   */
  walkGeometry?: [number, number][] | null;
  /** Who runs it (OSM `operator`), e.g. "Q-Park". */
  operator: string | null;
  /** Spaces for disabled drivers. */
  capacityDisabled: number | null;
  /** Spaces with an EV charger. */
  capacityCharging: number | null;
  /** OSM's `maxstay` as written, e.g. "2 hours". */
  maxStay: string | null;
  /** A park and ride. */
  parkAndRide: boolean | null;
  /** The weekly hours as open/close periods, in its local time. Empty when unknown (most car parks). */
  openingPeriods: OpeningPeriodDto[];
  /** Permalink to the OpenStreetMap element. */
  osmUrl: string;
  /** The data's credit line (OpenStreetMap's licence asks for it). */
  attribution: string;
}

/** With drop-off: what the driver does while the group visits. */
export interface TripPlanDriverDto {
  /** Driving from the entrance to the car park, seconds. */
  parkSeconds: number;
  /** Walking from the car park back to the place, seconds (and the same back to the car). */
  walkSeconds: number;
  /** When the driver joins the group, local `HH:mm`; null when the visit is too short to. */
  joinsAt: string | null;
  /** When the driver leaves to bring the car round, local `HH:mm`; null with `joinsAt`. */
  leavesAt: string | null;
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

/**
 * A place seen from the car: the roads driven inside it, as OSM maps
 * them, then (by car) its car park for the part on foot (`parking`).
 */
export interface TripPlanDriveThroughDto {
  /**
   * The roads a car may drive inside the place, as `[longitude, latitude]`
   * lines, joined where they meet; empty when OSM maps none (or by
   * bicycle and on foot, where they aren't looked up).
   */
  roads: [number, number][][];
  /** How long those roads are, in metres; 0 with none. */
  meters: number;
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
   * Minutes taken off the visit to condense its day
   * (`TripPlanDayDto.condensed`); 0 for none. Absent from plans built
   * before 2026-10-29.
   */
  trimmedMinutes?: number;
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
  /**
   * What the place's hours source says about public holidays; null when
   * it says nothing, so on a holiday its hours may differ from the ones
   * planned with. Absent from plans built before 2026-10-29: unknown.
   */
  publicHolidays?: PublicHolidayHours | null;
  /**
   * The way here; null for the day's first stop when the day starts at it.
   * By car it is the drive (to the car park when parked there).
   */
  leg: TripPlanLegDto | null;
  /** By car: how the place is reached; null on foot and by bicycle. */
  arrival: TripPlanArrival | null;
  /**
   * By car, parked at or dropped off near a car park — the place's own
   * one too (`OWN_PARKING`) — that car park; null otherwise.
   */
  parking: TripPlanCarParkDto | null;
  /**
   * The place is seen from the car (OSM `drive_through=yes`: a safari
   * park, a drive-through); null for one that isn't, and absent from
   * plans built before 2026-10-28. In every travel mode, so the page can
   * say part of it is by car only.
   */
  driveThrough?: TripPlanDriveThroughDto | null;
  /** By car with drop-off: what the driver does; null otherwise. */
  driver: TripPlanDriverDto | null;
  /**
   * By car, before this stop's drive: the walk from the place before back
   * to the car — to its car park, or farther back when the places between
   * were walked to. Null when there is no walk (the car is at the place
   * before, or the day starts here). Absent from plans built before
   * 2026-10-26, which show the walk back to the car after each visit.
   */
  toCar?: TripPlanWalkDto | null;
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
  /** The way back is on foot: the car stayed at the start, and the day was walked. Absent: false. */
  returnOnFoot?: boolean;
  /** By car, before the way back: the walk to the car, as `TripPlanStopDto.toCar`. */
  returnToCar?: TripPlanWalkDto | null;
  /**
   * The day is condensed so its places share it rather than the road to
   * them being driven on two days: lunch shorter than the settings' (the
   * `lunch` itself says how long), an `end` up to 45 min after the
   * settings' `dayEnd`, visits shorter (`TripPlanStopDto.trimmedMinutes`).
   * Only from a hotel. Absent from plans built before 2026-10-29: false.
   */
  condensed?: boolean;
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
  /** The walks it was built with; absent for plans built before 2026-10-26 (`TRIP_PLAN_CAR_PARK_METERS`). */
  walks?: TripPlanWalksDto;
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
