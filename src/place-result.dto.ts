/**
 * Provider-agnostic, normalized place result (FR-010, FR-011). Every
 * provider returns exactly this shape, so the frontend can switch
 * providers without changing how it renders a place.
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
  distanceMeters: number | null;
  /** The place's own website, when it has one. */
  websiteUrl: string | null;
  /** Permalink to the underlying OpenStreetMap element. */
  osmUrl: string | null;
  attribution: string | null;
  /** The best available photo, or null if none was found — same as photoUrls[0]. */
  photoUrl: string | null;
  /** Every candidate photo found across sources, in preference order. */
  photoUrls: string[];
  /** Whether the place is open right now. Null when the provider has no hours data. */
  openNow: boolean | null;
  /** ISO 8601 timestamp of the next time it opens, if known. */
  nextOpenTime: string | null;
  /** ISO 8601 timestamp of the next time it closes, if known. */
  nextCloseTime: string | null;
  /** The regular weekly schedule as open/close periods. Empty when unknown. */
  openingPeriods: OpeningPeriodDto[];
  /** ISO 3166-1 alpha-2 country, e.g. "DE". Null when unknown. */
  countryCode: string | null;
  /** ISO 3166-2 subdivision (state/province), e.g. "DE-BY". Null when unknown. */
  regionCode: string | null;
  /** The provider's own map page for this place (opens the Maps app on phones), if any. */
  mapsUrl: string | null;
  /** Authors of `photoUrl` that must be credited wherever it's shown. Empty when none are required/known. */
  photoAuthors: PhotoAuthorDto[];
  /**
   * Remarks about the opening hours to show with them, e.g. "Confirmed:
   * same hours on public holidays". Only the internal provider has these;
   * null otherwise.
   */
  scheduleNotes: string | null;
  /**
   * Fuels a fuel station is known to sell. Empty when unknown or when the
   * place isn't a fuel station.
   */
  fuelTypes: FuelType[];
}

/** A fuel a station can sell: petrol, diesel, LPG (autogas) or CNG (methane). */
export type FuelType = 'petrol' | 'diesel' | 'lpg' | 'cng';

/** A point in the week: `day` 0 = Sunday … 6 = Saturday, local time of the place. */
export interface WeekTimeDto {
  day: number;
  hour: number;
  minute: number;
}

export interface OpeningPeriodDto {
  open: WeekTimeDto;
  /** Null for a place that's always open (a single period with no close). */
  close: WeekTimeDto | null;
}

export interface PhotoAuthorDto {
  displayName: string;
  /** Link to the author's profile, if any. */
  uri: string | null;
}
