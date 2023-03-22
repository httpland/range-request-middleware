import { type ContentRange, stringify } from "./content_range.ts";
import { assertEquals, describe, it } from "./_dev_deps.ts";

describe("stringify", () => {
  it("should return deserialized string if the content rage is valid", () => {
    const table: [ContentRange, string][] = [
      [{
        rangeUnit: "bytes",
        range: { firstPos: 0, lastPos: 100, completeLength: 120 },
      }, "bytes 0-100/120"],
      [{
        rangeUnit: "bytes",
        range: { firstPos: 100, lastPos: 1000, completeLength: undefined },
      }, "bytes 100-1000/*"],
      [{
        rangeUnit: "bytes",
        range: { completeLength: 1000 },
      }, "bytes */1000"],
    ];

    table.forEach(([contentRange, expected]) => {
      assertEquals(stringify(contentRange), expected);
    });
  });
});
