import { equalsCaseInsensitive } from "./utils.ts";
import { assert, describe, it } from "./_dev_deps.ts";

describe("equalsCaseInsensitive", () => {
  it("should return true", () => {
    const table: [string, string][] = [
      ["", ""],
      ["a", "A"],
      ["abc", "AbC"],
      ["あ", "あ"],
    ];

    table.forEach(([left, right]) => {
      assert(equalsCaseInsensitive(left, right));
    });
  });

  it("should return false", () => {
    const table: [string, string][] = [
      ["a", "b"],
      ["ba", "ab"],
      ["ba", "ab"],
    ];

    table.forEach(([left, right]) => {
      assert(!equalsCaseInsensitive(left, right));
    });
  });
});
