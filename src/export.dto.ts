/** Where an export of a list or a trip stands. */
export enum ListExportStatus {
  /** Waiting for the worker. */
  Pending = 'pending',
  /** The worker is looking up hours and writing descriptions. */
  Running = 'running',
  /** Everything is stored; the PDF can be made. */
  Done = 'done',
  /** Stopped by an error; the list can be exported again. */
  Failed = 'failed',
}

/** What `POST /exports` did. */
export enum ListExportStartOutcome {
  /** A new export was queued. */
  Started = 'started',
  /** The list (or trip) already has an export pending or running: that one is returned. */
  Running = 'running',
  /** Its places haven't changed since its last finished export: that one is returned. */
  Unchanged = 'unchanged',
}

/**
 * An export of one of the user's lists or trips: the backend fills in what
 * the PDF shows (opening hours, About texts) for the places, then the PDF
 * is made from the stored data. A trip's export is of the trip's list, so
 * `listId` and `listName` are the trip's too. Response of `GET /exports`,
 * `GET /exports/:exportId`.
 */
export interface ListExportDto {
  id: string;
  /** The exported list (a trip's own list for a trip); null once it was removed. */
  listId: string | null;
  /**
   * The exported trip; null for one of the user's lists. Kept after the
   * trip is removed (then `listId` is null), to tell the two apart.
   */
  tripId: string | null;
  /** The list's (or trip's) name when it was exported. */
  listName: string;
  status: ListExportStatus;
  /** Places on the list when the export ran; null until it starts. */
  placeCount: number | null;
  /** Places prepared so far: progress while it runs. */
  placesDone: number;
  /** Places whose hours were looked up for it. */
  hoursLookedUp: number;
  /** About texts written for it (the rest were stored already, or couldn't be written). */
  descriptionsWritten: number;
  /** The list's last change this export covers; set when it is done. */
  listUpdatedAt: string | null;
  /** Why it failed. */
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}

/** Body of `POST /exports`. */
export interface StartListExportRequestDto {
  /** One of the user's own lists, or a trip's list (`TripDto.listId`) to export the trip. */
  listId: string;
}

/** Response of `POST /exports`. */
export interface StartListExportResponseDto {
  outcome: ListExportStartOutcome;
  export: ListExportDto;
}
