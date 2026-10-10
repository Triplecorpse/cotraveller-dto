import { CategoryId } from './category-id.enum';
import { PlacesProvider } from './places-provider.enum';
import type { GeoBoundsDto } from './places-search.dto';

/** How the traveller gets around at the destination. */
export enum TravelMode {
  CAR = 'car',
  BICYCLE = 'bicycle',
  TRANSIT = 'transit',
  FOOT = 'foot',
}

/**
 * What the starting location stands for: a whole city (searched from its
 * centre) or an exact spot (an address, a hotel, the current location).
 */
export enum OriginKind {
  CITY = 'city',
  EXACT = 'exact',
}

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
  provider: PlacesProvider | null;
  /** The picked suggestion's provider id. */
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
  /** The radius the search was sent with, kept so later rule changes don't alter it. */
  searchRadiusMeters: number;
}

/** A saved trip, with the list of places picked for it. */
export interface TripDto extends TripFormStateDto {
  id: string;
  name: string;
  /** The trip's own list; never shown among the user's other lists. */
  listId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A place to save, as the client showed it: its ids and category and, for
 * an OSM-derived (Geoapify) place, a snapshot kept as a fallback. Google
 * places are kept by id only; internal ones are read from the backend's
 * own table.
 */
export interface SavePlaceRequestDto {
  provider: 'google' | 'geoapify' | 'internal';
  providerPlaceId: string;
  /** The search category it was found under. */
  category?: CategoryId | null;
  name?: string;
  formattedAddress?: string | null;
  latitude?: number;
  longitude?: number;
  /** The OSM permalink, for the OSM id (Geoapify places). */
  osmUrl?: string | null;
}

/** A place on a trip's list. */
export interface TripPlaceDto {
  /** The saved place's id: what removing it takes. */
  id: string;
  provider: string;
  providerPlaceId: string;
  createdAt: string;
}

/**
 * Body of `POST /trips`: a trip is stored when its first place is added,
 * so the form and that place come together.
 */
export interface CreateTripRequestDto {
  form: TripFormStateDto;
  place: SavePlaceRequestDto;
}

/** Response of `POST /trips`: the new trip, named, and its first place. */
export interface CreateTripResponseDto {
  trip: TripDto;
  place: TripPlaceDto;
}
