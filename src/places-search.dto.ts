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
  /** Sorted by distance from the origin. */
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

/** A chosen starting location, from `GET /places/:provider/resolve/:placeId`. */
export interface ResolvedPlaceDto {
  placeId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}
