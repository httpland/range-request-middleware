// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ConditionalHeader,
  isNotEmpty,
  isNull,
  Method,
  type Middleware,
  RangeHeader,
} from "./deps.ts";
import { UnitLike, withAcceptRanges, withContentRange } from "./transform.ts";
import { BytesRange } from "./ranges/bytes.ts";
import { RangeUnit } from "./utils.ts";
import type { Range } from "./types.ts";

/** Create range request middleware.
 *
 * @example
 * ```ts
 * import { rangeRequest } from "https://deno.land/x/range_request_middleware@$VERSION/mod.ts";
 * import {
 *   assert,
 *   assertEquals,
 *   assertThrows,
 * } from "https://deno.land/std/testing/asserts.ts";
 *
 * const middleware = rangeRequest();
 * const request = new Request("test:", {
 *   headers: { range: "bytes=5-9" },
 * });
 * const response = await middleware(
 *   request,
 *   () => new Response("abcdefghijklmnopqrstuvwxyz"),
 * );
 *
 * assertEquals(response.status, 206);
 * assertEquals(response.headers.get("content-range"), "bytes 5-9/26");
 * assertEquals(response.headers.get("accept-ranges"), "bytes");
 * assertEquals(await response.text(), "fghij");
 * ```
 */
export function rangeRequest(
  ranges?: Iterable<Range>,
): Middleware {
  const $ranges = ranges ?? [new BytesRange()];
  const units = Array.from($ranges).map((range) => range.rangeUnit);
  const unitLike = isNotEmpty(units) ? units : RangeUnit.None;

  const contentRangeMiddleware = contentRange($ranges);
  const acceptRangesMiddleware = acceptRanges(unitLike);

  return (request, next) => {
    return contentRangeMiddleware(
      request,
      (request) => acceptRangesMiddleware(request, next),
    );
  };
}

export function contentRange(ranges?: Iterable<Range>): Middleware {
  const $ranges = ranges ?? [new BytesRange()];

  return async (request, next) => {
    const rangeValue = request.headers.get(RangeHeader.Range);

    // A server MUST ignore a Range header field received with a request method that is unrecognized or for which range handling is not defined. For this specification, GET is the only method for which range handling is defined.
    // @see https://www.rfc-editor.org/rfc/rfc9110#section-14.2-4
    if (
      request.method !== Method.Get ||
      isNull(rangeValue) ||
      request.headers.has(ConditionalHeader.IfRange)
    ) return next(request);

    const response = await next(request);

    return withContentRange(response, { ranges: $ranges, rangeValue });
  };
}

export function acceptRanges(unitLike?: UnitLike): Middleware {
  const rangeUnit = unitLike ?? RangeUnit.Bytes;

  return async (request, next) => {
    const response = await next(request);

    return withAcceptRanges(response, rangeUnit);
  };
}
