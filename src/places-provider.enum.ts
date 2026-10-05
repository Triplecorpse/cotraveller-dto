/**
 * Supported places providers. Keep provider-neutral per NFR-008.
 */
export enum PlacesProvider {
  GOOGLE = 'google',
  GEOAPIFY = 'geoapify',
  HERE = 'here',
  MAPBOX = 'mapbox',
  OSM = 'osm',
  /** cotraveller's own curated places, stored in its database. */
  INTERNAL = 'internal',
}
