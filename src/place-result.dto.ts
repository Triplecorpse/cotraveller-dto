import type { CategoryId } from './category-id.enum';

/**
 * A place as the app shows it (FR-010, FR-011), from OpenStreetMap data
 * (Geoapify and our own mirror of it).
 * Maps to spec section 9, entity "PlaceResult".
 */
export interface PlaceResultDto {
  /** The Geoapify place id: what the place is looked up and saved by. */
  providerPlaceId: string;
  /** The name to show: in the content language asked for (`CONTENT_LANGUAGE_HEADER`) when known, else the native one. */
  name: string;
  /**
   * The name as it's signposted where the place is, in its own language
   * (e.g. "Castelul Peleș"), to show under `name`. Null when it's the
   * same as `name` or unknown.
   */
  nativeName: string | null;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
  category: CategoryId | null;
  /**
   * How popular the place is, 1–5 stars (`popularityStars`), from how much
   * Wikipedia covers and reads it (cotraveller-back's `places.score`).
   * Null when unknown: not yet worked out, or the place isn't stored.
   */
  popularity: number | null;
  distanceMeters: number | null;
  /** The place's own website, when it has one. */
  websiteUrl: string | null;
  /** Permalink to the underlying OpenStreetMap element. */
  osmUrl: string | null;
  /** The data's credit line (OpenStreetMap's licence asks for it), to show with the place. */
  attribution: string | null;
  /** The best available photo, or null if none was found — same as photoUrls[0]. */
  photoUrl: string | null;
  /** Every candidate photo found across sources, in preference order. */
  photoUrls: string[];
  /**
   * True when the photos are still being looked up: `photoUrl`,
   * `photoUrls`, `photoAuthors` and `photoCredits` are empty for now, and
   * `POST /places/photos` gives them. False or missing: they are final.
   */
  photosPending?: boolean;
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
  /** Authors of `photoUrl` that must be credited wherever it's shown. Empty when none are required/known. */
  photoAuthors: PhotoAuthorDto[];
  /**
   * The credit each photo's license asks for, one per `photoUrls` entry in
   * the same order: who made it, the license, and the file's page. Every
   * photo is a Wikimedia Commons file whose license allows commercial use.
   */
  photoCredits: PhotoCreditDto[];
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
  /**
   * Where the place is, as a traveller would say it: the town it's in, or
   * the nearest notable towns. Null when no town is near; missing from
   * places saved or cached before it existed.
   */
  locality?: PlaceLocalityDto | null;
  /**
   * How big the place is, for a category where size matters (a
   * playground): from its outline on OpenStreetMap and what is known
   * about it. Null or missing when unknown or not such a category.
   */
  size?: PlaceSize | null;
  /**
   * Google's `place_id` for the place, when it was matched (cotraveller-back
   * looks it up in the background after a search), so a Google Maps link
   * opens the place's own card. Null or missing when not matched (yet):
   * link to its coordinates instead.
   */
  googleId?: string | null;
}

/**
 * A place's size among its kind, e.g. a courtyard sandbox (`small`) or an
 * adventure playground (`large`).
 */
export enum PlaceSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/** The town a place is in, or the towns it is near, and its country. */
export interface PlaceLocalityDto {
  /** `in`: the place is in `cities[0]`. `near`: it's in none; these are the nearest notable ones. */
  kind: 'in' | 'near';
  cities: string[];
  /** The country's English name. */
  country: string | null;
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

/**
 * How a photo must be credited wherever it is shown (the card, the PDF):
 * "© author · license", linking to the file's page. A public domain photo
 * needs no credit but is still named, so its source stays traceable.
 */
export interface PhotoCreditDto {
  /** Who made the photo, as Commons names them; null when unknown (public domain). */
  author: string | null;
  /** The author's page, if Commons gives one. */
  authorUri: string | null;
  /** The license's short name, e.g. "CC BY-SA 4.0", "CC0", "Public domain". */
  license: string;
  /** The license's text, if it has one (CC licenses do). */
  licenseUrl: string | null;
  /** The file's page on Wikimedia Commons: where the photo and its terms are. */
  sourceUrl: string;
}

/**
 * The scores (cotraveller-back's `placeScore`: log10 of the monthly
 * Wikipedia reads plus twice log10 of the editions) at which a place
 * earns 2, 3, 4 and 5 stars. Fixed, the same worldwide: a village
 * chapel with one article scores about 3 (1 star), a town museum with
 * ten editions about 5.6 (3), a major sight about 8 (5), the Eiffel
 * Tower 9.9.
 */
export const POPULARITY_STAR_SCORES: readonly number[] = [3.5, 5, 6.5, 8];

/** A score as 1–5 stars (`POPULARITY_STAR_SCORES`); null for no score. */
export function popularityStars(score: number | null | undefined): number | null {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return null;
  }
  return 1 + POPULARITY_STAR_SCORES.filter((threshold) => score >= threshold).length;
}
