// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

// TODO:(miyauci) Packaging and externalization this module.

import { isNonNegativeInteger, isNumber } from "./deps.ts";

export interface ContentRange {
  readonly rangeUnit: string;
  readonly range: RangeLike;
}

export interface InclRange {
  readonly firstPos: number;
  readonly lastPos: number;
}

type RangeLike = RangeResp | UnsatisfiedRange;

export interface RangeResp extends InclRange {
  readonly completeLength: number | undefined;
}

export interface UnsatisfiedRange {
  readonly completeLength: number;
}

/** Deserialize {@link ContentRange} into string.
 *
 * @throws {TypeError} If the {@link ContentRange} is invalid.
 */
export function stringify(contentRange: ContentRange): string {
  const fmt = isRangeResp(contentRange.range)
    ? stringifyRangeResp(contentRange.range)
    : stringifyUnsatisfiedRange(contentRange.range);

  return `${contentRange.rangeUnit} ${fmt}`;
}

function stringifyRangeResp(rangeResp: RangeResp): string {
  const { completeLength, ...inclRange } = rangeResp;
  const incRangeStr = stringifyInclRange(inclRange);
  const completeLengthStr = stringifyContentLength(completeLength);

  return `${incRangeStr}/${completeLengthStr}`;
}

function stringifyInclRange(inclRange: InclRange): string {
  const { firstPos, lastPos } = inclRange;

  assertNonNegativeInteger(
    firstPos,
    Msg.InvalidNonNegativeInt(ABNF.FirstPos, firstPos),
  );

  assertNonNegativeInteger(
    lastPos,
    Msg.InvalidNonNegativeInt(ABNF.LastPos, lastPos),
  );

  return `${firstPos}-${lastPos}`;
}

function stringifyContentLength(completeLength: number | undefined): string {
  if (!isNumber(completeLength)) return "*";

  assertNonNegativeInteger(
    completeLength,
    Msg.InvalidNonNegativeInt(ABNF.CompleteLength, completeLength),
  );

  return completeLength.toString();
}

function stringifyUnsatisfiedRange(unsatisfiedRange: UnsatisfiedRange): string {
  const { completeLength } = unsatisfiedRange;

  assertNonNegativeInteger(
    completeLength,
    Msg.InvalidNonNegativeInt(ABNF.CompleteLength, completeLength),
  );

  return `*/${completeLength}`;
}

function isRangeResp(rangeLike: RangeLike): rangeLike is RangeResp {
  return "firstPos" in rangeLike;
}

const enum ABNF {
  CompleteLength = "<complete-length>",
  FirstPos = "<first-pos>",
  LastPos = "<last-pos>",
}

const Msg = {
  InvalidNonNegativeInt: (subject: string, actual: unknown) =>
    `${subject} is not non-negative integer. ${actual}`,
};

function assertNonNegativeInteger(
  input: number,
  msg?: string,
): asserts input {
  if (!isNonNegativeInteger(input)) {
    throw TypeError(msg);
  }
}
