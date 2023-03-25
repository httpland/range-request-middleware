# [1.0.0-beta.2](https://github.com/httpland/range-request-middleware/compare/1.0.0-beta.1...1.0.0-beta.2) (2023-03-25)


### Bug Fixes

* **transform:** change the range unit equality to case insensitive ([16d547e](https://github.com/httpland/range-request-middleware/commit/16d547e067a8c61eeb9400c2d49f01f7b2d440fc))


### Features

* **content_range:** add checking format of content-range header ([169b15d](https://github.com/httpland/range-request-middleware/commit/169b15d8d90fadaca9e8161c41c21e9fed84600c))
* **mod:** remove unrelated types ([068dd87](https://github.com/httpland/range-request-middleware/commit/068dd87cdf0870eac0e6534a214423b6d61ca54f))
* **types:** change range interface, update docs ([28b2da9](https://github.com/httpland/range-request-middleware/commit/28b2da91541b60365db43ebdaa7a120ff607cdac))
* **types:** remove object method types ([2409a96](https://github.com/httpland/range-request-middleware/commit/2409a9648e3b68d6e620d75abd261498bf14b2d0))

# 1.0.0-beta.1 (2023-03-24)


### Bug Fixes

* **transform:** change the success status code ([7e789a1](https://github.com/httpland/range-request-middleware/commit/7e789a18076f97d1ea1c27480a5bfa205ea9915e))
* **transform:** fix to change 416 response condition ([2509e90](https://github.com/httpland/range-request-middleware/commit/2509e906f0e8f7a0961740a454ea83826c4d1176))


### Features

* add content-range header and partilize content ([165d180](https://github.com/httpland/range-request-middleware/commit/165d180d63ad432cc60210bd39be60e09ed93c87))
* **bytes:** export BytesRange and add description ([253386f](https://github.com/httpland/range-request-middleware/commit/253386ff8c9ddf5ee423aec4319d213876a02817))
* **content_range:** add content range field deserializer ([0fe7759](https://github.com/httpland/range-request-middleware/commit/0fe775969a9117f8a2a55b402b35de9456e88790))
* **middleware:** add range middleware factory ([1926b02](https://github.com/httpland/range-request-middleware/commit/1926b027502c1666661bc3e012eaf8b0e4faf13f))
* **middleware:** add rangeRequest, contentRange and acceptRanges middleware ([03e8d6b](https://github.com/httpland/range-request-middleware/commit/03e8d6b75a003aaa382f282ee916fbec4ab5b100))
* **mod:** export types of interface ([8687894](https://github.com/httpland/range-request-middleware/commit/8687894131197c1c9a2bb95df29fd7cd7c4487cf))
* **parser:** add range header parser ([4d5a9ab](https://github.com/httpland/range-request-middleware/commit/4d5a9ab3494f7d97b91f8f44bc8be7c0e1eea634))
* **ranges:** add ByteRange implementation ([1741e1d](https://github.com/httpland/range-request-middleware/commit/1741e1d26437bcadd2286f18dc30d6e0c54637c5))
* rename field name to `rangeUnit` from `unit` ([41aa7da](https://github.com/httpland/range-request-middleware/commit/41aa7da5170ffd1a789fa9b5135cd8a5a57c8ee3))
* **transform:** add response transformer for range headers ([0f1700c](https://github.com/httpland/range-request-middleware/commit/0f1700c2cd1bac2d5a0a57ee6419640bcd9398a1))
* **transform:** add to transformer for `accept-ranges` header field ([5f7f226](https://github.com/httpland/range-request-middleware/commit/5f7f2260efde91c7b687dc1938d9c085ecb8eff2))
* **transform:** change Range interface and transform response interface ([ff78387](https://github.com/httpland/range-request-middleware/commit/ff783875603d87702aa69393b31631f71204aacf))
* **types:** add Range API ([50d9eab](https://github.com/httpland/range-request-middleware/commit/50d9eabd343e0108527414e08f7e0565ccee2980))