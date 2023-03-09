// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ConditionalHeader,
  isErr,
  isIntRange,
  isNull,
  isOtherRange,
  Method,
  parse,
  RangeHeader,
  type RangeSpec,
  RangesSpecifier,
  RepresentationHeader,
  Status,
  unsafe,
} from "./deps.ts";
import {
  RangeUnit as Unit,
  RequestedRangeNotSatisfiableResponse,
  shallowMergeHeaders,
} from "./util.ts";

import type { Range, RangeUnit, Specifier } from "./types.ts";

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
  const validityResult = checkValidity(parsedRange, context.ranges);
  // An origin server MUST ignore a Range header field that contains a range unit it does not understand. A proxy MAY discard a Range header field that contains a range unit it does not understand.
  // @see https://www.rfc-editor.org/rfc/rfc9110#section-14.2-5
  if (!validityResult) return response;

  const matchedRange = validityResult;
  const body = await response.clone().arrayBuffer();
  const satisfiableRangeSet = parsedRange.rangeSet.filter(isSatisfiable);

  if (!satisfiableRangeSet.length) {
    return new RequestedRangeNotSatisfiableResponse({
      rangeUnit: validityResult.unit,
      completeLength: body.byteLength,
    }, { headers: response.headers });
  }

  const partialContents = await validityResult.partial({
    rangeSet: parsedRange.rangeSet,
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

  function isSatisfiable(rangeSpec: RangeSpec): boolean {
    return matchedRange.isSatisfiable({ contents: body, rangeSpec });
  }
}

function toSpecifier(
  rangeSpec: RangeSpec,
): Specifier {
  if (isOtherRange(rangeSpec)) return "other-range";
  if (isIntRange(rangeSpec)) return "int-range";

  return "suffix-range";
}

function checkValidity(
  range: RangesSpecifier,
  ranges: Iterable<Range>,
): false | Range {
  const parsedRange = range;
  const maybeRange = Array.from(ranges).find(matchRange);

  // An origin server MUST ignore a Range header field that contains a range unit it does not understand. A proxy MAY discard a Range header field that contains a range unit it does not understand.
  // @see https://www.rfc-editor.org/rfc/rfc9110#section-14.2-5
  if (!maybeRange) return false;

  const matchedRange = maybeRange;
  const nodes = parsedRange.rangeSet.map(toSpecifier);
  const isValid = nodes.every((v) => matchedRange.specifiers.includes(v));

  if (!isValid) return false;

  return maybeRange;

  function matchRange(range: Range): boolean {
    return range.unit === parsedRange.rangeUnit;
  }
}
