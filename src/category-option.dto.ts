import { PlacesProvider } from './places-provider.enum';
import type { FuelType } from './place-result.dto';

/**
 * Controlled, per-provider mapping for a category (FR-007). Maintained in
 * application configuration, never AI-generated.
 */
export interface ProviderCategoryMapping {
  /** Free-text query, for providers that search by text (Google Text Search). */
  searchPhrase?: string;
  /** Single place type (Google's `includedType`). */
  placeType?: string;
  /** Category codes OR'd together (Geoapify Places `categories`). */
  categories?: string[];
}

/**
 * UI-facing category option with its provider-specific mappings.
 * Maps to spec section 9, entity "CategoryOption".
 */
export interface CategoryOptionDto {
  id: string;
  label: string;
  providerMappings: Partial<Record<PlacesProvider, ProviderCategoryMapping>>;
  /**
   * For a fuel-station category: the fuel a station must sell to be in it.
   * Providers search for fuel stations in general, then filter by this.
   */
  fuelType?: FuelType;
  /**
   * Whether places in this category get a generated description. Only
   * tourist places and food service do; utility stops (fuel, charging)
   * don't. Defaults to false when omitted.
   */
  describable?: boolean;
}
