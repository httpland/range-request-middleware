// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { type RangesSpecifier } from "./deps.ts";

/** Range API. */
export interface Range {
  /** Corresponding range unit. */
  readonly rangeUnit: string;

  /** Takes the context of a range request and handler response and return a partial response. */
  respond(context: RangeContext): Response | Promise<Response>;
}

/** Context of range request and response. */
export interface RangeContext extends RangesSpecifier {
  /** Full response content. */
  readonly content: ArrayBuffer;

  /** Response content type. */
  readonly contentType: string;
}

// deno-lint-ignore ban-types
export type RangeUnit = "bytes" | "none" | string & {};
