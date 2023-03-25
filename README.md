# range-request-middleware

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/range_request_middleware)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/range_request_middleware/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/range-request-middleware)](https://github.com/httpland/range-request-middleware/releases)
[![codecov](https://codecov.io/github/httpland/range-request-middleware/branch/main/graph/badge.svg)](https://codecov.io/gh/httpland/range-request-middleware)
[![GitHub](https://img.shields.io/github/license/httpland/range-request-middleware)](https://github.com/httpland/range-request-middleware/blob/main/LICENSE)

[![test](https://github.com/httpland/range-request-middleware/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/range-request-middleware/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/range-request-middleware.png?mini=true)](https://nodei.co/npm/@httpland/range-request-middleware/)

HTTP range request middleware.

Handles range request and partial response.

Compliant with
[RFC 9110, 14. Range Requests](https://www.rfc-editor.org/rfc/rfc9110#section-14)

## Usage

Upon receipt of a range request, if the response [satisfies](#satisfiable) the
range requirement, [merge](#merging) it to a partial response.

```ts
import { rangeRequest } from "https://deno.land/x/range_request_middleware@$VERSION/mod.ts";
import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";

const middleware = rangeRequest();
const request = new Request("test:", {
  headers: { range: "bytes=5-9" },
});
const response = await middleware(
  request,
  () => new Response("abcdefghijklmnopqrstuvwxyz"),
);

assertEquals(response.status, 206);
assertEquals(response.headers.get("content-range"), "bytes 5-9/26");
assertEquals(response.headers.get("accept-ranges"), "bytes");
assertEquals(await response.text(), "fghij");
```

yield:

```http
HTTP/<VERSION> 206
Content-Range: bytes 5-9/26
Accept-Ranges: bytes

fghij
```

## Multi-range request

For multi-range request, response body will convert to a multipart content.

It compliant with
[RFC 9110, 14.6. Media Type multipart/byteranges](https://www.rfc-editor.org/rfc/rfc9110.html#name-media-type-multipart-bytera).

```ts
import { rangeRequest } from "https://deno.land/x/range_request_middleware@$VERSION/mod.ts";
import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std/testing/asserts.ts";

const middleware = rangeRequest();
const request = new Request("test:", {
  headers: { range: "bytes=5-9, 20-, -5" },
});
const response = await middleware(
  request,
  () => new Response("abcdefghijklmnopqrstuvwxyz"),
);

assertEquals(response.status, 206);
assertEquals(
  response.headers.get(
    "content-type",
  ),
  "multipart/byteranges; boundary=<boundary-delimiter>",
);
assertEquals(
  await response.text(),
  `--<boundary-delimiter>
Content-Type: text/plain;charset=UTF-8
Content-Range: 5-9/26

fghij
--<boundary-delimiter>
Content-Type: text/plain;charset=UTF-8
Content-Range: 20-25/26

uvwxyz
--<boundary-delimiter>
Content-Type: text/plain;charset=UTF-8
Content-Range: 21-25/26

vwxyz
--<boundary-delimiter>--`,
);
```

yield:

```http
HTTP/<VERSION> 206
Content-Type: multipart/byteranges; boundary=<BOUNDARY-DELIMITER>
Accept-Ranges: bytes

--<BOUNDARY-DELIMITER>
Content-Type: text/plain;charset=UTF-8
Content-Range: 5-9/26

fghij
--<BOUNDARY-DELIMITER>
Content-Type: text/plain;charset=UTF-8
Content-Range: 20-25/26

uvwxyz
--<BOUNDARY-DELIMITER>
Content-Type: text/plain;charset=UTF-8
Content-Range: 21-25/26

vwxyz
--<BOUNDARY-DELIMITER>--
```

## Conditions

There are several conditions that must be met in order for middleware to
execute.

If the following conditions are **not met**,
[invalid](https://www.rfc-editor.org/rfc/rfc9110#section-14.2-6) and the
response will not modify.

- Request method is `GET`.
- Request has `Range` header
- Request does not include `If-Range` header
- Request `Range` header is valid syntax
- Request `Range` header is valid semantics
- Response status code is `200`
- Response does not include `Content-Range` header
- Response does not include `Accept-Ranges` header or its value is not `none`
- Response includes `Content-Type` header
- Response body is readable

Note that if there is an `If-Range` header, do nothing.

## Unsatisfiable

If [conditions](#conditions) is met and the following conditions are **not met**
,[unsatisfiable](https://www.rfc-editor.org/rfc/rfc9110#section-14.1.1-12), and
it is not possible to meet partial response.

- If a valid
  [ranges-specifier](https://www.rfc-editor.org/rfc/rfc9110#rule.ranges-specifier)
  contains at least one satisfactory
  [range-spec](https://www.rfc-editor.org/rfc/rfc9110#rule.ranges-specifier), as
  defined in the indicated
  [range-unit](https://www.rfc-editor.org/rfc/rfc9110#range.units)

In this case, the handler response will [merge](#merging) to
[416(Range Not Satisfiable)](https://www.rfc-editor.org/rfc/rfc9110#status.416)
response.

A example of how unsatisfiable can happen:

If receive un unknown range unit.

```ts
import {
  type Handler,
  rangeRequest,
} from "https://deno.land/x/range_request_middleware@$VERSION/mod.ts";
import { assert, assertEquals } from "https://deno.land/std/testing/asserts.ts";

declare const handler: Handler;
const middleware = rangeRequest();
const response = await middleware(
  new Request("test:", { headers: { range: "<unknown-unit>=<other-range>" } }),
  handler,
);

assertEquals(response.status, 416);
assert(response.headers.has("content-range"));
```

## Satisfiable

If the [conditions](#conditions) and [unsatisfiable](#unsatisfiable) are met,
[satisfiable](https://www.rfc-editor.org/rfc/rfc9110#satisfiable), and partial
response will return.

The handler response will [merge](#merging) to
[206(Partial Content)](https://www.rfc-editor.org/rfc/rfc9110#section-15.3.7)
response.

## Merging

The response of the handler and the response of [Range.respond](#range) will
merge .

The following elements are merged shallowly, giving priority to the `Response`
of [Range.respond](#range).

- HTTP Status code
- HTTP Content
- HTTP Headers

## Range

`Range` abstracts partial response.

Middleware factories can accept `Range` objects and implement own range request
protocols.

`Range` is the following structure:

| Name      | Type                                                                                      | Description                                 |
| --------- | ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| rangeUnit | `string`                                                                                  | Corresponding range unit.                   |
| respond   | `(response: Response, context: RangesSpecifier) =>` `Response` &#124; `Promise<Response>` | Return response from range request context. |

The middleware supports the following range request protocols by default:

- `bytes`([ByteRanges](#bytesrange))

### BytesRange

`bytes` range unit is used to express subranges of a representation data's octet
sequence.

ByteRange supports single and multiple range requests.

Compliant with
[RFC 9110, 14.1.2. Byte Ranges](https://www.rfc-editor.org/rfc/rfc9110.html#section-14.1.2).

```ts
import {
  BytesRange,
  type IntRange,
  type SuffixRange,
} from "https://deno.land/x/range_request_middleware@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const bytesRange = new BytesRange();
const rangeUnit = "bytes";
declare const initResponse: Response;
declare const rangeSet: [IntRange, SuffixRange];

const response = await bytesRange.respond(initResponse, {
  rangeUnit,
  rangeSet,
});

assertEquals(bytesRange.rangeUnit, rangeUnit);
assertEquals(response.status, 206);
assertEquals(
  response.headers.get("content-type"),
  "multipart/byteranges; boundary=<BOUNDARY>",
);
```

## Effects

Middleware may make changes to the following HTTP messages:

- HTTP Content
- HTTP Headers
  - Accept-Ranges
  - Content-Range
  - Content-Type
- HTTP Status code
  - 206(Partial Content)
  - 416(Range Not Satisfiable)

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
