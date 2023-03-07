import {
  parseRangeSpec,
  parseRangesSpecifier,
  RangesSpecifier,
} from "./parser.ts";
import { RangeSpec } from "./types.ts";
import { assertEquals, assertThrows, describe, it } from "./_dev_deps.ts";

describe("parseRangesSpecifier", () => {
  it("should return parsed <ranges-specifier>", () => {
    const table: [string, RangesSpecifier][] = [
      ["bytes=0-100", { rangeUnit: "bytes", rangeSet: "0-100" }],
      ["bytes=0-", { rangeUnit: "bytes", rangeSet: "0-" }],
      ["bytes=-100", { rangeUnit: "bytes", rangeSet: "-100" }],
      ["bytes=0-0,1-1", { rangeUnit: "bytes", rangeSet: "0-0,1-1" }],
      ["bytes=-100,0-100", { rangeUnit: "bytes", rangeSet: "-100,0-100" }],
      ["bytes=-100 , 0-100", { rangeUnit: "bytes", rangeSet: "-100 , 0-100" }],
      ["bytes=-100 , -200   , 300-400", {
        rangeUnit: "bytes",
        rangeSet: "-100 , -200   , 300-400",
      }],
      ["unknown!=-1234567890", {
        rangeUnit: "unknown!",
        rangeSet: "-1234567890",
      }],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(parseRangesSpecifier(input), expected);
    });
  });

  it("should throw error if the input is invalid syntax", () => {
    const table: string[] = [
      "",
      "a",
      "abc",
      "a=b",
      "=",
      "a=1",
      "<>=1-",
      "a=1.1",
      "a=1.0",
      "a=120 ",
      " a=120",
      " a=120 ",
      "a1=120",
    ];

    table.forEach((input) => {
      assertThrows(() => parseRangesSpecifier(input));
    });
  });
});

describe("parseRangeSpec", () => {
  it("should return parsed <range-spec>", () => {
    const table: [string, RangeSpec][] = [
      ["0-", { firstPos: 0, lastPos: undefined }],
      ["0-0", { firstPos: 0, lastPos: 0 }],
      ["100-100", { firstPos: 100, lastPos: 100 }],
      ["100-0", { firstPos: 100, lastPos: 0 }],
      ["100-0", { firstPos: 100, lastPos: 0 }],

      ["-0", { suffixLength: 0 }],
      ["-100", { suffixLength: 100 }],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(parseRangeSpec(input), expected);
    });
  });

  it("should throw error if the input is invalid syntax", () => {
    const table: string[] = [
      "",
      "a",
      "0",
      "1",
      "1.0-",
      "0.1-",
      "0-0.0",
      "0-0.1",
      "100-100,",
      "100- ",
      " 100-",
      "-100,",
    ];

    table.forEach((input) => {
      assertThrows(() => parseRangeSpec(input));
    });
  });
});
