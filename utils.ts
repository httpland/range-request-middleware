// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { NoContentHeaders, RangeHeader, Status } from "./deps.ts";
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
    const headers = new NoContentHeaders(init?.headers);

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
