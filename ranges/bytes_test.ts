import {
  BytesRange,
  isSatisfiable,
  isSupportedRanceSpec,
  rangeSpec2InclRange,
  respondPartial,
} from "./bytes.ts";
import {
  assert,
  assertEquals,
  assertSpyCalls,
  describe,
  equalsResponse,
  type IntRange,
  it,
  RangeHeader,
  RepresentationHeader,
  spy,
  Status,
  type SuffixRange,
} from "../_dev_deps.ts";
import { InclRange } from "../content_range.ts";

describe("rangeSpec2InclRange", () => {
  it("should return incl range from int range", () => {
    const table: [IntRange, number, InclRange][] = [
      [{ firstPos: 0, lastPos: 0 }, 0, { firstPos: 0, lastPos: 0 }],
      [{ firstPos: 0, lastPos: 0 }, 1, { firstPos: 0, lastPos: 0 }],
      [{ firstPos: 0, lastPos: 1 }, 1, { firstPos: 0, lastPos: 0 }],
      [{ firstPos: 0, lastPos: 0 }, 10, { firstPos: 0, lastPos: 0 }],
      [{ firstPos: 0, lastPos: 1 }, 10, { firstPos: 0, lastPos: 1 }],
      [{ firstPos: 0, lastPos: 100 }, 10, { firstPos: 0, lastPos: 9 }],
      [{ firstPos: 4, lastPos: 6 }, 10, { firstPos: 4, lastPos: 6 }],
    ];

    table.forEach(([intRange, completeLength, expected]) => {
      assertEquals(rangeSpec2InclRange(intRange, completeLength), expected);
    });
  });

  it("should return incl range from suffix range", () => {
    const table: [SuffixRange, number, InclRange][] = [
      [{ suffixLength: 1 }, 0, { firstPos: 0, lastPos: 0 }],
      [{ suffixLength: 0 }, 0, { firstPos: 0, lastPos: 0 }],
      [{ suffixLength: 1 }, 1, { firstPos: 0, lastPos: 0 }],
      [{ suffixLength: 1 }, 2, { firstPos: 1, lastPos: 1 }],
      [{ suffixLength: 1 }, 3, { firstPos: 2, lastPos: 2 }],
      [{ suffixLength: 2 }, 3, { firstPos: 1, lastPos: 2 }],
      [{ suffixLength: 3 }, 3, { firstPos: 0, lastPos: 2 }],
    ];

    table.forEach(([intRange, completeLength, expected]) => {
      assertEquals(rangeSpec2InclRange(intRange, completeLength), expected);
    });
  });
});

describe("isSatisfiable", () => {
  it("should return true if the int range is satisfiable", () => {
    const table: [IntRange, number][] = [
      [{ firstPos: 0, lastPos: 0 }, 1],
      [{ firstPos: 0, lastPos: 1 }, 1],
    ];

    table.forEach(([intRange, contentLength]) => {
      assert(isSatisfiable(intRange, contentLength));
    });
  });

  it("should return false if the int range is not satisfiable", () => {
    const table: [IntRange, number][] = [
      [{ firstPos: 0, lastPos: 0 }, 0],
      [{ firstPos: 1, lastPos: 1 }, 0],
    ];

    table.forEach(([intRange, contentLength]) => {
      assert(!isSatisfiable(intRange, contentLength));
    });
  });

  it("should return true if the suffix range is satisfiable", () => {
    const table: [SuffixRange, number][] = [
      [{ suffixLength: 1 }, 0],
      [{ suffixLength: 1 }, 1],
      [{ suffixLength: 100 }, 0],
      [{ suffixLength: 100 }, 1],
    ];

    table.forEach(([intRange, contentLength]) => {
      assert(isSatisfiable(intRange, contentLength));
    });
  });

  it("should return false if the suffix range is not satisfiable", () => {
    const table: [SuffixRange, number][] = [
      [{ suffixLength: 0 }, 0],
      [{ suffixLength: 0 }, 1],
    ];

    table.forEach(([intRange, contentLength]) => {
      assert(!isSatisfiable(intRange, contentLength));
    });
  });
});

describe("isSupportedRanceSpec", () => {
  it("should return true", () => {
    assert(isSupportedRanceSpec({ firstPos: 0, lastPos: 1 }));
    assert(isSupportedRanceSpec({ suffixLength: 1 }));
  });

  it("should return false", () => {
    assert(!isSupportedRanceSpec(""));
  });
});

describe("respondPartial", () => {
  it("should return 413 response if the satisfied range set is none", async () => {
    const computeBoundary = spy(() => "");
    const response = await respondPartial({
      content: new ArrayBuffer(10),
      contentType: "",
      computeBoundary,
      rangeSet: [""],
      rangeUnit: "bytes",
    });

    assertSpyCalls(computeBoundary, 0);
    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.RequestedRangeNotSatisfiable,
          headers: { [RangeHeader.ContentRange]: "bytes */10" },
        }),
        true,
      ),
    );
  });

  it("should return 413 response if the satisfied range set is none", async () => {
    const computeBoundary = spy(() => "");
    const response = await respondPartial({
      content: new ArrayBuffer(0),
      contentType: "",
      computeBoundary,
      rangeSet: [{ firstPos: 0, lastPos: 4 }],
      rangeUnit: "bytes",
    });

    assertSpyCalls(computeBoundary, 0);
    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.RequestedRangeNotSatisfiable,
          headers: { [RangeHeader.ContentRange]: "bytes */0" },
        }),
        true,
      ),
    );
  });

  it("should return 206 response if the satisfied range set are one", async () => {
    const computeBoundary = spy(() => "");

    const content = "abcdefghij";
    const response = await respondPartial({
      content: new TextEncoder().encode(content),
      contentType: "text/test",
      computeBoundary,
      rangeSet: [{ firstPos: 3, lastPos: 5 }],
      rangeUnit: "bytes",
    });

    assertSpyCalls(computeBoundary, 0);
    assert(
      await equalsResponse(
        response,
        new Response("def", {
          status: Status.PartialContent,
          headers: {
            [RangeHeader.ContentRange]: "bytes 3-5/10",
            [RepresentationHeader.ContentType]: "text/test",
          },
        }),
        true,
      ),
    );
  });

  it("should return 206 response if the satisfied range set are multiple", async () => {
    const computeBoundary = spy(() => "xxx");

    const content = "abcdefghij";
    const response = await respondPartial({
      content: new TextEncoder().encode(content),
      contentType: "text/test",
      computeBoundary,
      rangeSet: [{ firstPos: 40, lastPos: 5 }, { firstPos: 3, lastPos: 5 }, {
        suffixLength: 100,
      }, ""],
      rangeUnit: "bytes",
    });

    assertSpyCalls(computeBoundary, 1);

    const body = `--xxx
Content-Type: text/test
Content-Range: bytes 3-5/10

def
--xxx
Content-Type: text/test
Content-Range: bytes 0-9/10

abcdefghij
--xxx--`;

    assert(
      await equalsResponse(
        response,
        new Response(body, {
          status: Status.PartialContent,
          headers: {
            [RepresentationHeader.ContentType]:
              "multipart/byteranges; boundary=xxx",
          },
        }),
        true,
      ),
    );
  });
});

describe("BytesRange", () => {
  const bytesRange = new BytesRange();

  it("should unit is bytes", () => {
    assertEquals(bytesRange.rangeUnit, "bytes");
  });
});
