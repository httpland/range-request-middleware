// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  type IntRange,
  isIntRange,
  isNotEmpty,
  isNumber,
  isOtherRange,
  RangeHeader,
  type RangeSpec,
  RepresentationHeader,
  Status,
  type SuffixRange,
  toHashString,
} from "../deps.ts";
import type { Range, RangeContext } from "../types.ts";
import { RangeUnit } from "../utils.ts";
import { multipartByteranges } from "./utils.ts";
import { type InclRange, stringify } from "../content_range.ts";

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
 */
export class BytesRange implements Range {
  #boundary: ComputeBoundary;
  constructor(options?: Partial<BytesContext>) {
    this.#boundary = options?.computeBoundary ?? digestSha1;
  }

  unit = RangeUnit.Bytes;

  respond(context: RangeContext): Promise<Response> {
    return respondPartial({ ...context, computeBoundary: this.#boundary });
  }
}

/** Make partial response from context. */
export async function respondPartial(
  context: RangeContext & BytesContext,
): Promise<Response> {
  const { content, contentType, rangeUnit } = context;
  const size = content.byteLength;
  const inclRanges = context.rangeSet
    .filter(isSupportedRanceSpec)
    .filter(
      (rangeSpec) => isSatisfiable(rangeSpec, size),
    ).map((rangeSpec) => rangeSpec2InclRange(rangeSpec, size));

  if (!isNotEmpty(inclRanges)) {
    const contentRange = stringify({
      rangeUnit,
      range: { completeLength: size },
    });

    return new Response(null, {
      status: Status.RequestedRangeNotSatisfiable,
      headers: { [RangeHeader.ContentRange]: contentRange },
    });
  }

  if (inclRanges.length === 1) {
    const inclRange = inclRanges[0];
    const partialBody = context.content.slice(
      inclRange.firstPos,
      inclRange.lastPos + 1,
    );
    const contentRange = stringify({
      rangeUnit: RangeUnit.Bytes,
      range: { ...inclRange, completeLength: size },
    });

    return new Response(partialBody, {
      status: Status.PartialContent,
      headers: {
        [RangeHeader.ContentRange]: contentRange,
        [RepresentationHeader.ContentType]: contentType,
      },
    });
  }

  const boundary = await context.computeBoundary(content);
  const newContentType = `multipart/byteranges; boundary=${boundary}`;
  const multipart = multipartByteranges({
    content,
    contentType,
    ranges: inclRanges,
    boundary,
    rangeUnit: RangeUnit.Bytes,
  });

  return new Response(multipart, {
    status: Status.PartialContent,
    headers: { [RepresentationHeader.ContentType]: newContentType },
  });
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
