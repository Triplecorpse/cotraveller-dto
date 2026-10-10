import type { CategoryId } from './category-id.enum';
import { PlacesProvider } from './places-provider.enum';
import type { FuelType } from './place-result.dto';

/**
 * Controlled, per-provider mapping for a category (FR-007). Maintained in
 * application configuration, never AI-generated.
 */
export interface ProviderCategoryMapping {
  /**
   * Category codes OR'd together: Geoapify Places `categories`, or OSM
   * tags (`key=value`) for the background import's Overpass queries.
   */
  categories?: string[];
}

/**
 * How a category's search results are ordered: by how notable a place is
 * (the provider's relevance, e.g. for sights worth a trip) or by distance
 * (for the nearest of something, e.g. a café or a fuel station).
 */
export type CategoryRanking = 'relevance' | 'distance';

/**
 * UI-facing category option with its provider-specific mappings.
 * Maps to spec section 9, entity "CategoryOption".
 */
export interface CategoryOptionDto {
  id: CategoryId;
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
  /**
   * How search results in this category are ordered. Defaults to
   * `distance` when omitted. Providers without a relevance order (Geoapify)
   * always sort by distance.
   */
  ranking?: CategoryRanking;
}
