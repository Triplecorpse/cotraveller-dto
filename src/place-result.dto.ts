/**
 * Provider-agnostic, normalized place result (FR-010, FR-011).
 * Maps to spec section 9, entity "PlaceResult".
 */
export interface PlaceResultDto {
  provider: string;
  providerPlaceId: string;
  name: string;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
  category: string | null;
  rating: number | null;
  userRatingsTotal: number | null;
  openingHours: Record<string, unknown> | null;
  distanceMeters: number | null;
  detailsUrl: string | null;
  attribution: string | null;
}
