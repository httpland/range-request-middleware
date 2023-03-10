import { range } from "./middleware.ts";
import {
  assert,
  describe,
  equalsResponse,
  it,
  RangeHeader,
  RepresentationHeader,
  Status,
} from "./_dev_deps.ts";

describe("range", () => {
  it("should", async () => {
    const middleware = range();
    const rangeRequest = new Request("test:", {
      headers: { range: "bytes=5-9" },
    });
    const response = await middleware(
      rangeRequest,
      () => new Response("abcdefghijklmnopqrstuvwxyz"),
    );

    assert(
      await equalsResponse(
        response,
        new Response(`fghij`, {
          status: Status.PartialContent,
          headers: {
            [RangeHeader.ContentRange]: `bytes 5-9/26`,
          },
        }),
        true,
      ),
    );
  });

  it("should", async () => {
    const middleware = range();
    const rangeRequest = new Request("test:", {
      headers: { range: "bytes=5-9, 20-, -5" },
    });
    const response = await middleware(
      rangeRequest,
      () => new Response("abcdefghijklmnopqrstuvwxyz"),
    );

    const boundary = `32d10c7b8cf96570ca04ce37f2a19d84240d3a89`;

    assert(
      await equalsResponse(
        response,
        new Response(
          `--${boundary}
Content-Type: text/plain;charset=UTF-8
Content-Range: 5-9/26

fghij
--${boundary}
Content-Type: text/plain;charset=UTF-8
Content-Range: 20-25/26

uvwxyz
--${boundary}
Content-Type: text/plain;charset=UTF-8
Content-Range: 21-25/26

vwxyz
--${boundary}--`,
          {
            status: Status.PartialContent,
            headers: {
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
