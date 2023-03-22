// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { concat, isString } from "../deps.ts";
import { InclRange, stringify } from "../content_range.ts";

export interface MultipartByteranges {
  readonly content: ArrayBuffer;
  readonly contentType: string;
  readonly ranges: readonly [InclRange, ...readonly InclRange[]];
  readonly rangeUnit: string;
  readonly boundary: string;
}

/** Deserialize {@link MultipartByteranges} into multipart/byterages bytestream. */
export function multipartByteranges(args: MultipartByteranges): ArrayBuffer {
  const { content, contentType, ranges, boundary, rangeUnit } = args;
  const size = content.byteLength;
  const boundaryDelimiter = "--" + boundary;
  const endDelimiter = boundaryDelimiter + "--";
  const encoder = new TextEncoder();
  const contentTypeStr = `Content-Type: ${contentType}`;
  const contents = ranges
    .map(bodyParts)
    .flat()
    .map((buffer) => new Uint8Array(buffer))
    .concat(encoder.encode(endDelimiter));
  const buffer = join(contents, encoder.encode("\n")).buffer;

  return buffer;

  function bodyParts(range: InclRange): ArrayBuffer[] {
    const contentRangeStr = stringify({
      rangeUnit,
      range: { ...range, completeLength: size },
    });

    return [
      boundaryDelimiter,
      contentTypeStr,
      `Content-Range: ${contentRangeStr}`,
      "",
      content.slice(range.firstPos, range.lastPos + 1),
    ].map(toBuffer);
  }
}

export function join(
  list: readonly Uint8Array[],
  separator: Uint8Array,
): Uint8Array {
  return list.reduce((acc, cur, i) => {
    if (!i) return concat(acc, cur);

    return concat(acc, separator, cur);
  }, new Uint8Array());
}

export function toBuffer(input: string | ArrayBuffer): ArrayBuffer {
  return isString(input) ? new TextEncoder().encode(input) : input;
}
