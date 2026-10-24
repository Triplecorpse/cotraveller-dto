/**
 * Where a schedule's opening hours were read from: the Postgres enum
 * `schedule_source` in cotraveller-back. The same for every kind of
 * schedule (a place's, a car park's).
 */
export enum ScheduleSource {
  /** The venue's website, from its schema.org JSON-LD. */
  WEBSITE_JSONLD = 'website-jsonld',
  /** The venue's website, read by a model. */
  WEBSITE_AI = 'website-ai',
  /** OpenStreetMap's `opening_hours` tag. */
  OSM = 'osm',
  /** A reliable page found by searching the web, not the venue's own. */
  WEB_SEARCH = 'web-search',
}
