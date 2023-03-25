// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export { Status } from "https://deno.land/std@0.180.0/http/http_status.ts";
export {
  isNonNegativeInteger,
  isNull,
  isNumber,
  isString,
} from "https://deno.land/x/isx@1.0.0-beta.24/mod.ts";
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
} from "https://deno.land/x/http_utils@1.0.0-beta.14/header.ts";
export { Method } from "https://deno.land/x/http_utils@1.0.0-beta.13/method.ts";
export { isErr, unsafe } from "https://deno.land/x/result_js@1.0.0/mod.ts";
export {
  type IntRange,
  isIntRange,
  isOtherRange,
  type OtherRange,
  parse,
  type Range,
  type RangeSpec,
  type RangesSpecifier,
  type SuffixRange,
} from "https://deno.land/x/range_parser@1.1.0/mod.ts";
export { concat } from "https://deno.land/std@0.180.0/bytes/concat.ts";
export { distinct } from "https://deno.land/std@0.180.0/collections/distinct.ts";
export { toHashString } from "https://deno.land/std@0.180.0/crypto/to_hash_string.ts";

export function isNotEmpty<T>(input: readonly T[]): input is [T, ...T[]] {
  return !!input.length;
}

export function not<T extends readonly unknown[]>(
  fn: (...args: T) => boolean,
): (...args: T) => boolean {
  return (...args) => !fn(...args);
}
