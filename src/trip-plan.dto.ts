import { DEFAULT_DAY_HOURS, type DayHoursDto } from './day-hours.dto';
import { ParkingKind } from './parking.dto';
import type { OpeningPeriodDto } from './place-result.dto';
import { PublicHolidayHours } from './public-holiday-hours.enum';
import { TravelMode, type TripTimingDto } from './trip.dto';
import { COMFORT_WALK_TOLERANCE } from './user-settings.dto';

/** The travel modes the trip builder plans for. Public transport goes by timetables (MOTIS, `cotraveller-transit`). */
export const TRIP_PLAN_TRAVEL_MODES: readonly TravelMode[] = [TravelMode.FOOT, TravelMode.BICYCLE, TravelMode.CAR, TravelMode.TRANSIT];

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

/** One day of the trip with hours of its own. */
export interface TripPlanDayHoursDto {
  /** 1 for the first day. */
  day: number;
  hours: DayHoursDto;
}

/**
 * What the traveller asks of the plan: the hours of every day (the settings
 * themselves), the days with hours of their own, and by car how to park.
 */
export interface TripPlanSettingsDto extends DayHoursDto {
  /** The days set apart from the others, each at most once; the rest use these settings' hours. */
  days: TripPlanDayHoursDto[];
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
  ...DEFAULT_DAY_HOURS,
  days: [],
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
  /**
   * By public transport: no connection reaches it at any time of the day, or
   * none takes the traveller back to the hotel, within their longest walk.
   */
  NO_TRANSIT = 'no-transit',
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

/** What carries the traveller on a ride, from the timetable's kind of line. */
export enum TransitVehicle {
  BUS = 'bus',
  TRAM = 'tram',
  SUBWAY = 'subway',
  TRAIN = 'train',
  FERRY = 'ferry',
  /** A cable car, gondola, funicular or chair lift. */
  CABLE = 'cable',
  OTHER = 'other',
}

/** One line taken: what `TripPlanTransitPartDto` rides on. */
export interface TripPlanTransitRideDto {
  vehicle: TransitVehicle;
  /** The line as people call it ("IR 1580", "T4"); null when the timetable names none. */
  line: string | null;
  /** Where it is going, as shown on it; null when the timetable says nothing. */
  headsign: string | null;
  /** Who runs it. */
  operator: string | null;
  /** The line's own colour, `#rrggbb`; null when it has none. */
  color: string | null;
  /** Stops passed between getting on and off. */
  stopsBetween: number;
}

/** One part of a way by public transport: a walk or a ride. */
export interface TripPlanTransitPartDto {
  /** Where it starts: a stop's name; null for the place or hotel left. */
  from: string | null;
  /** Where it ends: a stop's name; null for the place or hotel reached. */
  to: string | null;
  /** Local `HH:mm`. */
  departs: string;
  /** Local `HH:mm`. */
  arrives: string;
  seconds: number;
  meters: number;
  /** As `[longitude, latitude]` points, for a map; null when not known. */
  geometry: [number, number][] | null;
  /** The line taken; null for a walk. */
  ride: TripPlanTransitRideDto | null;
}

/**
 * A way by public transport: the connection arriving soonest after the
 * traveller is ready to leave, so a stop served twice a week never beats a
 * farther one served hourly, as its wait counts. No walk in it is longer than
 * the longest walk (`TripPlanWalksDto`).
 */
export interface TripPlanTransitDto {
  /** When the traveller sets off, local `HH:mm`: later than ready when the connection is. */
  departs: string;
  /** When they get there, local `HH:mm`. */
  arrives: string;
  /** How many times they change lines. */
  transfers: number;
  parts: TripPlanTransitPartDto[];
  /** The longest single walk in it, in metres. */
  longestWalkMeters: number;
  /** A walk in it is longer than the comfortable one, as nothing else gets there or it saves a long time: the page warns. */
  beyondComfort: boolean;
}

/** What came of a connection MOTIS offered (`TransitRouteDto`). */
export enum TransitRouteVerdict {
  /** The one a plan takes. */
  CHOSEN = 'chosen',
  /** Fine, but the chosen one takes less effort: time, changes and walking together. */
  NOT_BEST = 'not-best',
  /** Past the comfortable walk, and not saving enough effort to be worth it. */
  PAST_COMFORT = 'past-comfort',
  /** A walk in it is longer than the longest walk. */
  PAST_LONGEST = 'past-longest',
  /** A ride getting off where it got on: a timetable's artefact. */
  POINTLESS = 'pointless',
}

/** A connection MOTIS offered for a way, and what came of it. For an admin, to see why a way is what it is. */
export interface TransitRouteDto extends TripPlanTransitDto {
  verdict: TransitRouteVerdict;
  /** What the choice goes by, in minutes: the time from when the traveller is ready, plus what its changes and walks are worth. */
  effortMinutes: number;
}

/** `GET /admin/transit-routes`: everything MOTIS offers for one way at one time, the chosen one first. */
export interface TransitRoutesDto {
  /** The date whose timetable was asked, `YYYY-MM-DD`. */
  date: string;
  /** When the traveller is ready, local `HH:mm`. */
  readyAt: string;
  routes: TransitRouteDto[];
}

/** One instruction of a way, as the router words it ("Turn left onto Strada Octavian Goga."). */
export interface TripPlanDirectionDto {
  text: string;
  /** How far this instruction goes on for. */
  meters: number;
  seconds: number;
}

/** A visit's ways in instructions; null for one it hasn't, or the router couldn't tell. */
export interface TripPlanStopDirectionsDto {
  listPlaceId: string;
  /** The walk back to the car, first. */
  toCar: TripPlanDirectionDto[] | null;
  /** The way itself. */
  way: TripPlanDirectionDto[] | null;
  /** The walk from the car park to the place. */
  walk: TripPlanDirectionDto[] | null;
}

/**
 * `GET /trips/:tripId/plan/directions`: every way of the plan in instructions, for the
 * PDF to carry offline. By public transport all null: `TripPlanLegDto.transit` says it.
 */
export interface TripPlanDirectionsDto {
  days: {
    day: number;
    stops: TripPlanStopDirectionsDto[];
    returnToCar: TripPlanDirectionDto[] | null;
    returnWay: TripPlanDirectionDto[] | null;
  }[];
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
  /**
   * By public transport, the connection; null when none gets there after the
   * traveller is ready that day (`seconds` is then a typical time, and the
   * page says so). Absent in other modes.
   */
  transit?: TripPlanTransitDto | null;
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
   * By public transport: the day left this visit's area and comes back to it, as
   * opening hours or the connections needed. Absent when it doesn't.
   */
  returnsToArea?: boolean;
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
  /**
   * Placed by hand on the calendar (dropped, moved or resized): Auto, for
   * the trip or the day, leaves it exactly as it is. To let Auto plan it
   * again, the traveller moves it back to the list.
   */
  manual: boolean;
  /**
   * The time the traveller asked for, local `HH:mm`, for a stop placed by
   * hand; null otherwise. `arrive` is later when the way from the place
   * before doesn't fit: the page warns of it, and the stop goes back to this
   * time once the way allows.
   */
  askedStart: string | null;
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

/** A day's hours worked out for its date, as local `HH:mm`, rounded to 5 minutes where they come from the sun. */
export interface TripPlanDayWindowDto {
  comfortStart: string;
  comfortEnd: string;
  maxStart: string;
  maxEnd: string;
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
  /**
   * False when the day was arranged by hand since its ways were last worked
   * out: its visits are where they were put, and its ways aren't calculated
   * until "Calculate routes" (`ArrangeTripPlanRequestDto.routes`). Absent or
   * true: the ways and times are worked out.
   */
  routed?: boolean;
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
   * `lunch` itself says how long), a day longer than the comfortable one
   * (within `window`'s limits), visits shorter
   * (`TripPlanStopDto.trimmedMinutes`). Only from a hotel. Absent from plans
   * built before 2026-10-29: false.
   */
  condensed?: boolean;
  /** The hours this day was planned with; absent from plans built before 2026-10-31. */
  window?: TripPlanDayWindowDto;
  /**
   * Sunrise where the trip is on this day, local `HH:mm`; null when the sun
   * doesn't rise (polar night, midnight sun). Worked out for the build's
   * date on a trip without dates. Absent from plans built before 2026-10-31.
   */
  sunrise?: string | null;
  /** Sunset, as `sunrise`. */
  sunset?: string | null;
  /**
   * Sunrise averaged across this day's places (each in its own time zone),
   * local `HH:mm`, for the calendar; across all the trip's places for an empty
   * day. Null when none has one. Absent from plans built before 2026-10-31.
   */
  averageSunrise?: string | null;
  /** Sunset, as `averageSunrise`. */
  averageSunset?: string | null;
  /** How many places the average is of, for the page to say so. */
  sunPlaces?: number;
  /**
   * By public transport, the date whose timetable this day was planned with,
   * when it isn't the day's own: a trip without dates (a typical weekday), or a
   * date whose timetable isn't published yet (the same weekday soon). Null or
   * absent: the day's own.
   */
  timetableDate?: string | null;
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
  /** Some stop is placed by hand (`TripPlanStopDto.manual`): the page offers Verify. */
  manual: boolean;
  days: TripPlanDayDto[];
  leftOut: TripPlanLeftOutDto[];
  /**
   * How long each place is visited, as worked out for the plan
   * (`ListPlaceDto.id` → minutes): what a place on the list counts for when
   * it is put on a day. A place not worked out yet is missing.
   */
  visitMinutes?: Record<string, number>;
}

/** Body of `POST /trips/:tripId/plan`. */
export interface BuildTripPlanRequestDto {
  settings: TripPlanSettingsDto;
  /**
   * The traveller agreed that Auto may change the visits they placed by hand
   * (from "Calculate routes"' dialog): they are planned as any other, days
   * condensed. Absent or false: those visits stay exactly as placed.
   */
  replaceManual?: boolean;
}

/** One visit as the calendar has it. */
export interface TripPlanArrangedStopDto {
  /** The trip place (`ListPlaceDto.id`). */
  listPlaceId: string;
  /** When the visit is to start, local `HH:mm`: the time asked for when placed by hand. */
  start: string;
  /** How long the visit is, in minutes. */
  visitMinutes: number;
  /** Placed by hand: Auto leaves it alone. */
  manual: boolean;
}

/** A day as the calendar has it. */
export interface TripPlanArrangedDayDto {
  /** 1 for the first day. */
  day: number;
  /** Where the day's lunch is; null for none. A grey zone: visits are not moved out of it. */
  lunch: { start: string; minutes: number } | null;
  stops: TripPlanArrangedStopDto[];
}

/**
 * Body of `PUT /trips/:tripId/plan/arrangement` and
 * `POST /trips/:tripId/plan/days/:day/auto`: the whole calendar, every day
 * of it, so sending it twice comes to the same plan.
 */
export interface ArrangeTripPlanRequestDto {
  settings: TripPlanSettingsDto;
  days: TripPlanArrangedDayDto[];
  /** The trip's new "When?" answer, when a day was added or removed; null otherwise. */
  timing: TripTimingDto | null;
  /**
   * "Calculate routes": the ways are worked out and each day timed, a visit
   * moved later where the way doesn't fit. Absent or false (a drop, a resize):
   * the visits stay where they were put, the ways aren't worked out and the
   * router isn't asked; days whose visits changed are `routed: false`.
   */
  routes?: boolean;
  /**
   * With `routes`: keep the plan even when a visit placed by hand moves or a
   * day goes past its limits. Without it such a plan is answered as
   * `Conflicts` and not kept.
   */
  confirm?: boolean;
}

/** What doesn't fit once the ways are worked out (`TripPlanArrangeOutcome.Conflicts`). */
export enum TripPlanConflictKind {
  /** A visit placed by hand can't start when asked: the way there takes longer. */
  Moved = 'moved',
  /** The day starts before its earliest start or ends after its latest end. */
  PastLimit = 'past-limit',
}

/** One thing that doesn't fit, as the dialog lists it. */
export interface TripPlanConflictDto {
  kind: TripPlanConflictKind;
  /** 1 for the first day. */
  day: number;
  /** `Moved`: the visit. */
  listPlaceId?: string;
  /** `Moved`: the time asked for and the earliest it can start, local `HH:mm`. */
  askedStart?: string;
  earliest?: string;
  /** `Moved`: the place before it on the day; null for the start of the day. */
  fromListPlaceId?: string | null;
  /** `Moved`: the way there, in minutes. */
  wayMinutes?: number;
  /** `PastLimit`: minutes before the earliest start (`early`) and after the latest end (`late`). */
  early?: number;
  late?: number;
  /** `PastLimit`: the limits, local `HH:mm`. */
  maxStart?: string;
  maxEnd?: string;
}

/** What arranging came to. */
export enum TripPlanArrangeOutcome {
  /** Worked out and kept: `plan` is the answer. */
  Arranged = 'arranged',
  /**
   * The ways and visit lengths of some place aren't worked out yet: a
   * preparation is queued (`build`). The page sends the calendar again when
   * it ends.
   */
  Preparing = 'preparing',
  /**
   * "Calculate routes" found what doesn't fit (`conflicts`); nothing was kept.
   * The page asks the traveller, then sends again with `confirm`, fewer
   * places, more days, or Auto.
   */
  Conflicts = 'conflicts',
}

/** Response of `PUT /trips/:tripId/plan/arrangement` and `POST /trips/:tripId/plan/days/:day/auto`. */
export type ArrangeTripPlanResponseDto =
  | { outcome: TripPlanArrangeOutcome.Arranged; plan: TripPlanDto }
  | { outcome: TripPlanArrangeOutcome.Preparing; build: TripPlanBuildDto }
  | { outcome: TripPlanArrangeOutcome.Conflicts; conflicts: TripPlanConflictDto[] };

/** A day's sun, known without a plan. */
export interface TripPlanCalendarDayDto {
  /** 1 for the first day. */
  day: number;
  /** The calendar date for a trip with dates; null otherwise (the sun is today's). */
  date: string | null;
  /** Where day times set from the sun are measured, local `HH:mm`; null without one. */
  sunrise: string | null;
  sunset: string | null;
  /** Averaged across the trip's places, as `TripPlanDayDto.averageSunrise`. */
  averageSunrise: string | null;
  averageSunset: string | null;
  sunPlaces: number;
}

/** Response of `GET /trips/:tripId/plan/calendar`: the sun of the trip's days, before any plan. No provider call. */
export interface TripPlanCalendarDto {
  days: TripPlanCalendarDayDto[];
}

/** What Verify found wrong with a visit. */
export enum TripPlanIssueKind {
  /** The place is closed on the visit's date. */
  CLOSED_DAY = 'closed-day',
  /** The place is open that date, but not for the whole visit (`open` says when). */
  OUTSIDE_HOURS = 'outside-hours',
  /** The place's hours for that date aren't known. */
  UNKNOWN_HOURS = 'unknown-hours',
  /** The place is closed for now, whatever the date: for a trip without dates. */
  CLOSED_PLACE = 'closed-place',
}

/** One thing Verify found. */
export interface TripPlanIssueDto {
  listPlaceId: string;
  /** 1 for the first day. */
  day: number;
  /** The visit's date; null without dates. */
  date: string | null;
  kind: TripPlanIssueKind;
  /** When the place is open that date, as local `HH:mm` pairs; empty when closed or unknown. */
  open: [string, string][];
}

/** Response of `POST /trips/:tripId/plan/verify`. Public holidays are the page's (`TripPlanStopDto.publicHolidays`). */
export interface TripPlanVerificationDto {
  /** ISO 8601. */
  checkedAt: string;
  /** Hours were checked: the trip has dates. */
  hoursChecked: boolean;
  /** How many visits were checked. */
  checked: number;
  issues: TripPlanIssueDto[];
}

/** Where a trip plan's build stands: it is queued and built by a worker. */
export enum TripPlanBuildStatus {
  /** Waiting for the worker. */
  Pending = 'pending',
  /** Being built: see its `stage`. */
  Running = 'running',
  /** Built: `GET /trips/:tripId/plan` answers it. */
  Done = 'done',
  /** Stopped by an error (`error` says why); the trip can be built again. */
  Failed = 'failed',
}

/** What a running build is doing, in order. */
export enum TripPlanBuildStage {
  /** Reading the places: where they are, their outlines and entrances. */
  Places = 'places',
  /** Reading opening hours our tables lack for the trip's dates. */
  Hours = 'hours',
  /** By public transport: loading the timetables of a country not loaded yet. */
  Timetables = 'timetables',
  /** Working out the ways between places, the car parks and the days. */
  Routes = 'routes',
  /** Keeping the plan. */
  Saving = 'saving',
}

/** What `POST /trips/:tripId/plan` did. */
export enum TripPlanBuildStartOutcome {
  /** A new build was queued. */
  Started = 'started',
  /** The trip already has a build waiting or at work: that one is returned. */
  Running = 'running',
}

/**
 * One build of a trip's plan, as the user's "Trip plans" page and the trip
 * builder show it. Response of `GET /plan-builds`, `GET /trips/:tripId/plan/build`.
 */
export interface TripPlanBuildDto {
  id: string;
  tripId: string;
  /** The trip's name when the build was asked for; kept after the trip is removed. */
  tripName: string;
  /** Whether the trip still exists (its plan can be opened). */
  tripExists: boolean;
  status: TripPlanBuildStatus;
  /** What a running build is doing; null otherwise. */
  stage: TripPlanBuildStage | null;
  /** Places planned; null until the build knows. */
  places: number | null;
  /** Why it failed, in words for the traveller. */
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  /** When the email saying it ended was sent; null before, or when none could be. */
  emailedAt: string | null;
}

/** Response of `POST /trips/:tripId/plan` (202). */
export interface StartTripPlanBuildResponseDto {
  outcome: TripPlanBuildStartOutcome;
  build: TripPlanBuildDto;
}
