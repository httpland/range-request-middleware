import { isNotEmpty, isString, isUndefined, trim } from "./deps.ts";
import type { IntRange, RangeSpec, SuffixRange } from "./types.ts";

const RangeSpecifierRe =
  /^(?<rangeUnit>([!#$%&'*+-.^_`|~A-Za-z0-9])+)=(?<rangeSet>((([0-9])+-(([0-9])+)?)|(-([0-9])+))((\x20|\t)*,(\x20|\t)*((([0-9])+-(([0-9])+)?)|(-([0-9])+)))*)$/;

export interface RangesSpecifier {
  readonly rangeUnit: string;
  readonly rangeSet: string;
}

export function parseRangesSpecifier(input: string): RangesSpecifier {
  const result = RangeSpecifierRe.exec(input);

  if (!result || !result.groups) throw Error();

  const rangeUnit = result.groups.rangeUnit;
  const rangeSet = result.groups.rangeSet;

  if (isUndefined(rangeUnit) || isUndefined(rangeSet)) {
    throw SyntaxError();
  }

  return { rangeUnit, rangeSet };
}

const RangeSpecRe =
  /^((?<firstPos>[0-9]+)-(?<lastPos>[0-9]+)?)$|^(-(?<suffixLength>[0-9]+))$/;

export function parseRangeSpec(input: string): IntRange | SuffixRange {
  const result = RangeSpecRe.exec(input);

  if (!result || !result.groups) {
    throw SyntaxError("syntax error");
  }

  const firstPos = result.groups.firstPos;
  const lastPos = result.groups.lastPos;
  const suffixLength = result.groups.suffixLength;

  if (isString(firstPos)) {
    return {
      firstPos: Number.parseInt(firstPos),
      lastPos: lastPos ? Number.parseInt(lastPos) : undefined,
    };
  }

  if (!isString(suffixLength)) {
    throw SyntaxError("conflict syntax");
  }

  const suffix = Number.parseInt(suffixLength);

  if (isNaN(suffix)) throw SyntaxError();

  return { suffixLength: suffix };
}

export function parseRangeSet(input: string): [RangeSpec, ...RangeSpec[]] {
  const result = input.split(",");

  const ranges = result
    .map(trim)
    .map(parseRangeSpec);

  if (!isNotEmpty(ranges)) throw SyntaxError();

  return ranges;
}
