import { PlacesProvider } from './places-provider.enum';

/**
 * Controlled, per-provider mapping for a category (FR-007). Maintained in
 * application configuration, never AI-generated.
 */
export interface ProviderCategoryMapping {
  searchPhrase?: string;
  placeType?: string;
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
