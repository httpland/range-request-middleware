// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ConditionalHeader,
  isErr,
  isNotEmpty,
  isNull,
  Method,
  parse,
  RangeHeader,
  RangesSpecifier,
  RepresentationHeader,
  Status,
  unsafe,
} from "./deps.ts";
import {
  RangeUnit as Unit,
  RequestedRangeNotSatisfiableResponse,
  shallowMergeHeaders,
  toSpecifier,
} from "./utils.ts";
import type { Range, RangeUnit } from "./types.ts";

export function withAcceptRanges(
  response: Response,
  unit: RangeUnit,
): Response {
  if (!response.headers.has(RangeHeader.AcceptRanges)) {
    response.headers.set(RangeHeader.AcceptRanges, unit);
  }

  return response;
}

interface Context {
  readonly ranges: Iterable<Range>;
}

export async function withContentRange(
  request: Request,
  response: Response,
  context: Context,
): Promise<Response> {
  const rangeValue = request.headers.get(RangeHeader.Range);
  const contentType = response.headers.get(RepresentationHeader.ContentType);

  if (
    // A server MUST ignore a Range header field received with a request method that is unrecognized or for which range handling is not defined. For this specification, GET is the only method for which range handling is defined.
    // @see https://www.rfc-editor.org/rfc/rfc9110#section-14.2-4
    request.method !== Method.Get ||
    isNull(rangeValue) ||
    request.headers.has(ConditionalHeader.IfRange) ||
    response.status !== Status.OK ||
    response.headers.has(RangeHeader.ContentRange) ||
    response.headers.get(RangeHeader.AcceptRanges) === Unit.None ||
    response.bodyUsed ||
    isNull(contentType)
  ) return response;

  const rangeContainer = unsafe(() => parse(rangeValue));

  if (isErr(rangeContainer)) {
    // A server that supports range requests MAY ignore or reject a Range header field that contains an invalid ranges-specifier (Section 14.1.1), a ranges-specifier with more than two overlapping ranges, or a set of many small ranges that are not listed in ascending order, since these are indications of either a broken client or a deliberate denial-of-service attack (Section 17.15).
    // https://www.rfc-editor.org/rfc/rfc9110#section-14.2-6
    return response;
  }

  const parsedRange = rangeContainer.value;
  const matchedRange = matchRange(parsedRange, context.ranges);
  const body = await response.clone().arrayBuffer();

  if (!matchedRange) {
    // @see https://www.rfc-editor.org/rfc/rfc9110#section-14.2-13
    return new RequestedRangeNotSatisfiableResponse({
      rangeUnit: parsedRange.rangeUnit,
      completeLength: body.byteLength,
    }, { headers: response.headers });
  }

  const targetRangeSet = matchedRange.getSatisfiable({
    content: body,
    rangeSet: parsedRange.rangeSet,
  });

  if (!isNotEmpty(targetRangeSet)) {
    return new RequestedRangeNotSatisfiableResponse({
      rangeUnit: matchedRange.unit,
      completeLength: body.byteLength,
    }, { headers: response.headers });
  }

  const partialContents = await matchedRange.getPartial({
    rangeSet: targetRangeSet,
    content: body,
    contentType,
  });
  const headers = shallowMergeHeaders(
    response.headers,
    partialContents.headers,
  );

  return new Response(partialContents.content, {
    status: Status.PartialContent,
    headers,
  });
}

function matchRange(
  range: RangesSpecifier,
  ranges: Iterable<Range>,
): null | Range {
  const maybeRange = Array.from(ranges).find(({ unit }) =>
    unit === range.rangeUnit
  );

  if (!maybeRange) return null;

  const result = range
    .rangeSet
    .map(toSpecifier)
    .every((specifier) => maybeRange.specifiers.includes(specifier));

  return result ? maybeRange : null;
}
