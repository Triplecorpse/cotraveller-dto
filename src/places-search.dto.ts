import type { CategoryId } from './category-id.enum';
import { PlaceResultDto } from './place-result.dto';
import type { AreaOriginKind, OriginKind } from './trip.dto';

/**
 * A region or a country to search inside, by relevance: its notable
 * places (Wikidata items in it, most covered by Wikipedia first), never
 * anything across its border.
 */
export interface SearchAreaDto {
  kind: AreaOriginKind;
  /** The area's Geoapify place id, as resolved. */
  placeId: string;
  /** The area's Wikidata item, e.g. `Q45` for Portugal: what its places are found by. */
  wikidataId: string;
  /** ISO 3166-1 alpha-2 code of the country it is or is in, e.g. `PT`: no result is outside it. */
  countryCode: string;
}

/**
 * Body of `POST /places/search` (FR-004, FR-005): either within
 * `radiusMeters` of the origin, or inside `area`.
 */
export interface PlacesSearchRequestDto {
  /** The origin; for an `area`, its centre (kept for distances on the cards). */
  originLatitude: number;
  originLongitude: number;
  /** How far from the origin to search; required without `area`, ignored with it. */
  radiusMeters?: number | null;
  /** A region or a country to search inside instead of a radius. */
  area?: SearchAreaDto | null;
  /** Category ids from `CategoryOptionDto.id`. */
  categories: CategoryId[];
  /**
   * `nextPageToken` from the previous page, to load more; omitted for a
   * fresh search.
   */
  pageToken?: string | null;
}

/** Response of `POST /places/search`. */
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

/** One starting-location suggestion from `GET /places/autocomplete`. */
export interface PlaceSuggestionDto {
  placeId: string;
  mainText: string;
  secondaryText: string | null;
}

/** A latitude/longitude box, in degrees. */
export interface GeoBoundsDto {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** A chosen starting location, from `GET /places/resolve/:placeId`. */
export interface ResolvedPlaceDto {
  placeId: string;
  formattedAddress: string;
  /** For a city, region or country, only its centre. */
  latitude: number;
  longitude: number;
  /**
   * What the location stands for. `region` (a state, province or county)
   * and `country` only when `wikidataId` and `countryCode` are known, as
   * their search needs both; otherwise such an area is a `city`.
   */
  kind: OriginKind;
  /** The area the location covers, when the provider knows it. */
  viewport: GeoBoundsDto | null;
  /** OSM element, e.g. `way/749057185`, when the provider knows it. */
  osmId?: string | null;
  /** The location's Wikidata item, e.g. `Q45`; null when unknown. */
  wikidataId: string | null;
  /** ISO 3166-1 alpha-2 code of the country it is or is in, e.g. `PT`; null when unknown. */
  countryCode: string | null;
}
