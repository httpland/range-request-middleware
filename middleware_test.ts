import { acceptRanges, contentRange, rangeRequest } from "./middleware.ts";
import {
  assert,
  assertSpyCalls,
  ConditionalHeader,
  describe,
  equalsResponse,
  it,
  RangeHeader,
  RepresentationHeader,
  spy,
  Status,
} from "./_dev_deps.ts";

describe("rangeRequest", () => {
  it("should return response what includes accept-ranges none", async () => {
    const middleware = rangeRequest([]);
    const request = new Request("test:", {
      headers: { range: "bytes=5-9" },
    });
    const response = await middleware(
      request,
      () => new Response("abcdefghijklmnopqrstuvwxyz"),
    );

    assert(
      await equalsResponse(
        response,
        new Response(`abcdefghijklmnopqrstuvwxyz`, {
          headers: { [RangeHeader.AcceptRanges]: "none" },
        }),
        true,
      ),
    );
  });

  it("should return response what includes content-range and accept-ranges headers", async () => {
    const middleware = rangeRequest();
    const request = new Request("test:", {
      headers: { range: "bytes=5-9" },
    });
    const response = await middleware(
      request,
      () =>
        new Response("abcdefghijklmnopqrstuvwxyz", {
          headers: { [RepresentationHeader.ContentType]: "text/test" },
        }),
    );

    assert(
      await equalsResponse(
        response,
        new Response(`fghij`, {
          status: Status.PartialContent,
          headers: {
            [RangeHeader.AcceptRanges]: "bytes",
            [RangeHeader.ContentRange]: `bytes 5-9/26`,
            [RepresentationHeader.ContentType]: "text/test",
          },
        }),
        true,
      ),
    );
  });

  it("should return response what body is multipart ranges", async () => {
    const middleware = rangeRequest();
    const request = new Request("test:", {
      headers: { range: "bytes=5-9, 20-, -5" },
    });
    const response = await middleware(
      request,
      () => new Response("abcdefghijklmnopqrstuvwxyz"),
    );

    const boundary = `32d10c7b8cf96570ca04ce37f2a19d84240d3a89`;

    assert(
      await equalsResponse(
        response,
        new Response(
          `--${boundary}
Content-Type: text/plain;charset=UTF-8
Content-Range: bytes 5-9/26

fghij
--${boundary}
Content-Type: text/plain;charset=UTF-8
Content-Range: bytes 20-25/26

uvwxyz
--${boundary}
Content-Type: text/plain;charset=UTF-8
Content-Range: bytes 21-25/26

vwxyz
--${boundary}--`,
          {
            status: Status.PartialContent,
            headers: {
              [RangeHeader.AcceptRanges]: "bytes",
              [RepresentationHeader.ContentType]:
                `multipart/byteranges; boundary=${boundary}`,
            },
          },
        ),
        true,
      ),
    );
  });
});

describe("contentRange", () => {
  it("should return same response if the request is not GET", async () => {
    const middleware = contentRange();
    const initResponse = new Response();
    const handler = spy(() => initResponse);

    const response = await middleware(
      new Request("test:", { method: "ANY" }),
      handler,
    );

    assertSpyCalls(handler, 1);
    assert(response === initResponse);
  });

  it("should return same response if the request is not range request", async () => {
    const middleware = contentRange();
    const initResponse = new Response();
    const handler = spy(() => initResponse);

    const response = await middleware(
      new Request("test:"),
      handler,
    );

    assertSpyCalls(handler, 1);
    assert(response === initResponse);
  });

  it("should return same response if the request has If-Range header", async () => {
    const middleware = contentRange();
    const initResponse = new Response();
    const handler = spy(() => initResponse);

    const response = await middleware(
      new Request("test:", {
        headers: {
          [ConditionalHeader.IfRange]: "",
          [RangeHeader.Range]: "bytes=0-1",
        },
      }),
      handler,
    );

    assertSpyCalls(handler, 1);
    assert(response === initResponse);
  });

  it("should return same response if the request range header is invalid", async () => {
    const middleware = contentRange();
    const initResponse = new Response();
    const handler = spy(() => initResponse);

    const response = await middleware(
      new Request("test:", {
        headers: {
          [RangeHeader.Range]: "",
        },
      }),
      handler,
    );

    assertSpyCalls(handler, 1);
    assert(response === initResponse);
  });

  it("should return 416 response if the range request is not supported specifier", async () => {
    const middleware = contentRange([]);
    const initResponse = new Response("abcdefg", {
      headers: {
        [RepresentationHeader.ContentType]: "text/test",
        "x-test": "test",
      },
    });
    const handler = spy(() => initResponse);

    const response = await middleware(
      new Request("test:", {
        headers: {
          [RangeHeader.Range]: "bytes=-100",
        },
      }),
      handler,
    );

    assertSpyCalls(handler, 1);
    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.RequestedRangeNotSatisfiable,
          headers: {
            [RangeHeader.ContentRange]: "bytes */7",
            "x-test": "test",
          },
        }),
        true,
      ),
    );
  });

  it("should return 206 response if the request is single range request", async () => {
    const middleware = contentRange();
    const initResponse = new Response("abcdefg", {
      headers: {
        [RepresentationHeader.ContentType]: "text/test",
        "x-test": "test",
      },
    });
    const handler = spy(() => initResponse);

    const response = await middleware(
      new Request("test:", {
        headers: {
          [RangeHeader.Range]: "bytes=-100",
        },
      }),
      handler,
    );

    assertSpyCalls(handler, 1);
    assert(
      await equalsResponse(
        response,
        new Response("abcdefg", {
          status: Status.PartialContent,
          headers: {
            [RepresentationHeader.ContentType]: "text/test",
            [RangeHeader.ContentRange]: "bytes 0-6/7",
            "x-test": "test",
          },
        }),
        true,
      ),
    );
  });

  it("should return 206 response if the request is multiple range request", async () => {
    const middleware = contentRange();
    const initResponse = new Response("abcdefg", {
      headers: {
        [RepresentationHeader.ContentType]: "text/test",
        "x-test": "test",
      },
    });
    const handler = spy(() => initResponse);

    const response = await middleware(
      new Request("test:", {
        headers: {
          [RangeHeader.Range]: "bytes=-100, 0-1",
        },
      }),
      handler,
    );

    assertSpyCalls(handler, 1);
    assert(
      await equalsResponse(
        response,
        new Response(
          `--2fb5e13419fc89246865e7a324f476ec624e8740
Content-Type: text/test
Content-Range: bytes 0-6/7

abcdefg
--2fb5e13419fc89246865e7a324f476ec624e8740
Content-Type: text/test
Content-Range: bytes 0-1/7

ab
--2fb5e13419fc89246865e7a324f476ec624e8740--`,
          {
            status: Status.PartialContent,
            headers: {
              [RepresentationHeader.ContentType]:
                "multipart/byteranges; boundary=2fb5e13419fc89246865e7a324f476ec624e8740",
              "x-test": "test",
            },
          },
        ),
        true,
      ),
    );
  });
});

describe("acceptRanges", () => {
  it("should return response what includes accept-ranges header", async () => {
    const middleware = acceptRanges();

    const response = await middleware(
      new Request("test:"),
      () => new Response(),
    );

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          headers: { [RangeHeader.AcceptRanges]: "bytes" },
        }),
        true,
      ),
    );
  });

  it("should return response what includes accept-ranges header thay is none", async () => {
    const middleware = acceptRanges(["none"]);

    const response = await middleware(
      new Request("test:"),
      () => new Response(),
    );

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          headers: { [RangeHeader.AcceptRanges]: "none" },
        }),
        true,
      ),
    );
  });

  it("should return same response if the response has Accept-Ranges header", async () => {
    const middleware = acceptRanges();

    const response = await middleware(
      new Request("test:"),
      () =>
        new Response(null, { headers: { [RangeHeader.AcceptRanges]: "xxx" } }),
    );

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          headers: { [RangeHeader.AcceptRanges]: "xxx" },
        }),
        true,
      ),
    );
  });
});
