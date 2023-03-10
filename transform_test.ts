import { withAcceptRanges, withContentRange } from "./transform.ts";
import {
  assert,
  ConditionalHeader,
  describe,
  equalsResponse,
  it,
  RangeHeader,
  Status,
} from "./_dev_deps.ts";
import type { RangeUnit } from "./types.ts";
import { Specifier } from "./utils.ts";

describe("withContentRange", () => {
  describe("should return same response", () => {
    it("if the request is not GET method", async () => {
      const initResponse = new Response();
      const response = await withContentRange(
        new Request("test:", { method: "HEAD" }),
        initResponse,
        { ranges: [] },
      );

      assert(initResponse === response);
    });

    it("if the Range header does not exist in request", async () => {
      const initResponse = new Response();
      const response = await withContentRange(
        new Request("test:"),
        initResponse,
        { ranges: [] },
      );

      assert(initResponse === response);
    });

    it("if the If-Range header exists in request", async () => {
      const initResponse = new Response();
      const response = await withContentRange(
        new Request("test:", {
          headers: {
            [RangeHeader.Range]: "bytes=0-",
            [ConditionalHeader.IfRange]: "",
          },
        }),
        initResponse,
        { ranges: [] },
      );

      assert(initResponse === response);
    });

    it("if the response is not ok", async () => {
      const initResponse = new Response(null, {
        status: Status.NotFound,
        headers: { [RangeHeader.ContentRange]: "" },
      });
      const response = await withContentRange(
        new Request("test:", {
          headers: { [RangeHeader.Range]: "bytes=0-" },
        }),
        initResponse,
        { ranges: [] },
      );

      assert(initResponse === response);
    });

    it("if the Content-Range header exists in response", async () => {
      const initResponse = new Response(null, {
        headers: { [RangeHeader.ContentRange]: "" },
      });
      const response = await withContentRange(
        new Request("test:", {
          headers: { [RangeHeader.Range]: "bytes=0-" },
        }),
        initResponse,
        { ranges: [] },
      );

      assert(initResponse === response);
    });

    it("if the Accept-Ranges header is none in response", async () => {
      const initResponse = new Response(null, {
        headers: { [RangeHeader.AcceptRanges]: "none" },
      });
      const response = await withContentRange(
        new Request("test:", { headers: { [RangeHeader.Range]: "bytes=0-" } }),
        initResponse,
        { ranges: [] },
      );

      assert(initResponse === response);
    });

    it("if the response body has been read", async () => {
      const initResponse = new Response("");
      await initResponse.text();

      assert(initResponse.bodyUsed);

      const response = await withContentRange(
        new Request("test:", { headers: { [RangeHeader.Range]: "bytes=0-" } }),
        initResponse,
        { ranges: [] },
      );

      assert(initResponse === response);
    });

    it("if the parsing Range header is fail", async () => {
      const initResponse = new Response("");

      const response = await withContentRange(
        new Request("test:", { headers: { [RangeHeader.Range]: "<invalid>" } }),
        initResponse,
        { ranges: [] },
      );

      assert(initResponse === response);
    });

    it("if the ranges are not match", async () => {
      const initResponse = new Response("");

      const response = await withContentRange(
        new Request("test:", { headers: { [RangeHeader.Range]: "bytes=0-" } }),
        initResponse,
        { ranges: [] },
      );

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

    it("if the range unit does not match", async () => {
      const initResponse = new Response("");

      const response = await withContentRange(
        new Request("test:", { headers: { [RangeHeader.Range]: "bytes=0-" } }),
        initResponse,
        {
          ranges: [{
            unit: "xxx",
            specifiers: [Specifier.IntRange],
            getSatisfiable: () => [],
            getPartial: () => ({ content: "", headers: new Headers() }),
          }],
        },
      );

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

    it("if the range specifier does not match", async () => {
      const initResponse = new Response("");

      const response = await withContentRange(
        new Request("test:", { headers: { [RangeHeader.Range]: "bytes=0-" } }),
        initResponse,
        {
          ranges: [{
            unit: "bytes",
            specifiers: [Specifier.OtherRange],
            getSatisfiable: () => [],
            getPartial: () => ({ content: "", headers: new Headers() }),
          }],
        },
      );

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
  });

  it("should return 413 response if the specifiers include invalid specifier", async () => {
    const initResponse = new Response("abcd");

    const response = await withContentRange(
      new Request("test:", { headers: { [RangeHeader.Range]: "bytes=0-" } }),
      initResponse,
      {
        ranges: [{
          unit: "bytes",
          specifiers: [Specifier.IntRange],
          getSatisfiable: () => [],
          getPartial: () => ({ content: "", headers: new Headers() }),
        }],
      },
    );

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.RequestedRangeNotSatisfiable,
          headers: {
            [RangeHeader.ContentRange]: "bytes */4",
          },
        }),
        true,
      ),
    );
  });

  it("should return 206 response", async () => {
    const initResponse = new Response("abcd");

    const response = await withContentRange(
      new Request("test:", { headers: { [RangeHeader.Range]: "bytes=0-" } }),
      initResponse,
      {
        ranges: [{
          unit: "bytes",
          specifiers: [Specifier.IntRange],
          getSatisfiable: () => [{ firstPos: 0, lastPos: undefined }],
          getPartial: () => ({
            content: "efgh",
            headers: new Headers({ [RangeHeader.ContentRange]: "range" }),
          }),
        }],
      },
    );

    assert(
      await equalsResponse(
        response,
        new Response("efgh", {
          status: Status.PartialContent,
          headers: {
            ["content-type"]: "text/plain;charset=UTF-8",
            [RangeHeader.ContentRange]: "range",
          },
        }),
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
