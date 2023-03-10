// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { concat, isString } from "../deps.ts";

export interface InclRange {
  readonly firstPos: number;
  readonly lastPos: number;
}

interface Args {
  readonly content: ArrayBuffer;
  readonly contentType: string;
  readonly ranges: readonly InclRange[];
  readonly boundary: string;
}

export function multipartByteranges(args: Args): Uint8Array {
  const { content, contentType, ranges, boundary } = args;
  const size = content.byteLength;
  const boundaryDelimiter = "--" + boundary;
  const endDelimiter = boundaryDelimiter + "--";
  const encoder = new TextEncoder();
  const contents = ranges
    .map(bodyParts)
    .flat()
    .map((buffer) => new Uint8Array(buffer))
    .concat(encoder.encode(endDelimiter));

  return join(contents, encoder.encode("\n"));

  function bodyParts(range: InclRange): ArrayBuffer[] {
    return [
      boundaryDelimiter,
      `Content-Type: ${contentType}`,
      `Content-Range: ${range.firstPos}-${range.lastPos}/${size}`,
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
