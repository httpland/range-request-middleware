// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

// TODO:(miyauci) Packaging and externalization this module.

import { isNumber } from "./deps.ts";

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

/** Deserialize {@link ContentRange} into string. */
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

  return `${firstPos}-${lastPos}`;
}

function stringifyContentLength(completeLength: number | undefined): string {
  const length = isNumber(completeLength) ? completeLength : "*";

  return length.toString();
}

function stringifyUnsatisfiedRange(unsatisfiedRange: UnsatisfiedRange): string {
  return `*/${unsatisfiedRange.completeLength}`;
}

function isRangeResp(rangeLike: RangeLike): rangeLike is RangeResp {
  return "firstPos" in rangeLike;
}
