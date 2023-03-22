// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export { rangeRequest } from "./middleware.ts";
export {
  type Handler,
  type IntRange,
  type Middleware,
  type OtherRange,
  type RangeSet,
  type RangeSpec,
  type SuffixRange,
} from "./deps.ts";
export {
  type BytesContext,
  BytesRange,
  type ComputeBoundary,
} from "./ranges/bytes.ts";
export type { Range, RangeContext, Respond } from "./types.ts";
