import { BuildOptions } from "https://deno.land/x/dnt@0.33.1/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},
  compilerOptions: {
    lib: ["dom", "dom.iterable", "esnext"],
  },
  typeCheck: false,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@httpland/range-request-middleware",
    version,
    description: "HTTP range request middleware",
    keywords: [
      "http",
      "middleware",
      "range",
      "range-request",
      "accept-ranges",
      "content-range",
      "multipart",
      "byteranges",
      "partial",
      "fetch-api",
    ],
    license: "MIT",
    homepage: "https://github.com/httpland/range-request-middleware",
    repository: {
      type: "git",
      url: "git+https://github.com/httpland/range-request-middleware.git",
    },
    bugs: {
      url: "https://github.com/httpland/range-request-middleware/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
  mappings: {
    "https://deno.land/x/http_middleware@1.0.0/mod.ts": {
      name: "@httpland/http-middleware",
      version: "1.0.0",
    },
    "https://deno.land/x/isx@1.1.1/is_string.ts": {
      name: "@miyauci/isx",
      version: "1.1.1",
      subPath: "is_string",
    },
    "https://deno.land/x/isx@1.1.1/is_null.ts": {
      name: "@miyauci/isx",
      version: "1.1.1",
      subPath: "is_null",
    },
    "https://deno.land/x/isx@1.1.1/is_number.ts": {
      name: "@miyauci/isx",
      version: "1.1.1",
      subPath: "is_number",
    },
    "https://deno.land/x/isx@1.1.1/iterable/is_not_empty.ts": {
      name: "@miyauci/isx",
      version: "1.1.1",
      subPath: "iterable/is_not_empty",
    },
    "https://deno.land/x/http_utils@1.0.0-beta.14/header.ts": {
      name: "@httpland/http-utils",
      version: "1.0.0-beta.14",
    },
    "https://deno.land/x/http_utils@1.0.0-beta.14/method.ts": {
      name: "@httpland/http-utils",
      version: "1.0.0-beta.14",
    },
    "https://deno.land/x/result_js@1.0.0/mod.ts": {
      name: "@miyauci/result",
      version: "1.0.0",
    },
    "https://deno.land/x/range_parser@1.2.0/mod.ts": {
      name: "@httpland/range-parser",
      version: "1.2.0",
    },
    "https://deno.land/x/accept_ranges_parser@1.0.0/mod.ts": {
      name: "@httpland/accept-ranges-parser",
      version: "1.0.0",
    },
    "https://deno.land/x/content_range_parser@1.0.0/mod.ts": {
      name: "@httpland/content-range-parser",
      version: "1.0.0",
    },
  },
});
