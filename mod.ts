// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export { rangeRequest } from "./middleware.ts";
export {
  type Handler,
  type IntRange,
  type Middleware,
  type OtherRange,
  type RangeSpec,
  type RangesSpecifier,
  type SuffixRange,
} from "./deps.ts";
export {
  type BytesContext,
  BytesRange,
  type ComputeBoundary,
} from "./ranges/bytes.ts";
export type { Range, RangeContext } from "./types.ts";
