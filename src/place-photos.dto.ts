import type { PhotoAuthorDto } from './place-result.dto';

/** `POST /places/photos`: the places whose photos a page is waiting for. */
export interface PlacePhotosRequestDto {
  /** Geoapify place ids (`PlaceResultDto.providerPlaceId`) with `photosPending`; at most 20. */
  placeIds: string[];
}

/** A place's photos, as the photo fields of `PlaceResultDto` carry them. */
export interface PlacePhotosDto {
  /** The best photo, or null when none was found: same as `photoUrls[0]`. */
  photoUrl: string | null;
  /** Every photo found, in preference order. */
  photoUrls: string[];
  /** Who must be credited wherever `photoUrl` is shown. */
  photoAuthors: PhotoAuthorDto[];
}

/** The answer to `POST /places/photos`: every place asked for, by its id. */
export interface PlacePhotosResponseDto {
  photos: Record<string, PlacePhotosDto>;
}
