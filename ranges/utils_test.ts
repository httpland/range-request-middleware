import { type MultipartByteranges, multipartByteranges } from "./utils.ts";
import { assertEquals, describe, it } from "../_dev_deps.ts";

describe("multipartByteranges", () => {
  it("should return multiparted content", () => {
    const table: [
      Omit<MultipartByteranges, "content"> & { content: string },
      string,
    ][] = [
      [
        {
          boundary: "xxx",
          content: "abcdef",
          contentType: "text/plain",
          ranges: [{ firstPos: 0, lastPos: 2 }],
          rangeUnit: "bytes",
        },
        `--xxx
Content-Type: text/plain
Content-Range: bytes 0-2/6

abc
--xxx--`,
      ],
      [
        {
          boundary: "x",
          content: "abcdef",
          contentType: "text/test",
          ranges: [{ firstPos: 0, lastPos: 2 }, { firstPos: 3, lastPos: 5 }],
          rangeUnit: "bytes",
        },
        `--x
Content-Type: text/test
Content-Range: bytes 0-2/6

abc
--x
Content-Type: text/test
Content-Range: bytes 3-5/6

def
--x--`,
      ],
    ];

    table.forEach(([byteRanges, expected]) => {
      const { content, ...rest } = byteRanges;
      assertEquals(
        new TextDecoder().decode(
          multipartByteranges({
            ...rest,
            content: new TextEncoder().encode(content),
          }),
        ),
        expected,
      );
    });
  });
});
