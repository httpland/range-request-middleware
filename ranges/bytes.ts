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

export interface Options {
  readonly computeBoundary?: ComputeBoundary;
}

export class BytesRange implements Range {
  constructor(options?: Options) {
    this.#boundary = options?.computeBoundary ?? digestSha1;
  }

  unit = RangeUnit.Bytes;
  #boundary: ComputeBoundary;

  respond(context: RangeContext): Promise<Response> {
    return respondPartial({ ...context, computeBoundary: this.#boundary });
  }
}

export async function respondPartial(
  context: RangeContext & { computeBoundary: ComputeBoundary },
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

export interface ComputeBoundary {
  (content: ArrayBuffer): string | Promise<string>;
}

export async function digestSha1(content: ArrayBuffer): Promise<string> {
  const hash = await crypto
    .subtle
    .digest("SHA-1", content);

  return toHashString(hash);
}
