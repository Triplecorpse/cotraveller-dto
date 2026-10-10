/**
 * Every category id (FR-007). The catalog (`CategoryOptionDto`, configured
 * by `CATEGORY_MAPPING`) may offer only some of them; stored rows and saved
 * trips keep the id they were made with, so a value is never removed —
 * a category taken out of the catalog stays here.
 */
export enum CategoryId {
  MUSEUM = 'museum',
  ART_GALLERY = 'art_gallery',
  TOURIST_ATTRACTION = 'tourist_attraction',
  HISTORICAL_LANDMARK = 'historical_landmark',
  CASTLE = 'castle',
  RELIGIOUS_SITE = 'religious_site',
  PARK = 'park',
  BEACH = 'beach',
  VIEWPOINT = 'viewpoint',
  HIKING = 'hiking',
  NATURE_RESERVE = 'nature_reserve',
  CAVE = 'cave',
  ZOO_AQUARIUM = 'zoo_aquarium',
  THEME_PARK = 'theme_park',
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  PETROL_STATION = 'petrol_station',
  DIESEL_STATION = 'diesel_station',
  LPG_STATION = 'lpg_station',
  CNG_STATION = 'cng_station',
  EV_CHARGING = 'ev_charging',
  PARKING = 'parking',
  /**
   * Internal places' category for every fuel station, whichever fuel
   * category found it. Storage only: never in the catalog, never
   * requested or returned.
   */
  FUEL_STATION = 'fuel_station',
}
