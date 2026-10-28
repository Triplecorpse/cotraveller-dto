/**
 * What kind of way in a place's entrance is, from OSM: the Postgres enum
 * `place_entrance_kind` in cotraveller-back. The trip builder walks to the
 * main entrance when one is mapped, else to the nearest entrance, else
 * to the nearest gate.
 */
export enum PlaceEntranceKind {
  /** `entrance=main`. */
  MAIN = 'main',
  /** Another `entrance=*` visitors may use (not an exit, emergency or service door). */
  ENTRANCE = 'entrance',
  /** A gate or turnstile on the place's outline (`barrier=gate`, …) that isn't private. */
  GATE = 'gate',
}
