import type { PublicHolidayHours } from './public-holiday-hours.enum';

/** The kinds of place data an admin reviews: the Postgres enum `extraction_data_type`. */
export enum ExtractionDataType {
  OPENING_HOURS = 'opening_hours',
  CLOSURE_STATUS = 'closure_status',
  VISIT_DURATION = 'visit_duration',
}

/** Where a record stands: the Postgres enum `extraction_status`. */
export enum ExtractionStatus {
  /** Read by the pipeline and published. */
  AI_EXTRACTED = 'ai_extracted',
  /** An admin confirmed the value as it was. */
  HUMAN_VERIFIED = 'human_verified',
  /** An admin set the value. */
  HUMAN_OVERRIDDEN = 'human_overridden',
  /** Waits for an admin: failed a check, or its source changed under a human value. */
  NEEDS_REVIEW = 'needs_review',
  /** The source couldn't be read (fetch failed, timeout, model not asked). No value. */
  SOURCE_UNAVAILABLE = 'source_unavailable',
  /** The source was read and doesn't state it. No value. */
  NOT_FOUND = 'not_found',
}

/** How a value was obtained: the Postgres enum `extraction_method`. */
export enum ExtractionMethod {
  /** A model read it from a page. */
  AI = 'ai',
  /** The page's schema.org data. */
  JSONLD = 'jsonld',
  /** OpenStreetMap's tags. */
  OSM = 'osm',
  /** Our own default by category and size. */
  DEFAULT = 'default',
  /** The site answered 404/410 or its domain is gone. */
  HTTP = 'http',
  /** An admin entered it. */
  MANUAL = 'manual',
}

/** What an admin did: the Postgres enum `correction_action`. */
export enum CorrectionAction {
  CONFIRMED = 'confirmed',
  OVERRIDDEN = 'overridden',
  NEEDS_REVIEW = 'needs_review',
  /** A value entered where none existed. */
  MANUAL = 'manual',
}

/**
 * Why a value was wrong: the Postgres enum `correction_error_category`. A
 * new one is a new member here and an `ALTER TYPE … ADD VALUE` migration in
 * cotraveller-back.
 */
export enum CorrectionErrorCategory {
  SEASONAL_HOURS = 'seasonal_hours',
  HOLIDAY_EXCEPTION = 'holiday_exception',
  /** 12h/24h, locale. */
  TIME_FORMAT = 'time_format',
  WRONG_DAY_MAPPING = 'wrong_day_mapping',
  OUTDATED_SOURCE = 'outdated_source',
  WRONG_SOURCE_PAGE = 'wrong_source_page',
  MISSING_INTERVAL = 'missing_interval',
  HALLUCINATED_VALUE = 'hallucinated_value',
  CLOSURE_MISREAD = 'closure_misread',
  DURATION_UNREALISTIC = 'duration_unrealistic',
  OTHER = 'other',
}

/** One opening of a channel, as cotraveller-back's `ScheduleSlot`. */
export interface HoursSlotValue {
  /** RFC 5545 RRULE without DTSTART, UNTIL or COUNT, e.g. `FREQ=WEEKLY;BYDAY=MO,TU`. */
  rrule: string;
  /** The day the rule counts from, for a rhythm like every other day; else null. */
  anchor: string | null;
  /** `HH:MM`, local time. */
  opensAt: string;
  /** Past midnight when it runs that long. */
  durationMinutes: number;
  label: string | null;
}

/**
 * A period of the year, `[from, until)`; `until` null for no known end. A
 * season with no channels is closed; days no season covers are unknown.
 */
export interface HoursSeasonValue {
  name: string | null;
  from: string;
  until: string | null;
  sourceNote: string | null;
  channels: { channel: string; slots: HoursSlotValue[] }[];
}

/** Days whose hours replace the regular ones; no slots means closed. */
export interface HoursExceptionValue {
  /** The one channel it is for; null for every channel. */
  channel: string | null;
  from: string;
  until: string | null;
  rrule: string | null;
  anchor: string | null;
  priority: number;
  reason: string | null;
  slots: { opensAt: string; durationMinutes: number }[];
}

/** A place's opening hours as a record stores them (cotraveller-back's `ScheduleRules` with its remarks). */
export interface OpeningHoursValue {
  seasons: HoursSeasonValue[];
  exceptions: HoursExceptionValue[];
  notes: string | null;
  publicHolidays: PublicHolidayHours | null;
  publicHolidaysQuote: string | null;
}

/** Whether a place is open for business. */
export type ClosureState = 'open' | 'temporarily_closed' | 'permanently_closed' | 'unknown';

/** A place's closure status as a record stores it. */
export interface ClosureStatusValue {
  status: ClosureState;
  /** The last closed date is the day before; null when none is given. */
  reopeningDate: string | null;
  reason: string | null;
  /** Set when `status` is `unknown` because the site answered this way: null for a domain gone. */
  websiteGone?: { httpStatus: number | null };
}

/** How long a visit takes, as a record stores it. */
export interface VisitDurationValue {
  minMinutes: number | null;
  typicalMinutes: number;
  maxMinutes: number | null;
  /** What the length is of, when a page stated it: the venue, or only its guided tour. */
  statedFor?: 'visit' | 'tour' | null;
}

/** Any record's value. */
export type ExtractionValue = OpeningHoursValue | ClosureStatusValue | VisitDurationValue;

/** A deterministic check's result on a record. */
export interface ExtractionCheck {
  /** The check's name, e.g. `quote_not_in_source`. */
  rule: string;
  /** `fail` keeps the value from being published; `flag` only marks it. */
  severity: 'fail' | 'flag';
  detail: string | null;
}
