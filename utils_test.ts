import { equalsCaseInsensitive, hasToken } from "./utils.ts";
import { type Token } from "./deps.ts";
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

describe("hasRangeUnit", () => {
  it("should return true", () => {
    const table: [string, Token][] = [
      ["abc", "abc"],
      ["bytes, test, test2", "bytes"],
      ["bytes, test, test!", "test"],
      [" bytes, test, none ", "none"],
    ];

    table.forEach(([input, token]) => {
      assert(hasToken(input, token));
    });
  });

  it("should return false", () => {
    const table: [string, Token][] = [
      ["a", "b"],
      ["a, b, c", "d"],
      ["a, b, c", "c,"],
    ];

    table.forEach(([input, token]) => {
      assert(!hasToken(input, token));
    });
  });

  it("should return false if the input is invalid syntax", () => {
    const table: [string, Token][] = [
      ["", "a"],
      [`"`, "a"],
      [`"a"`, "a"],
      [`"a", a`, "a"],
    ];

    table.forEach(([input, token]) => {
      assert(!hasToken(input, token));
    });
  });
});
