/**
 * Sources of places data. Places come from OpenStreetMap: `GEOAPIFY` for
 * search and `OSM` for the background import's category tags. The other
 * values stay because stored rows (and the database's `places_provider`
 * type) may still hold them.
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
