import {
  ConditionalHeader,
  isErr,
  isNull,
  Method,
  RangeHeader,
  RepresentationHeader,
  Status,
  unsafe,
} from "./deps.ts";
import { parseRange } from "./parser.ts";
import type { Range, RangeSpec } from "./types.ts";

interface Context {
  readonly ranges: Iterable<Range>;
}

export async function withContentRange(
  request: Request,
  response: Response,
  context: Context,
): Promise<Response> {
  const rangeValue = request.headers.get(RangeHeader.Range);

  // A server MUST ignore a Range header field received with a request method that is unrecognized or for which range handling is not defined. For this specification, GET is the only method for which range handling is defined.
  // @see https://www.rfc-editor.org/rfc/rfc9110#section-14.2-4
  if (
    request.method !== Method.Get ||
    isNull(rangeValue) ||
    request.headers.has(ConditionalHeader.IfRange)
  ) {
    return response;
  }

  const contentType = response.headers.get(RepresentationHeader.ContentType);

  if (
    response.headers.has(RangeHeader.ContentRange) ||
    response.headers.get(RangeHeader.AcceptRanges) === "none" ||
    response.bodyUsed ||
    isNull(contentType)
  ) {
    return response;
  }

  const rangeContainer = unsafe(() => parseRange(rangeValue));

  if (isErr(rangeContainer)) {
    // A server that supports range requests MAY ignore or reject a Range header field that contains an invalid ranges-specifier (Section 14.1.1), a ranges-specifier with more than two overlapping ranges, or a set of many small ranges that are not listed in ascending order, since these are indications of either a broken client or a deliberate denial-of-service attack (Section 17.15).
    // https://www.rfc-editor.org/rfc/rfc9110#section-14.2-6
    return response;
  }

  const parsedRange = rangeContainer.value;
  const ranges = Array.from(context.ranges);
  const maybeRange = ranges.find(matchRange);

  // An origin server MUST ignore a Range header field that contains a range unit it does not understand. A proxy MAY discard a Range header field that contains a range unit it does not understand.
  // @see https://www.rfc-editor.org/rfc/rfc9110#section-14.2-5
  if (!maybeRange) return response;
  const matchedRange = maybeRange;

  const body = await response.clone().arrayBuffer();
  const satisfiableRangeSet = parsedRange.rangeSet.filter(isSatisfiable);

  if (!satisfiableRangeSet.length) {
    return new Response(null, {
      status: Status.RequestedRangeNotSatisfiable,
    });
  }

  const evaluateResult = await matchedRange.evaluate({
    rangeSpecs: parsedRange.rangeSet,
    contents: body,
    contentType,
  });
  const headers = new Headers(response.headers);

  headers.set(RangeHeader.ContentRange, evaluateResult.contentRange);

  return new Response(evaluateResult.partialContents, {
    status: Status.PartialContent,
    headers,
  });

  function matchRange(range: Range): boolean {
    return range.unit === parsedRange.rangeUnit;
  }

  function isSatisfiable(rangeSpec: RangeSpec): boolean {
    return matchedRange.isSatisfiable({
      contents: body,
      rangeSpec,
    });
  }
}
