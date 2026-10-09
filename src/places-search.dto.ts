import { PlaceResultDto } from './place-result.dto';

/**
 * Body of `POST /places/:provider/search` (FR-004, FR-005). The same
 * request works for every provider.
 */
export interface PlacesSearchRequestDto {
  originLatitude: number;
  originLongitude: number;
  radiusMeters: number;
  /** Category ids from `CategoryOptionDto.id`. */
  categories: string[];
  /**
   * `nextPageToken` from the previous page, to load more; omitted for a
   * fresh search.
   */
  pageToken?: string | null;
}

/** Response of `POST /places/:provider/search`. */
export interface PlacesSearchPageDto {
  /**
   * Sorted by distance from the origin when every requested category ranks
   * by distance; otherwise each category's places in their own order (see
   * `CategoryOptionDto.ranking`), taken in turns.
   */
  results: PlaceResultDto[];
  /**
   * Opaque token for the next page — send it back as `pageToken`. Null when
   * there is nothing more to fetch.
   */
  nextPageToken: string | null;
}

/** One starting-location suggestion from `GET /places/:provider/autocomplete`. */
export interface PlaceSuggestionDto {
  placeId: string;
  mainText: string;
  secondaryText: string | null;
}

/**
 * What a resolved location stands for: a whole `area` (a city, district,
 * region or country, where the coordinates are only its centre) or an
 * `exact` spot (an address, a hotel or any other single place).
 */
export type ResolvedPlaceKind = 'area' | 'exact';

/** A latitude/longitude box, in degrees. */
export interface GeoBoundsDto {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** A chosen starting location, from `GET /places/:provider/resolve/:placeId`. */
export interface ResolvedPlaceDto {
  placeId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  kind: ResolvedPlaceKind;
  /** The area the location covers, when the provider knows it. */
  viewport: GeoBoundsDto | null;
}
