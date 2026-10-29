/**
 * What a place's hours source says about public holidays: the Postgres
 * enum `schedule_public_holidays` in cotraveller-back. Unknown is null:
 * the source says nothing, so the hours may differ on a holiday.
 */
export enum PublicHolidayHours {
  /** Open on public holidays, e.g. "open 365 days a year". */
  OPEN = 'open',
  /** Closed on public holidays. */
  CLOSED = 'closed',
  /** Open on some holidays and closed, or with other hours, on others. */
  VARIES = 'varies',
}
