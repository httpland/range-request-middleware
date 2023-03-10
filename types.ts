import { IntRange, OtherRange, type RangeSpec, SuffixRange } from "./deps.ts";
import { Specifier } from "./utils.ts";

interface SpecifierMap {
  [Specifier.IntRange]: IntRange;
  [Specifier.SuffixRange]: SuffixRange;
  [Specifier.OtherRange]: OtherRange;
}

export interface Range<in out S extends Specifier = Specifier> {
  readonly unit: string;
  readonly specifiers: readonly S[];
  readonly getSatisfiable: GetSatisfiableCallback<SpecifierMap[S]>;
  readonly getPartial: GetPartialCallback<SpecifierMap[S]>;
}

export interface PartialContext<R extends RangeSpec = RangeSpec> {
  readonly rangeSet: readonly [R, ...readonly R[]];
  readonly content: ArrayBuffer;
  readonly contentType: string;
}

export interface IsSatisfiableContext<R extends RangeSpec = RangeSpec> {
  readonly rangeSet: readonly R[];
  readonly content: ArrayBuffer;
}

export interface GetSatisfiableCallback<R extends RangeSpec = RangeSpec> {
  (context: IsSatisfiableContext<R>): R[];
}

export interface PartialContent {
  readonly content: BodyInit;
  readonly headers: Headers;
}

export interface GetPartialCallback<R extends RangeSpec = RangeSpec> {
  (context: PartialContext<R>): PartialContent | Promise<PartialContent>;
}

export type RangeUnit = "bytes" | "none";
