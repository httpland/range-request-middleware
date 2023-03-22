import { rangeRequest } from "./middleware.ts";
import {
  assert,
  describe,
  equalsResponse,
  it,
  RangeHeader,
  RepresentationHeader,
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
