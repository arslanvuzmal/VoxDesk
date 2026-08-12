# Browser Security Headers

VoxDesk applies a response-header baseline to every application route through `next.config.ts`.

| Header                  | Policy                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Content Security Policy | Restricts scripts, frames, connections, media, forms, and object sources. Browser connections to ElevenLabs are explicitly allowed for configured web voice. |
| Permissions Policy      | Allows microphone access only to the application origin and disables camera, geolocation, payment, and USB APIs.                                             |
| Frame protections       | CSP `frame-ancestors 'none'` and `X-Frame-Options: DENY` prevent embedding.                                                                                  |
| Referrer Policy         | Sends only origin information on cross-origin navigation.                                                                                                    |
| Content type protection | Disables MIME sniffing.                                                                                                                                      |
| Transport security      | Enables HSTS for HTTPS deployments.                                                                                                                          |
| Opener isolation        | Uses `same-origin` opener isolation.                                                                                                                         |

Development permits `unsafe-eval` because the Next.js development toolchain requires it. Production and test builds do not. Inline scripts and styles remain permitted for framework compatibility; tightening these to nonce-based directives is a tracked defense-in-depth opportunity.

These headers reduce browser attack surface. They do not replace output escaping, authorization, webhook verification, or provider-side controls.
