/** An outside service the app depends on, as the admin's Services tab lists it. */
export enum ServiceId {
  /** Claude: wishes, trip names, About texts, opening hours, visit durations, web search. */
  ANTHROPIC = 'anthropic',
  /** Places search and details, routing, car parks. */
  GEOAPIFY = 'geoapify',
  /** OpenStreetMap data for the places mirror and car parks. */
  OVERPASS = 'overpass',
  /** Wikidata's SPARQL service: places ranked by relevance. */
  WIKIDATA = 'wikidata',
  /** Wikimedia Commons photos, Wikipedia extracts and page views. */
  WIKIMEDIA = 'wikimedia',
  /** Google Places: the ids that open a place's Google Maps card. */
  GOOGLE_PLACES = 'google-places',
  /** Amazon SES: the emails that say an export is ready. */
  SES = 'ses',
  /** Amazon Cognito: sign-in and the admin's user list. */
  COGNITO = 'cognito',
  /** The backend's Postgres database. */
  POSTGRES = 'postgres',
  /** The backend's Redis: searches kept for "load more". */
  REDIS = 'redis',
  /** cotraveller-back as the front's server reaches it. */
  BACKEND = 'backend',
  /** MapTiler: the maps' style and tiles. */
  MAPTILER = 'maptiler',
  /** Nager.Date: public holidays on trip pages and in PDFs. */
  NAGER_DATE = 'nager-date',
}

/** How a service is doing, worst last. */
export enum ServiceHealth {
  /** Not set up here (no key): nothing to check. */
  OFF = 'off',
  /** Working. */
  OK = 'ok',
  /** Working, but something needs a look: errors, or a limit coming close. */
  WARNING = 'warning',
  /** Calls fail now. */
  FAILING = 'failing',
}

/** A limit a service is used against: our own daily cap or the provider's. */
export interface ServiceLimitDto {
  /** What is limited, e.g. "Wishes today (everyone)" or "Emails in 24 hours". */
  name: string;
  used: number;
  /** Null when the provider sets no limit (e.g. SES out of the sandbox with -1). */
  limit: number | null;
  /** What `used` counts: "calls", "emails", "USD", "credits"… */
  unit: string;
  /** When it starts again (ISO date-time); null when unknown or rolling. */
  resetsAt: string | null;
  /** `used / limit`, 0–1+; null without a limit. */
  ratio: number | null;
}

/** The last call that failed. */
export interface ServiceFailureDto {
  /** ISO date-time. */
  at: string;
  /** The provider's HTTP status; null for a timeout or no answer. */
  httpStatus: number | null;
  /** The provider's own words, trimmed, keys removed. */
  message: string;
  /** What the call was for, e.g. "ingest", "wish"; null when there is one use. */
  purpose: string | null;
}

/** One table of a provider's numbers, e.g. cost per workspace or rate limits per model. */
export interface ServiceTableDto {
  title: string;
  columns: string[];
  rows: string[][];
}

/** One service: how it is doing and everything known about it. */
export interface ServiceStatusDto {
  id: ServiceId;
  /** Its name to show, e.g. "Anthropic (Claude)". */
  name: string;
  /** What the app uses it for, in a few words. */
  usedFor: string;
  health: ServiceHealth;
  /** Why it isn't ok, one short sentence each; empty when ok. */
  reasons: string[];
  /** The last call that worked (ISO date-time); null when none is known. */
  lastOkAt: string | null;
  lastFailure: ServiceFailureDto | null;
  /** Our calls since midnight UTC; null when we don't call it ourselves. */
  today: { calls: number; failures: number } | null;
  /** The last minutes' calls; null when there were none. */
  recent: { sampleCount: number; errorRate: number; averageLatencyMs: number } | null;
  limits: ServiceLimitDto[];
  /** Single facts from the provider or a check, e.g. "Sending: enabled". */
  facts: { label: string; value: string }[];
  tables: ServiceTableDto[];
  /** When the service itself was last asked (ISO date-time); null when it isn't asked. */
  probedAt: string | null;
}

/** `GET /admin/services`: every outside service, failing ones first. */
export interface ServicesStatusDto {
  /** ISO date-time. */
  checkedAt: string;
  services: ServiceStatusDto[];
}
