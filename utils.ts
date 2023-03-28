// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  filterKeys,
  isRepresentationHeader,
  not,
  parseAcceptRanges,
  RangeHeader,
  Status,
  type Token,
} from "./deps.ts";
import { type ContentRange, stringify } from "./content_range.ts";

export const enum RangeUnit {
  Bytes = "bytes",
  None = "none",
}

/** Shallow merge two headers. */
export function shallowMergeHeaders(left: Headers, right: Headers): Headers {
  const lHeader = new Headers(left);

  right.forEach((value, key) => lHeader.set(key, value));

  return lHeader;
}

export class RequestedRangeNotSatisfiableResponse extends Response {
  constructor(
    contentRange: ContentRange,
    init?: Omit<ResponseInit, "status"> | undefined,
  ) {
    const { statusText } = init ?? {};
    const headers = filterKeys(
      new Headers(init?.headers),
      not(isRepresentationHeader),
    );

    if (!headers.has(RangeHeader.ContentRange)) {
      const contentRangeStr = stringify(contentRange);

      headers.set(RangeHeader.ContentRange, contentRangeStr);
    }

    super(null, {
      status: Status.RequestedRangeNotSatisfiable,
      statusText,
      headers,
    });
  }
}

/** Whether the inputs are equal to case sensitivity. */
export function equalsCaseInsensitive(left: string, right: string): boolean {
  if (left === right) return true;

  return !left.localeCompare(right, undefined, { sensitivity: "accent" });
}

/** Whether the input has {@link Token} or not.
 * If the input is invalid [`Accept-Ranges`](https://www.rfc-editor.org/rfc/rfc9110.html#section-14.3-2) then `false`.
 */
export function hasToken(input: string, token: Token): boolean {
  try {
    return parseAcceptRanges(input).includes(token);
  } catch {
    return false;
  }
}
