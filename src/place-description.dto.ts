/** One paragraph of a place description and the web page it is based on. */
export interface PlaceDescriptionParagraphDto {
  text: string;
  /** URL of the page the paragraph is based on. */
  source: string;
}

/**
 * Stored, AI-written description of a place, keyed by Google place id.
 * Response of `GET /descriptions/:placeId`.
 */
export interface PlaceDescriptionDto {
  placeId: string;
  /** BCP 47 language tag; currently always `en`. */
  language: string;
  /** All paragraphs joined with blank lines, ready to display. */
  description: string;
  /** Paragraphs in display order, each with its source. */
  paragraphs: PlaceDescriptionParagraphDto[];
  /** Unique source URLs in paragraph order, for an attribution list. */
  sources: string[];
  /** True when this request generated the description; false when it was already stored. */
  generated: boolean;
}
