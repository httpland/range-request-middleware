import { type RangeSet } from "./deps.ts";

export interface Range {
  /** Representation of [`<range-unit>`](). */
  readonly unit: string;

  readonly respond: Respond;
}

export interface Respond {
  (context: RangeContext): Response | Promise<Response>;
}

export interface RangeContext {
  readonly rangeUnit: string;
  readonly rangeSet: RangeSet;
  readonly content: ArrayBuffer;
  readonly contentType: string;
}

// deno-lint-ignore ban-types
export type RangeUnit = "bytes" | "none" | string & {};
