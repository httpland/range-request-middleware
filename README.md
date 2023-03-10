# range-middleware

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/range_middleware)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/range_middleware/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/range-middleware)](https://github.com/httpland/range-middleware/releases)
[![codecov](https://codecov.io/github/httpland/range-middleware/branch/main/graph/badge.svg?token=MNFZEQH8OK)](https://codecov.io/gh/httpland/range-middleware)
[![GitHub](https://img.shields.io/github/license/httpland/range-middleware)](https://github.com/httpland/range-middleware/blob/main/LICENSE)

[![test](https://github.com/httpland/range-middleware/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/range-middleware/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/range-middleware.png?mini=true)](https://nodei.co/npm/@httpland/range-middleware/)

HTTP range request middleware.

## What

Handles range request and partial response.

This allows handlers to enable partial responses.

Compliant with
[RFC 9110, 14. Range Requests](https://www.rfc-editor.org/rfc/rfc9110#section-14)

## Usage

Upon receipt of a range request, if the response [satisfies](#satisfiable) the
range requirement [converts](#conversion) it to a partial response.

Headers and status code will be modified accordingly.

```ts
import { range } from "https://deno.land/x/range_middleware/mod.ts";
import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";

const middleware = range();
const rangeRequest = new Request("test:", {
  headers: { range: "bytes=5-9" },
});
const response = await middleware(
  rangeRequest,
  () => new Response("abcdefghijklmnopqrstuvwxyz"),
);

assertEquals(response.status, 206);
assertEquals(response.headers.get("content-range", "bytes 5-9/26"));
assertEquals(await response.text(), "fghij");
```

## Multi-range request

For multi-range request, this will be converted to a multipart message body with
`multipart/byteranges`.

```ts
import { range } from "https://deno.land/x/range_middleware@$VERSION/mod.ts";
import {
  assert,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.178.0/testing/asserts.ts";

const middleware = range();
const rangeRequest = new Request("test:", {
  headers: { range: "bytes=5-9, 20-, -5" },
});
const response = await middleware(
  rangeRequest,
  () => new Response("abcdefghijklmnopqrstuvwxyz"),
);

assertEquals(response.status, 206);
assertEquals(
  response.headers.get(
    "content-type",
    "multipart/byteranges; boundary=<boundary-delimiter>",
  ),
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

## Conditions

There are several conditions that must be met in order for middleware to
execute.

If the following conditions are **not met**,
[invalid](https://www.rfc-editor.org/rfc/rfc9110#section-14.2-6) and the
response is not modified in any way.

- Request method is `GET`.
- Request does not have an `If-Range` header
- Request has a `Range` header
- Request `Range` header is valid syntax
- Request `Range` header is valid semantics
- Response status code is `200`.
- Response `Content-Type` header is present
- Response has `Accept-Ranges` header is not present, or if present, its value
  is not `none`.
- The body of the Response is readable.

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

In this case, the handler response is [converted](#conversion) to
[416(Range Not Satisfiable)](https://www.rfc-editor.org/rfc/rfc9110#status.416)
response.

A example of how unsatisfiable can happen:

We receive `<range-unit>` and `<range-specifier>` as `Range` headers, which
conform to the syntax but are not supported.

```ts
import { range } from "https://deno.land/x/range_middleware@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
declare const handler = () => Response;

const middleware = range();
const response = await middleware(
  new Request("test:", { headers: { range: "<unknown-unit>=<other-range>" } }),
  handler,
);

assertEquals(response.status, 416);
```

## Satisfiable

If the [conditions](#conditions) and [unsatisfiable](#unsatisfiable) are met,
[satisfiable](https://www.rfc-editor.org/rfc/rfc9110#satisfiable), and partial
response is made.

### Conversion

Conversion refers to changing the handler response to the appropriate response.

Specifically, the handler response and the appropriate response are shallow
merged with the appropriate response taking priority over the handler response.

Shallow merge targets are as follows:

- HTTP Status code
- HTTP Content
- HTTP Headers

If status code or body conflicts, it will be replaced by its value in the
appropriate response.

If header fields conflict, the header will be replaced by its value in the
appropriate response header.

## Effects

Middleware may make changes to the following HTTP messages:

- HTTP Content
- HTTP Headers
  - Content-Range
  - Content-Type
- HTTP Status code
  - 206(Partial Content)
  - 416(Range Not Satisfiable)

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
