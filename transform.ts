// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  distinct,
  isErr,
  isString,
  parse,
  RangeHeader,
  Status,
  unsafe,
} from "./deps.ts";
import {
  equalsCaseInsensitive,
  RangeUnit as Unit,
  RequestedRangeNotSatisfiableResponse,
} from "./utils.ts";
import { type Range, RangeUnit } from "./types.ts";

export type UnitLike =
  | RangeUnit
  | readonly [RangeUnit, ...readonly RangeUnit[]];

export function withAcceptRanges(
  response: Response,
  unit: UnitLike,
): Response {
  const units = isString(unit) ? [unit] : unit;
  const unitValue = distinct(units).join(", ");

  if (!response.headers.has(RangeHeader.AcceptRanges)) {
    response.headers.set(RangeHeader.AcceptRanges, unitValue);
  }

  return response;
}

export interface Context {
  readonly ranges: Iterable<Range>;
  readonly rangeValue: string;
}

export async function withContentRange(
  response: Response,
  context: Context,
): Promise<Response> {
  if (
    response.status !== Status.OK ||
    response.headers.has(RangeHeader.ContentRange) ||
    response.headers.get(RangeHeader.AcceptRanges) === Unit.None ||
    response.bodyUsed
  ) return response;

  const rangeContainer = unsafe(() => parse(context.rangeValue));

  if (isErr(rangeContainer)) {
    // A server that supports range requests MAY ignore or reject a Range header field that contains an invalid ranges-specifier (Section 14.1.1), a ranges-specifier with more than two overlapping ranges, or a set of many small ranges that are not listed in ascending order, since these are indications of either a broken client or a deliberate denial-of-service attack (Section 17.15).
    // https://www.rfc-editor.org/rfc/rfc9110#section-14.2-6
    return response;
  }

  const parsedRange = rangeContainer.value;
  const matchedRange = Array.from(context.ranges).find(({ rangeUnit }) =>
    equalsCaseInsensitive(rangeUnit, parsedRange.rangeUnit)
  );
  const body = await response.clone().arrayBuffer();

  if (!matchedRange) {
    // @see https://www.rfc-editor.org/rfc/rfc9110#section-14.2-13
    return new RequestedRangeNotSatisfiableResponse({
      rangeUnit: parsedRange.rangeUnit,
      range: { completeLength: body.byteLength },
    }, { headers: response.headers });
  }

  return matchedRange.respond(response, parsedRange);
}
