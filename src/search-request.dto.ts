import { PlacesProvider } from './places-provider.enum';

/**
 * Validated, structured search request built from user input (FR-004, FR-005).
 * Maps to spec section 9, entity "SearchRequest".
 */
export interface SearchRequestDto {
  originText: string;
  originLatitude: number;
  originLongitude: number;
  originPlaceId: string | null;
  category: string;
  searchArea: string | null;
  radiusMeters: number | null;
  resultLimit: number;
  provider: PlacesProvider;
  requestId: string;
}
