// deno-lint-ignore-file no-explicit-any

import { type Middleware } from "./deps.ts";
import { withContentRange } from "./transform.ts";
import { BytesRange } from "./ranges/bytes.ts";
import type { Range } from "./types.ts";

interface Options {
  readonly ranges?: readonly Range<any>[];
}

export function range(options?: Options): Middleware {
  const ranges = options?.ranges ?? [new BytesRange() as Range<any>];

  return async (request, next) => {
    const response = await next(request);

    return withContentRange(request, response, { ranges });
  };
}
