import { PlacesProvider } from './places-provider.enum';

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
}
