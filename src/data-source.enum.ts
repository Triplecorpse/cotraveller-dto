/**
 * Where a piece of a place's data came from. One list for every table
 * that records a source (names, elevation, websites, …): the Postgres
 * enum `data_source`. A new source is a new member here and an
 * `ALTER TYPE … ADD VALUE` migration in cotraveller-back.
 */
export enum DataSource {
  /** OpenStreetMap, read through Overpass or Geoapify's copy of its tags. */
  OSM = 'osm',
  GEOAPIFY = 'geoapify',
  WIKIDATA = 'wikidata',
  WIKIPEDIA = 'wikipedia',
  /** Open-Meteo's elevation API (Copernicus DEM, about 90 m). */
  OPEN_METEO = 'open_meteo',
  /** The venue's own website. */
  WEBSITE = 'website',
  /** A page found by searching the web. */
  WEB_SEARCH = 'web_search',
  /** Made up by cotraveller itself, e.g. an unnamed car park's name. */
  COTRAVELLER = 'cotraveller',
}
