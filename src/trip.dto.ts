import { CategoryId } from './category-id.enum';
import type { AddListPlaceRequestDto, ListDto, ListPlaceDto } from './list.dto';
import type { GeoBoundsDto } from './places-search.dto';

/** How the traveller gets around at the destination. */
export enum TravelMode {
  CAR = 'car',
  BICYCLE = 'bicycle',
  TRANSIT = 'transit',
  FOOT = 'foot',
}

/**
 * What the starting location stands for, which decides how the trip is
 * searched:
 * - `exact`: one spot (an address, a hotel, the current location),
 *   searched around it;
 * - `city`: a city or district, searched from its centre;
 * - `region`: a state, province or county, searched inside its border;
 * - `country`: a whole country, searched inside its border — never
 *   across it, since a traveller may not be allowed into the next one.
 *
 * A region or a country is searched by relevance, not distance (see
 * `SearchAreaDto`).
 */
export enum OriginKind {
  EXACT = 'exact',
  CITY = 'city',
  REGION = 'region',
  COUNTRY = 'country',
}

/** The kinds searched inside a border rather than within a radius. */
export type AreaOriginKind = OriginKind.REGION | OriginKind.COUNTRY;

/** Whether a kind is searched inside a border (`SearchAreaDto`) rather than within a radius. */
export function isAreaOriginKind(kind: OriginKind): kind is AreaOriginKind {
  return kind === OriginKind.REGION || kind === OriginKind.COUNTRY;
}

/**
 * The travel modes a trip may use from each kind of starting location. A
 * region or a country is too big to get around on foot or by bicycle.
 */
export const TRAVEL_MODES_BY_ORIGIN_KIND: Readonly<Record<OriginKind, readonly TravelMode[]>> = {
  [OriginKind.EXACT]: [TravelMode.CAR, TravelMode.BICYCLE, TravelMode.TRANSIT, TravelMode.FOOT],
  [OriginKind.CITY]: [TravelMode.CAR, TravelMode.BICYCLE, TravelMode.TRANSIT, TravelMode.FOOT],
  [OriginKind.REGION]: [TravelMode.CAR, TravelMode.TRANSIT],
  [OriginKind.COUNTRY]: [TravelMode.CAR, TravelMode.TRANSIT],
};

/** Where the starting location came from: a picked suggestion, or the device's position. */
export enum OriginSource {
  PLACE = 'place',
  CURRENT = 'current',
}

/** Longest trip, for both exact dates (inclusive) and a number of days. */
export const MAX_TRIP_DAYS = 30;

/** Which "When?" answer the traveller gave; exactly one of them. */
export enum TripTimingKind {
  DATES = 'dates',
  DAYS = 'days',
  UNSURE = 'unsure',
}

/**
 * "Where are you going?": the suggestion the traveller picked and the
 * place it resolved to, as they were. A current location has only
 * coordinates.
 */
export interface TripOriginDto {
  source: OriginSource;
  /** What was typed before picking, e.g. "hotel delfino"; null for the current location. */
  inputText: string | null;
  /** The picked suggestion's (Geoapify) place id. */
  placeId: string | null;
  /** The suggestion's first line, e.g. "Hotel Delfino": what the trip calls the place. */
  mainText: string | null;
  secondaryText: string | null;
  /** The resolved place's full address, as the provider formats it. */
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
  kind: OriginKind;
  /** The area the place covers, when the provider knew it. */
  viewport: GeoBoundsDto | null;
  /** OSM element, e.g. `way/749057185`, when known. */
  osmId: string | null;
  /**
   * The place's Wikidata item, e.g. `Q45`; always set for a region or a
   * country (it is how they are searched), null when unknown otherwise.
   */
  wikidataId: string | null;
  /** ISO 3166-1 alpha-2 code of the country the place is in, e.g. `PT`; null when unknown. */
  countryCode: string | null;
}

/**
 * "When?": the dates as entered (`YYYY-MM-DD`, both inclusive, no time
 * zone), a number of days, or "Not sure yet".
 */
export type TripTimingDto =
  | { kind: TripTimingKind.DATES; startDate: string; endDate: string }
  | { kind: TripTimingKind.DAYS; days: number }
  | { kind: TripTimingKind.UNSURE };

/** Everything the trip form held, enough to show it again and repeat its search. */
export interface TripFormStateDto {
  origin: TripOriginDto;
  travelMode: TravelMode;
  /** In the order chosen: it decides how results interleave. */
  categories: CategoryId[];
  /** What the traveller likes, in their own words, normalized; null for none. */
  wish: string | null;
  timing: TripTimingDto;
  /**
   * The radius the search was sent with, kept so later rule changes don't
   * alter it. Null for a region or a country, searched inside its border.
   */
  searchRadiusMeters: number | null;
}

/**
 * A saved trip: a list of places with the trip form as its metadata. Its
 * `id` is the trip's, `listId` the list's; `isDefault` is always false.
 * Its places are `ListPlaceDto`s on that list.
 */
export interface TripDto extends ListDto, TripFormStateDto {
  /** The trip's own list; never shown among the user's other lists. */
  listId: string;
}

/** Body of `PATCH /trips/:tripId`: a new name, a new form (its search changed), or both. */
export interface UpdateTripRequestDto {
  name?: string;
  form?: TripFormStateDto;
}

/**
 * Body of `POST /trips`: a trip is stored when its first place is added,
 * so the form and that place come together.
 */
export interface CreateTripRequestDto {
  form: TripFormStateDto;
  place: AddListPlaceRequestDto;
}

/** Response of `POST /trips`: the new trip, named, and its first place. */
export interface CreateTripResponseDto {
  trip: TripDto;
  place: ListPlaceDto;
}

/**
 * Body of `POST /trips/from-list`: makes one of the user's own lists (not
 * Favorites) a trip with this form. The list's places and name stay; the
 * list then shows only as the trip.
 */
export interface CreateTripFromListRequestDto {
  listId: string;
  form: TripFormStateDto;
}
