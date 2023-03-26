// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { type RangesSpecifier } from "./deps.ts";

/** Range API. */
export interface Range {
  /** Corresponding range unit. */
  readonly rangeUnit: string;

  /** Return response from range request context. */
  respond(
    response: Response,
    context: RangesSpecifier,
  ): Response | Promise<Response>;
}

// deno-lint-ignore ban-types
export type RangeUnit = "bytes" | "none" | string & {};
