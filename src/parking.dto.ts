import type { OpeningPeriodDto } from './place-result.dto';

/** How a car park is built, from OSM's `parking=*`: the Postgres enum `parking_kind`. */
export enum ParkingKind {
  SURFACE = 'surface',
  MULTI_STOREY = 'multi_storey',
  UNDERGROUND = 'underground',
  ROOFTOP = 'rooftop',
}

/**
 * Who may park, as cotraveller-back judges it from OSM's tags and what
 * is next to the car park: the Postgres enum `parking_audience`. Only
 * `public` and `customers` car parks are ever shown.
 */
export enum ParkingAudience {
  /** Anyone may park. */
  PUBLIC = 'public',
  /** Only a business's customers (a supermarket's, a mall's): shown, labelled. */
  CUSTOMERS = 'customers',
  /** Only a hotel's guests. Never shown. */
  GUESTS = 'guests',
  /** Residents, staff, permit holders: no one passing by. Never shown. */
  PRIVATE = 'private',
}

/** A car park near a point, from OpenStreetMap; each detail is null when unknown. */
export interface ParkingDto {
  /** cotraveller's own id for the car park. */
  id: string;
  /** Its own name, else its operator's ("Q-Park parking"), else its kind ("Underground parking"). */
  name: string;
  latitude: number;
  longitude: number;
  /** Straight-line distance from the point asked about. */
  distanceMeters: number;
  kind: ParkingKind | null;
  /** `public` or `customers` (show "Customers only"). */
  audience: ParkingAudience.PUBLIC | ParkingAudience.CUSTOMERS;
  /** Whether parking costs money. */
  fee: boolean | null;
  /** The price as OSM's `charge` writes it, e.g. "3.50 EUR/hour". Rarely known. */
  charge: string | null;
  /** Number of spaces. */
  capacity: number | null;
  /** Spaces for disabled drivers. */
  capacityDisabled: number | null;
  /** Spaces with an EV charger. */
  capacityCharging: number | null;
  /** OSM's `maxstay` as written, e.g. "2 hours". */
  maxStay: string | null;
  /** Vehicle height limit. */
  maxHeightMeters: number | null;
  /** A park and ride. */
  parkAndRide: boolean | null;
  /** Whether it is open right now. Null when its hours are unknown. */
  openNow: boolean | null;
  /** ISO 8601 timestamp of the next time it opens, if known. */
  nextOpenTime: string | null;
  /** ISO 8601 timestamp of the next time it closes, if known. */
  nextCloseTime: string | null;
  /** The weekly hours as open/close periods. Empty when unknown. */
  openingPeriods: OpeningPeriodDto[];
  /** Permalink to the OpenStreetMap element. */
  osmUrl: string;
  /** The data's credit line (OpenStreetMap's licence asks for it). */
  attribution: string;
}

/** `GET /parkings/nearby`: the car parks around a point that a traveller may use, nearest first. */
export interface NearbyParkingsDto {
  parkings: ParkingDto[];
}

/**
 * What a place's own parking (`has_parking` in cotraveller-back) was
 * worked out from: the Postgres enum `own_parking_source`.
 */
export enum OwnParkingSource {
  /** The venue's own OSM `parking=*` tag. */
  OSM_TAG = 'osm_tag',
  /** A customers' or guests' car park right next to it. */
  NEARBY_CAR_PARK = 'nearby_car_park',
}

/**
 * Why a car park got its `ParkingAudience`: the Postgres enum
 * `parking_audience_reason`, so a wrong guess can be traced and the rule
 * tuned.
 */
export enum ParkingAudienceReason {
  /** OSM's `access` tag says it outright. */
  ACCESS_TAG = 'access_tag',
  /** Its name or operator is a hotel's. */
  HOTEL_NAME = 'hotel_name',
  /** It is customers-only, or untagged and small, right next to a hotel. */
  HOTEL_NEARBY = 'hotel_nearby',
  /** No `access` tag, and nothing says otherwise: public, as OSM intends. */
  UNTAGGED = 'untagged',
}
