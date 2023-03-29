// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  type InclRange,
  type IntRange,
  isIntRange,
  isNotEmpty,
  isNull,
  isNumber,
  isOtherRange,
  RangeHeader,
  type RangeSpec,
  RangesSpecifier,
  RepresentationHeader,
  Status,
  stringifyContentRange,
  type SuffixRange,
  toHashString,
} from "../deps.ts";
import type { Range } from "../types.ts";
import {
  RangeUnit,
  RequestedRangeNotSatisfiableResponse,
  shallowMergeHeaders,
} from "../utils.ts";
import { multipartByteranges } from "./utils.ts";

/** Context for bytes range. */
export interface BytesContext {
  /** Boundary delimiter computation function. */
  readonly computeBoundary: ComputeBoundary;
}

/** Boundary delimiter computation API. */
export interface ComputeBoundary {
  (content: ArrayBuffer): string | Promise<string>;
}

/** {@link Range} implementation for `bytes` range unit.
 * It support single and multiple range request.
 * @see https://www.rfc-editor.org/rfc/rfc9110#section-14.1.2
 *
 * @example
 * ```ts
 * import {
 *   BytesRange,
 *   type IntRange,
 *   type SuffixRange,
 * } from "https://deno.land/x/range_request_middleware@$VERSION/mod.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 *
 * const bytesRange = new BytesRange();
 * const rangeUnit = "bytes";
 * declare const initResponse: Response;
 * declare const rangeSet: [IntRange, SuffixRange];
 *
 * const response = await bytesRange.respond(initResponse, {
 *   rangeUnit,
 *   rangeSet,
 * });
 *
 * assertEquals(bytesRange.rangeUnit, rangeUnit);
 * assertEquals(response.status, 206);
 * assertEquals(
 *   response.headers.get("content-type"),
 *   "multipart/byteranges; boundary=<BOUNDARY>",
 * );
 * ```
 */
export class BytesRange implements Range {
  #boundary: ComputeBoundary;
  constructor(options?: Partial<BytesContext>) {
    this.#boundary = options?.computeBoundary ?? digestSha1;
  }

  rangeUnit = RangeUnit.Bytes;

  respond(
    response: Response,
    context: RangesSpecifier,
  ): Response | Promise<Response> {
    if (context.rangeUnit !== this.rangeUnit) return response;

    return createPartialResponse(response, {
      ...context,
      computeBoundary: this.#boundary,
    });
  }
}

/** Create partial response from response. */
export async function createPartialResponse(
  response: Response,
  context: RangesSpecifier & BytesContext,
) {
  if (response.bodyUsed) return response;

  const content = await response
    .clone()
    .arrayBuffer();

  const { rangeUnit, rangeSet } = context;
  const size = content.byteLength;
  const inclRanges = rangeSet
    .filter(isSupportedRanceSpec)
    .filter(
      (rangeSpec) => isSatisfiable(rangeSpec, size),
    ).map((rangeSpec) => rangeSpec2InclRange(rangeSpec, size));

  if (!isNotEmpty(inclRanges)) {
    return new RequestedRangeNotSatisfiableResponse({
      rangeUnit,
      completeLength: size,
    }, { headers: response.headers });
  }

  if (inclRanges.length === 1) {
    const inclRange = inclRanges[0];
    const partialBody = content.slice(
      inclRange.firstPos,
      inclRange.lastPos + 1,
    );
    const contentRange = stringifyContentRange({
      rangeUnit: RangeUnit.Bytes,
      ...inclRange,
      completeLength: size,
    });
    const right = new Headers({ [RangeHeader.ContentRange]: contentRange });
    const headers = shallowMergeHeaders(response.headers, right);

    return new Response(partialBody, {
      status: Status.PartialContent,
      headers,
    });
  }

  const contentType = response.headers.get(RepresentationHeader.ContentType);

  if (isNull(contentType)) return response;

  const boundary = await context.computeBoundary(content);
  const newContentType = `multipart/byteranges; boundary=${boundary}`;
  const multipart = multipartByteranges({
    content,
    contentType,
    ranges: inclRanges,
    boundary,
    rangeUnit: RangeUnit.Bytes,
  });
  const right = new Headers({
    [RepresentationHeader.ContentType]: newContentType,
  });
  const headers = shallowMergeHeaders(response.headers, right);

  return new Response(multipart, { status: Status.PartialContent, headers });
}

/** Whether the range spec is satisfiable or not. */
export function isSatisfiable(
  rangeSpec: IntRange | SuffixRange,
  contentLength: number,
): boolean {
  if (isIntRange(rangeSpec)) {
    if (!contentLength) return false;

    return rangeSpec.firstPos < contentLength;
  }

  return !!rangeSpec.suffixLength;
}

export function isSupportedRanceSpec(
  rangeSpec: RangeSpec,
): rangeSpec is IntRange | SuffixRange {
  return !isOtherRange(rangeSpec);
}

/** Convert {@link RangeSpec} into {@link InclRange}. */
export function rangeSpec2InclRange(
  rangeSpec: IntRange | SuffixRange,
  completeLength: number,
): InclRange {
  if (isIntRange(rangeSpec)) {
    const lastPos = !isNumber(rangeSpec.lastPos) ||
        (isNumber(rangeSpec.lastPos) && completeLength <= rangeSpec.lastPos)
      ? completeLength ? completeLength - 1 : 0
      : rangeSpec.lastPos;

    return { firstPos: rangeSpec.firstPos, lastPos };
  }

  const firstPos = completeLength < rangeSpec.suffixLength
    ? 0
    : completeLength - rangeSpec.suffixLength;
  const lastPos = completeLength ? completeLength - 1 : 0;

  return { firstPos, lastPos };
}

export async function digestSha1(content: ArrayBuffer): Promise<string> {
  const hash = await crypto
    .subtle
    .digest("SHA-1", content);

  return toHashString(hash);
}
