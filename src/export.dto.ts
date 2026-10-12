/** Where an export of a list stands. */
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
  /** The list already has an export pending or running: that one is returned. */
  Running = 'running',
  /** The list hasn't changed since its last finished export: that one is returned. */
  Unchanged = 'unchanged',
}

/**
 * An export of one of the user's lists: the backend fills in what the PDF
 * shows (opening hours, About texts) for the list's places, then the PDF
 * is made from the stored data. Response of `GET /exports`,
 * `GET /exports/:exportId`.
 */
export interface ListExportDto {
  id: string;
  /** The exported list; null once that list was removed. */
  listId: string | null;
  /** The list's name when it was exported. */
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
  listId: string;
}

/** Response of `POST /exports`. */
export interface StartListExportResponseDto {
  outcome: ListExportStartOutcome;
  export: ListExportDto;
}
