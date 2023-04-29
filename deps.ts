// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export { Status } from "https://deno.land/std@0.185.0/http/http_status.ts";
export { isString } from "https://deno.land/x/isx@1.3.1/is_string.ts";
export { isNull } from "https://deno.land/x/isx@1.3.1/is_null.ts";
export { isNumber } from "https://deno.land/x/isx@1.3.1/is_number.ts";
export { isNotEmpty } from "https://deno.land/x/isx@1.3.1/iterable/is_not_empty.ts";
export {
  type Handler,
  type Middleware,
} from "https://deno.land/x/http_middleware@1.0.0/mod.ts";
export {
  ConditionalHeader,
  filterKeys,
  isRepresentationHeader,
  RangeHeader,
  RepresentationHeader,
} from "https://deno.land/x/http_utils@1.2.0/header.ts";
export { Method } from "https://deno.land/x/http_utils@1.2.0/method.ts";
export { isErr, unsafe } from "https://deno.land/x/result_js@1.0.0/mod.ts";
export {
  type IntRange,
  isIntRange,
  isOtherRange,
  type OtherRange,
  parseRange,
  type Range,
  type RangeSet,
  type RangeSpec,
  type RangesSpecifier,
  type SuffixRange,
} from "https://deno.land/x/range_parser@1.2.0/mod.ts";
export {
  parseAcceptRanges,
  type Token,
} from "https://deno.land/x/accept_ranges_parser@1.0.1/mod.ts";
export { concat } from "https://deno.land/std@0.185.0/bytes/concat.ts";
export { distinct } from "https://deno.land/std@0.185.0/collections/distinct.ts";
export { toHashString } from "https://deno.land/std@0.185.0/crypto/to_hash_string.ts";
export {
  type ContentRange,
  type InclRange,
  stringifyContentRange,
} from "https://deno.land/x/content_range_parser@1.0.0/mod.ts";

export function not<T extends readonly unknown[]>(
  fn: (...args: T) => boolean,
): (...args: T) => boolean {
  return (...args) => !fn(...args);
}
