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
    "https://deno.land/x/isx@1.0.0-beta.24/mod.ts": {
      name: "isxx",
      version: "1.0.0-beta.24",
    },
    "https://deno.land/x/http_utils@1.0.0-beta.13/header.ts": {
      name: "@httpland/http-utils",
      version: "1.0.0-beta.13",
    },
    "https://deno.land/x/http_utils@1.0.0-beta.13/method.ts": {
      name: "@httpland/http-utils",
      version: "1.0.0-beta.13",
    },
    "https://deno.land/x/result_js@1.0.0/mod.ts": {
      name: "@miyauci/result",
      version: "1.0.0",
    },
    "https://deno.land/x/range_parser@1.1.0/mod.ts": {
      name: "@httpland/range-parser",
      version: "1.1.0",
    },
  },
});
