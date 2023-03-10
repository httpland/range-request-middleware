import {
  isIntRange,
  isOtherRange,
  NoContentHeaders,
  RangeHeader,
  type RangeSpec,
  Status,
} from "./deps.ts";

export const enum RangeUnit {
  Bytes = "bytes",
  None = "none",
}

export const enum Specifier {
  IntRange = "int-range",
  SuffixRange = "suffix-range",
  OtherRange = "other-range",
}

export function toSpecifier(
  rangeSpec: RangeSpec,
): Specifier {
  if (isOtherRange(rangeSpec)) return Specifier.OtherRange;
  if (isIntRange(rangeSpec)) return Specifier.IntRange;

  return Specifier.SuffixRange;
}

/** Shallow merge two headers. */
export function shallowMergeHeaders(left: Headers, right: Headers): Headers {
  const lHeader = new Headers(left);

  right.forEach((value, key) => lHeader.set(key, value));

  return lHeader;
}

interface ContentRange {
  readonly rangeUnit: string;
  readonly completeLength: number;
}

export class RequestedRangeNotSatisfiableResponse extends Response {
  constructor(
    contentRange: ContentRange,
    init?: Omit<ResponseInit, "status"> | undefined,
  ) {
    const { statusText } = init ?? {};
    const headers = new NoContentHeaders(init?.headers);

    if (!headers.has(RangeHeader.ContentRange)) {
      const contentRangeStr =
        `${contentRange.rangeUnit} */${contentRange.completeLength}`;
      headers.set(RangeHeader.ContentRange, contentRangeStr);
    }

    super(null, {
      status: Status.RequestedRangeNotSatisfiable,
      statusText,
      headers,
    });
  }
}
