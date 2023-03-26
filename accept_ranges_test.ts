import {
  AcceptRanges,
  hasToken,
  isTokenFormat,
  parseAcceptRanges,
  Token,
} from "./accept_range.ts";
import {
  assert,
  assertEquals,
  assertThrows,
  describe,
  it,
} from "./_dev_deps.ts";

describe("isTokenFormat", () => {
  it("should return true", () => {
    const table: string[] = [
      "a",
      "!#$%&'*+-.^_`|~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ];

    table.forEach((input) => {
      assert(isTokenFormat(input));
    });
  });

  it("should return false", () => {
    const table: string[] = [
      "",
      " ",
      " a",
      "a ",
      " a ",
      `"`,
    ];

    table.forEach((input) => {
      assert(!isTokenFormat(input));
    });
  });
});

describe("parseAcceptRanges", () => {
  it("should return list", () => {
    const table: [string, AcceptRanges][] = [
      ["abc", ["abc"]],
      ["abc,def", ["abc", "def"]],
      [" abc,def ", ["abc", "def"]],
      [" abc, def ", ["abc", "def"]],
      [" abc,    def , !   ", ["abc", "def", "!"]],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(parseAcceptRanges(input), expected);
    });
  });

  it("should throw error", () => {
    const table: string[] = [
      "",
      `"`,
      `", "`,
      `あ`,
      `あ, a`,
      `"a"`,
      `"a,"`,
      `"a",""`,
      `a,`,
      `a,,,`,
      `a , , , `,
      ` a , , , `,
    ];

    table.forEach((input) => {
      assertThrows(() => parseAcceptRanges(input));
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
