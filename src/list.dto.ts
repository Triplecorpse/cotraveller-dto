import type { CategoryId } from './category-id.enum';

/**
 * One of the user's lists of places: Favorites (`isDefault`), their own,
 * or a trip's (a trip is a list with the trip form as its metadata; see
 * `TripDto`). Response of `GET /lists`, `GET|POST|PATCH /lists/:listId`.
 */
export interface ListDto {
  id: string;
  name: string;
  /** The Favorites list: the one the star saves to; it can't be removed. Never a trip's. */
  isDefault: boolean;
  /** How many places are on it. */
  placeCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Body of `POST /lists` and `PATCH /lists/:listId`. */
export interface ListNameRequestDto {
  name: string;
}

/** What was kept of a place when it was added (OSM data), shown when it can't be looked up. */
export interface ListPlaceSnapshotDto {
  name: string | null;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  category: CategoryId | null;
}

/**
 * A place on a list, a trip's included. Response of
 * `GET|POST /lists/:listId/places`, `GET|POST /trips/:tripId/places` and
 * `GET /lists/places` (every place on the user's own lists).
 */
export interface ListPlaceDto {
  /** What moving or removing it takes. */
  id: string;
  listId: string;
  /** The Geoapify place id: what the place is looked up by. */
  providerPlaceId: string;
  /** Google `place_id`, when known. */
  googleId: string | null;
  /** OSM element, e.g. `node/123`, when known. */
  osmId: string | null;
  snapshot: ListPlaceSnapshotDto;
  /** When it was added. */
  createdAt: string;
  updatedAt: string;
}

/**
 * A place to add to a list (or a trip), as the client showed it: its
 * Geoapify id, category, and a snapshot (OSM data) kept as a fallback for
 * when it can't be looked up. Body of `POST /lists/:listId/places` and
 * `POST /trips/:tripId/places`.
 */
export interface AddListPlaceRequestDto {
  providerPlaceId: string;
  /** The search category it was found under. */
  category?: CategoryId | null;
  name?: string;
  formattedAddress?: string | null;
  latitude?: number;
  longitude?: number;
  /** The OSM permalink, for the OSM id. */
  osmUrl?: string | null;
}

/** Body of `PATCH /lists/:listId/places/:placeId`: moves the place to another of the user's lists. */
export interface MoveListPlaceRequestDto {
  listId: string;
}
