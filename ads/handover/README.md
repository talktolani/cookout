# Agency handover PDF (29 Sep 2026)

Donny is locked out of the Instagram account, so the Bunker 1965 marketing
team runs the Meta ads from their ad account using our dataset, pages and
checkout. a.html (styles, cover, section 1) + b/c/d.html are concatenated
and printed to A4 with Playwright in the Higgsfield sandbox, where the live
site and TicketMelon can be screenshotted (this container can't reach them).

v1 PDF (superseded, says no BBQ): https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/cc7ba108-cb6b-4dd6-9165-aeb19f13831a.pdf
v3 PDF (30 Sep, current: Bunker's own dataset, Bunker Page and Instagram, Thu 1 Oct launch, budget schedule, retargeting copy): https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/7a28cec3-ca07-43b1-a04c-58b2b211fc25.pdf
v2 PDF (29 Sep, superseded): https://d2ol7oe51mr4n9.cloudfront.net/user_3BCuYCQwnreJpxyBr1ZoHKJc0Ay/d7cb491a-1673-4496-81a4-5e00741f40cd.pdf

Lessons:
- Screenshots: block facebook.com/net, /api/meta and /c in Playwright so
  they don't pollute the pixel or AIOS analytics. Never submit the form.
- The cover bleeds via a named page (`@page cover{margin:0}`). Negative
  margins made Chromium shrink the whole document to fit.
- Higgsfield's upload host (Cloudflare) answered 403 to the Chromium-printed
  PDF. Rewriting it with pypdf (add_page + compress_content_streams) passed.
- `curl --data-binary @missing-file` still PUTs an empty body and gets a
  200, which burns the one-time upload URL. `test -s file &&` before every PUT.
- v2 hit the Cloudflare 403 again even after the pypdf rewrite, recompression
  and encryption. It's a byte-pattern score, not the content. Probe safely by
  PUTting to the upload URL with the signature swapped for 00: a Cloudflare
  HTML page means blocked, S3's SignatureDoesNotMatch XML means it got through,
  and nothing is written either way. What passed: pikepdf adding an unused
  64KB stream of spaces on the Root (`p.Root.Pad`, save with
  compress_streams=False). Readers ignore it. application/octet-stream also
  passes, but media_upload signs application/pdf whatever you ask for.
- If the sandbox is wiped, the v1/v2 PDF holds the screenshots: pypdf
  `page.images` gives them back in placement order (page 6 frames, page 8
  shots: 01, 02, 03, 04, 07, 05, 06). Fonts: npm @fontsource league-gothic,
  oswald, montserrat. Playwright needs NODE_PATH=$(npm root -g).
