/**
 * What a name of a place is: the Postgres enum `name_kind`, used with a
 * 2-letter language (ISO 639-1) wherever names are stored.
 */
export enum NameKind {
  /** The name as it's signposted where the place is (OSM `name`). */
  NATIVE = 'native',
  /** What the place is usually called in a language (OSM `name:xx`, Wikidata's label). */
  COMMON = 'common',
  /** Its official name (OSM `official_name`). */
  OFFICIAL = 'official',
  /** Another name people use (OSM `alt_name`, Wikidata's aliases). */
  ALTERNATIVE = 'alternative',
  /** A short form (OSM `short_name`). */
  SHORT = 'short',
  /** An international name with no one language (OSM `int_name`). */
  INTERNATIONAL = 'international',
}
