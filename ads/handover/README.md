# Agency handover PDF (29 Sep 2026)

Donny is locked out of the Instagram account, so the Bunker 1965 marketing
team runs the Meta ads from their ad account using our dataset, pages and
checkout. a.html (styles, cover, section 1) + b/c/d.html are concatenated
and printed to A4 with Playwright in the Higgsfield sandbox, where the live
site and TicketMelon can be screenshotted (this container can't reach them).

v1 PDF: https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/cc7ba108-cb6b-4dd6-9165-aeb19f13831a.pdf

Lessons:
- Screenshots: block facebook.com/net, /api/meta and /c in Playwright so
  they don't pollute the pixel or AIOS analytics. Never submit the form.
- The cover bleeds via a named page (`@page cover{margin:0}`). Negative
  margins made Chromium shrink the whole document to fit.
- Higgsfield's upload host (Cloudflare) answered 403 to the Chromium-printed
  PDF. Rewriting it with pypdf (add_page + compress_content_streams) passed.
- `curl --data-binary @missing-file` still PUTs an empty body and gets a
  200, which burns the one-time upload URL. `test -s file &&` before every PUT.
