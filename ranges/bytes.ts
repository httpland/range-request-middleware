// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  type IntRange,
  isIntRange,
  isNumber,
  RangeHeader,
  RepresentationHeader,
  type SuffixRange,
  toHashString,
} from "../deps.ts";
import type {
  IsSatisfiableContext,
  PartialContent,
  PartialContext,
  Range,
} from "../types.ts";
import { RangeUnit, Specifier } from "../utils.ts";
import { type InclRange, multipartByteranges } from "./utils.ts";

interface Options {
  readonly boundary?: BoundaryCallback;
}

export class BytesRange
  implements Range<Specifier.SuffixRange | Specifier.IntRange> {
  constructor(options?: Options) {
    this.#boundary = options?.boundary ?? getBoundary;
  }

  unit = RangeUnit.Bytes;
  specifiers = [Specifier.SuffixRange, Specifier.IntRange] as const;
  #boundary: BoundaryCallback;

  getSatisfiable(
    context: IsSatisfiableContext<IntRange | SuffixRange>,
  ): (IntRange | SuffixRange)[] {
    return context.rangeSet.filter((rangeSpec) =>
      isSatisfiable(rangeSpec, context.content.byteLength)
    );
  }

  async getPartial(
    context: PartialContext<IntRange | SuffixRange>,
  ): Promise<PartialContent> {
    const { rangeSet, content, contentType } = context;
    const size = content.byteLength;
    const ranges = rangeSet.map((rangeSpec) =>
      rangeSpec2InclRange(rangeSpec, size)
    ) as [InclRange, ...InclRange[]];

    if (ranges.length === 1) {
      const byteRange = ranges[0];
      const partialBody = content.slice(
        byteRange.firstPos,
        byteRange.lastPos + 1,
      );
      const contentRange =
        `bytes ${byteRange.firstPos}-${byteRange.lastPos}/${size}`;
      const headers = new Headers({ [RangeHeader.ContentRange]: contentRange });

      return { content: partialBody, headers };
    }

    const boundary = await this.#boundary(content);
    const newContentType = `multipart/byteranges; boundary=${boundary}`;
    const multipart = multipartByteranges({
      content,
      contentType,
      ranges,
      boundary,
    });
    const headers = new Headers({
      [RepresentationHeader.ContentType]: newContentType,
    });

    return { content: multipart, headers };
  }
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

export function rangeSpec2InclRange(
  rangeSpec: IntRange | SuffixRange,
  completeLength: number,
): InclRange {
  if (isIntRange(rangeSpec)) {
    const lastPos = isNumber(rangeSpec.lastPos)
      ? completeLength < rangeSpec.lastPos
        ? completeLength - 1
        : rangeSpec.lastPos
      : completeLength - 1;

    return { firstPos: rangeSpec.firstPos, lastPos };
  }

  if (completeLength < rangeSpec.suffixLength) {
    return { firstPos: 0, lastPos: completeLength - 1 };
  }

  return {
    firstPos: completeLength - rangeSpec.suffixLength,
    lastPos: completeLength - 1,
  };
}

export interface BoundaryCallback {
  (content: ArrayBuffer): string | Promise<string>;
}

export async function getBoundary(content: ArrayBuffer): Promise<string> {
  const buffer = await crypto.subtle.digest("sha-1", content);

  return toHashString(buffer);
}
