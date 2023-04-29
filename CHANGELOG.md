# [1.3.0-beta.1](https://github.com/httpland/range-request-middleware/compare/1.2.0...1.3.0-beta.1) (2023-04-29)


### Features

* **deps:** update deps ([370f1fc](https://github.com/httpland/range-request-middleware/commit/370f1fc84425dcc849c2a844eb395b15f751a7eb))

# [1.2.0](https://github.com/httpland/range-request-middleware/compare/1.1.0...1.2.0) (2023-04-02)


### Features

* **deps:** update deps version ([de20d9a](https://github.com/httpland/range-request-middleware/commit/de20d9aafda8baebd0a12a4209fc07b516463503))

# [1.2.0-beta.1](https://github.com/httpland/range-request-middleware/compare/1.1.0...1.2.0-beta.1) (2023-04-02)


### Features

* **deps:** update deps version ([de20d9a](https://github.com/httpland/range-request-middleware/commit/de20d9aafda8baebd0a12a4209fc07b516463503))

# [1.1.0](https://github.com/httpland/range-request-middleware/compare/1.0.0...1.1.0) (2023-03-29)


### Features

* **deps:** use external content-range serializer ([5095c21](https://github.com/httpland/range-request-middleware/commit/5095c213075b02d76d1ce03ed37c26511092117e))
* **mod:** export dependent interface ([32609a6](https://github.com/httpland/range-request-middleware/commit/32609a67d0249d100b74e21b66a35a4b71a959b4))

# [1.1.0-beta.2](https://github.com/httpland/range-request-middleware/compare/1.1.0-beta.1...1.1.0-beta.2) (2023-03-29)


### Features

* **deps:** use external content-range serializer ([5095c21](https://github.com/httpland/range-request-middleware/commit/5095c213075b02d76d1ce03ed37c26511092117e))

# [1.1.0-beta.1](https://github.com/httpland/range-request-middleware/compare/1.0.0...1.1.0-beta.1) (2023-03-28)


### Features

* **mod:** export dependent interface ([32609a6](https://github.com/httpland/range-request-middleware/commit/32609a67d0249d100b74e21b66a35a4b71a959b4))

# 1.0.0 (2023-03-26)


### Bug Fixes

* **transform:** change the range unit equality to case insensitive ([16d547e](https://github.com/httpland/range-request-middleware/commit/16d547e067a8c61eeb9400c2d49f01f7b2d440fc))
* **transform:** change the success status code ([7e789a1](https://github.com/httpland/range-request-middleware/commit/7e789a18076f97d1ea1c27480a5bfa205ea9915e))
* **transform:** fix to change 416 response condition ([2509e90](https://github.com/httpland/range-request-middleware/commit/2509e906f0e8f7a0961740a454ea83826c4d1176))
* **transform:** remove unnecessary requirements ([43900d8](https://github.com/httpland/range-request-middleware/commit/43900d8f423c563541cd2f216fa89825f0d04114))


### Features

* **accept_ranges:** add accept-ranges header parser and check that header is none strictly ([980f9b4](https://github.com/httpland/range-request-middleware/commit/980f9b4b8d6b28460db028fd75a4dd9eaff86950))
* add content-range header and partilize content ([165d180](https://github.com/httpland/range-request-middleware/commit/165d180d63ad432cc60210bd39be60e09ed93c87))
* **bytes:** export BytesRange and add description ([253386f](https://github.com/httpland/range-request-middleware/commit/253386ff8c9ddf5ee423aec4319d213876a02817))
* **content_range:** add checking format of content-range header ([169b15d](https://github.com/httpland/range-request-middleware/commit/169b15d8d90fadaca9e8161c41c21e9fed84600c))
* **content_range:** add content range field deserializer ([0fe7759](https://github.com/httpland/range-request-middleware/commit/0fe775969a9117f8a2a55b402b35de9456e88790))
* **middleware:** add range middleware factory ([1926b02](https://github.com/httpland/range-request-middleware/commit/1926b027502c1666661bc3e012eaf8b0e4faf13f))
* **middleware:** add rangeRequest, contentRange and acceptRanges middleware ([03e8d6b](https://github.com/httpland/range-request-middleware/commit/03e8d6b75a003aaa382f282ee916fbec4ab5b100))
* **mod:** export types of interface ([8687894](https://github.com/httpland/range-request-middleware/commit/8687894131197c1c9a2bb95df29fd7cd7c4487cf))
* **mod:** remove unrelated types ([068dd87](https://github.com/httpland/range-request-middleware/commit/068dd87cdf0870eac0e6534a214423b6d61ca54f))
* **parser:** add range header parser ([4d5a9ab](https://github.com/httpland/range-request-middleware/commit/4d5a9ab3494f7d97b91f8f44bc8be7c0e1eea634))
* **ranges:** add ByteRange implementation ([1741e1d](https://github.com/httpland/range-request-middleware/commit/1741e1d26437bcadd2286f18dc30d6e0c54637c5))
* rename field name to `rangeUnit` from `unit` ([41aa7da](https://github.com/httpland/range-request-middleware/commit/41aa7da5170ffd1a789fa9b5135cd8a5a57c8ee3))
* **transform:** add response transformer for range headers ([0f1700c](https://github.com/httpland/range-request-middleware/commit/0f1700c2cd1bac2d5a0a57ee6419640bcd9398a1))
* **transform:** add to transformer for `accept-ranges` header field ([5f7f226](https://github.com/httpland/range-request-middleware/commit/5f7f2260efde91c7b687dc1938d9c085ecb8eff2))
* **transform:** change Range interface and transform response interface ([ff78387](https://github.com/httpland/range-request-middleware/commit/ff783875603d87702aa69393b31631f71204aacf))
* **types:** add Range API ([50d9eab](https://github.com/httpland/range-request-middleware/commit/50d9eabd343e0108527414e08f7e0565ccee2980))
* **types:** change range interface, update docs ([28b2da9](https://github.com/httpland/range-request-middleware/commit/28b2da91541b60365db43ebdaa7a120ff607cdac))
* **types:** remove object method types ([2409a96](https://github.com/httpland/range-request-middleware/commit/2409a9648e3b68d6e620d75abd261498bf14b2d0))

# [1.0.0-beta.3](https://github.com/httpland/range-request-middleware/compare/1.0.0-beta.2...1.0.0-beta.3) (2023-03-26)


### Bug Fixes

* **transform:** remove unnecessary requirements ([43900d8](https://github.com/httpland/range-request-middleware/commit/43900d8f423c563541cd2f216fa89825f0d04114))


### Features

* **accept_ranges:** add accept-ranges header parser and check that header is none strictly ([980f9b4](https://github.com/httpland/range-request-middleware/commit/980f9b4b8d6b28460db028fd75a4dd9eaff86950))

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
