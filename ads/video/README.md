# Video ad builder (hype ad, 28 Sep 2026)

Runs in the Higgsfield sandbox (ffmpeg, Playwright, Chromium, cv2). This
container can't reach the Higgsfield CDN, so the build happens there.

Order: push these files into /home/user/ed with heredocs, then
`bash setup.sh` (fonts, QR, downloads stills and clips), inject the logo and QR
into ov.html (replace `__LOGO__` / `__QR__`), `node render.js lock`,
`python3 hook.py`, `node render.js ov <from> <to>` in 4 parallel slices,
`python3 comp.py hype_9x16.mp4`, then crop 4:5 with `crop=1080:1350:0:285`.
Upload with media_upload, PUT from the sandbox with `If-None-Match: *`
(retry once on a 5xx), then media_confirm.

- **tl.json is the edit.** 16 frames per beat at 30fps (about 112 BPM).
  A segment is a `clip` (Kling job), a `still` (push-in only), the phone
  `hook`, or an HTML card (`type`, `strobe`, `logo`, `info`, `end`).
- **Lessons from v1 (Donny's notes, 28 Sep):**
  - Phone screen fit: approxPolyDP corners on a rounded screen tilt the
    overlay. hook.py fits each edge with a line over rows or columns that
    agree with the median, then checks the OCR baseline tilt is about 0.
  - Food clips use `"pick": "calm"` (the least-motion window). The
    most-motion window picked AI artifacts (onions "falling" off the hot
    dog). If a clip still looks wrong, use the still with a push-in.
  - The crew clip read as washed out: `grade` gamma 1.4 plus a 1.14 zoom
    anchored low to cut the sky.
  - Playwright saves a fully opaque card as a 3-channel PNG. comp.py treats
    a 3-channel overlay as the whole frame, otherwise those cards go black.
  - The sandbox is wiped about 10s after the last call and sometimes
    between turns: keep a `sleep 890` background job running and keep
    every script here, not only in the sandbox.
