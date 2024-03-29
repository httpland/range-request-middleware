import {
  BytesRange,
  createPartialResponse,
  isSatisfiable,
  isSupportedRanceSpec,
  rangeSpec2InclRange,
} from "./bytes.ts";
import {
  assert,
  assertEquals,
  assertSpyCalls,
  describe,
  equalsResponse,
  type InclRange,
  type IntRange,
  it,
  RangeHeader,
  RepresentationHeader,
  spy,
  Status,
  type SuffixRange,
} from "../_dev_deps.ts";

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

describe("createPartialResponse", () => {
  it("should return same response if the response has read", async () => {
    const computeBoundary = spy(() => "");
    const initResponse = new Response("");

    await initResponse.text();

    assert(initResponse.bodyUsed);

    const response = await createPartialResponse(initResponse, {
      computeBoundary,
      rangeSet: [""],
      rangeUnit: "bytes",
    });

    assertSpyCalls(computeBoundary, 0);
    assert(response === initResponse);
  });

  it("should return 413 response if the satisfied range set is none", async () => {
    const computeBoundary = spy(() => "");
    const response = await createPartialResponse(new Response("abcd"), {
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
          headers: { [RangeHeader.ContentRange]: "bytes */4" },
        }),
        true,
      ),
    );
  });

  it("should return 413 response if the satisfied range set is none", async () => {
    const computeBoundary = spy(() => "");
    const response = await createPartialResponse(new Response(), {
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
    const response = await createPartialResponse(
      new Response(content, {
        headers: {
          [RepresentationHeader.ContentType]: "text/test",
        },
      }),
      {
        computeBoundary,
        rangeSet: [{ firstPos: 3, lastPos: 5 }],
        rangeUnit: "bytes",
      },
    );

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
    const response = await createPartialResponse(
      new Response(content, {
        headers: {
          [RepresentationHeader.ContentType]: "text/test",
        },
      }),
      {
        computeBoundary,
        rangeSet: [{ firstPos: 40, lastPos: 5 }, { firstPos: 3, lastPos: 5 }, {
          suffixLength: 100,
        }, ""],
        rangeUnit: "bytes",
      },
    );

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

  it("should return same response if the context of range unit is not bytes", async () => {
    const initResponse = new Response();
    const response = await bytesRange.respond(initResponse, {
      rangeUnit: "unknown",
      rangeSet: [{ firstPos: 0, lastPos: undefined }, { suffixLength: 1 }],
    });

    assert(initResponse === response);
  });

  it("should override computeBoundary function", async () => {
    const bytesRange = new BytesRange({ computeBoundary: () => "test" });

    const response = await bytesRange.respond(new Response("abcd"), {
      rangeUnit: "bytes",
      rangeSet: [{ firstPos: 0, lastPos: undefined }, { suffixLength: 1 }],
    });

    const content = `--test
Content-Type: text/plain;charset=UTF-8
Content-Range: bytes 0-3/4

abcd
--test
Content-Type: text/plain;charset=UTF-8
Content-Range: bytes 3-3/4

d
--test--`;

    assert(
      await equalsResponse(
        response,
        new Response(content, {
          status: Status.PartialContent,
          headers: {
            [RepresentationHeader.ContentType]:
              "multipart/byteranges; boundary=test",
          },
        }),
        true,
      ),
    );
  });
});
