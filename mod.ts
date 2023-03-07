import { type Middleware } from "./deps.ts";
import { withContentRange } from "./transform.ts";
import { BytesRange } from "./ranges/bytes.ts";
import type { Range } from "./types.ts";

interface Options {
  readonly ranges?: Iterable<Range>;
}

export default function rangeRequests(options?: Options): Middleware {
  const ranges = options?.ranges ?? [new BytesRange()];

  return async (request, next) => {
    const response = await next(request);

    return withContentRange(request, response, { ranges });
  };
}
