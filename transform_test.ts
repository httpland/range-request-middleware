import { withAcceptRanges, withContentRange } from "./transform.ts";
import {
  assert,
  assertSpyCalls,
  describe,
  equalsResponse,
  it,
  RangeHeader,
  RepresentationHeader,
  spy,
  Status,
} from "./_dev_deps.ts";
import type { RangeUnit } from "./types.ts";

describe("withContentRange", () => {
  it("should return same response if the response is not ok", async () => {
    const respond = spy(() => new Response());
    const initResponse = new Response("", { status: Status.NotFound });

    const response = await withContentRange(initResponse, {
      rangeValue: "",
      ranges: [{ unit: "bytes", respond }],
    });

    assert(response === initResponse);
  });

  it("should return same response if the response has content-range header", async () => {
    const respond = spy(() => new Response());
    const initResponse = new Response("", {
      headers: { [RangeHeader.ContentRange]: "" },
    });

    const response = await withContentRange(initResponse, {
      rangeValue: "",
      ranges: [{ unit: "bytes", respond }],
    });

    assert(response === initResponse);
  });

  it("should return same response if the response has accept-ranges header and the value is none", async () => {
    const respond = spy(() => new Response());
    const initResponse = new Response("", {
      headers: { [RangeHeader.AcceptRanges]: "none" },
    });

    const response = await withContentRange(initResponse, {
      rangeValue: "",
      ranges: [{ unit: "bytes", respond }],
    });

    assert(response === initResponse);
  });

  it("should return same response if the response body has read", async () => {
    const respond = spy(() => new Response());
    const initResponse = new Response("");

    await initResponse.text();

    assert(initResponse.bodyUsed);

    const response = await withContentRange(initResponse, {
      rangeValue: "",
      ranges: [{ unit: "bytes", respond }],
    });

    assert(response === initResponse);
  });

  it("should return same response if the response does not have content-type header", async () => {
    const respond = spy(() => new Response());
    const initResponse = new Response("");

    initResponse.headers.delete(RepresentationHeader.ContentType);
    assert(!initResponse.headers.has(RepresentationHeader.ContentType));

    const response = await withContentRange(initResponse, {
      rangeValue: "",
      ranges: [{ unit: "bytes", respond }],
    });

    assert(response === initResponse);
  });

  it("should return same response if the range header is invalid", async () => {
    const respond = spy(() => new Response());
    const initResponse = new Response("");

    const response = await withContentRange(initResponse, {
      rangeValue: "",
      ranges: [{ unit: "bytes", respond }],
    });

    assert(response === initResponse);
  });

  it("should return 416 response if the range unit does not match", async () => {
    const initResponse = new Response("");
    const respond = spy(() => new Response());

    const response = await withContentRange(
      initResponse,
      {
        rangeValue: "bytes=0-",
        ranges: [{
          unit: "xxx",
          respond,
        }],
      },
    );

    assertSpyCalls(respond, 0);
    assert(
      equalsResponse(
        response,
        new Response(null, {
          status: Status.RequestedRangeNotSatisfiable,
          headers: { [RangeHeader.ContentRange]: "bytes */0" },
        }),
      ),
    );
  });

  it("should return response what merge respond response and init response", async () => {
    const initResponse = new Response("");
    const partialResponse = new Response();
    const respond = spy(() => partialResponse);

    const response = await withContentRange(
      initResponse,
      {
        rangeValue: "bytes=0-",
        ranges: [{ unit: "bytes", respond }],
      },
    );

    assertSpyCalls(respond, 1);
    assert(
      await equalsResponse(
        response,
        partialResponse,
        true,
      ),
    );
  });
});

describe("withAcceptRanges", () => {
  it("should return same response if the response has Accept-Ranges header", () => {
    const initResponse = new Response(null, {
      headers: { [RangeHeader.AcceptRanges]: "" },
    });
    const response = withAcceptRanges(initResponse, "none");

    assert(response === initResponse);
  });

  it("should return response what has Accept-Ranges header", async () => {
    const table: [Response, RangeUnit, Response][] = [
      [
        new Response(),
        "bytes",
        new Response(null, {
          headers: { [RangeHeader.AcceptRanges]: "bytes" },
        }),
      ],
      [
        new Response(),
        "none",
        new Response(null, {
          headers: { [RangeHeader.AcceptRanges]: "none" },
        }),
      ],
    ];

    await Promise.all(table.map(async ([initResponse, unit, expected]) => {
      const response = withAcceptRanges(initResponse, unit);

      assert(
        await equalsResponse(response, expected, true),
      );
    }));
  });
});
