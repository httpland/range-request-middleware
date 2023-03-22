// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { type RangeSet } from "./deps.ts";

/** Range API. */
export interface Range {
  /** Corresponding range unit. */
  readonly unit: string;

  /** Takes the context of a range request and handler response and return a partial response. */
  readonly respond: Respond;
}

export interface Respond {
  (context: RangeContext): Response | Promise<Response>;
}

/** Context of range request and response. */
export interface RangeContext {
  /** Corresponding range unit. */
  readonly rangeUnit: string;

  /** Representation of [`<range-set>`](https://www.rfc-editor.org/rfc/rfc9110#range.specifiers). */
  readonly rangeSet: RangeSet;

  /** Full response content. */
  readonly content: ArrayBuffer;

  /** Response content type. */
  readonly contentType: string;
}

// deno-lint-ignore ban-types
export type RangeUnit = "bytes" | "none" | string & {};
