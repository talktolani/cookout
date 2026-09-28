import cv2, numpy as np, os, sys
# Moving hook: the lock-screen UI tracked onto the black phone screen in a Kling clip (src/c7.mp4).
def screen(im):
    h, w = im.shape[:2]; g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    m = cv2.morphologyEx((g < 20).astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    cx = st[1:, 0] + st[1:, 2] / 2; cy = st[1:, 1] + st[1:, 3] / 2
    score = st[1:, 4] * (np.abs(cx - w / 2) < w * .25) * (np.abs(cy - h / 2) < h * .25)
    k = 1 + int(np.argmax(score))
    scr = cv2.morphologyEx((lab == k).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))
    x0, y0, bw, bh = st[k, :4]
    ys = np.arange(y0 + int(bh * .12), y0 + int(bh * .88))
    L = np.array([np.argmax(scr[y] > 0) for y in ys]); R = np.array([w - 1 - np.argmax(scr[y][::-1] > 0) for y in ys])
    okL = np.abs(L - np.median(L)) < 6; okR = np.abs(R - np.median(R)) < 6
    aL, bL = np.polyfit(ys[okL], L[okL], 1); aR, bR = np.polyfit(ys[okR], R[okR], 1)
    xs = np.arange(x0 + int(bw * .2), x0 + int(bw * .8))
    T = np.array([np.argmax(scr[:, x] > 0) for x in xs]); B = np.array([h - 1 - np.argmax(scr[::-1, x] > 0) for x in xs])
    okt = np.abs(T - np.median(T)) < 25; okb = np.abs(B - np.median(B)) < 25
    aT, bT = np.polyfit(xs[okt], T[okt], 1); aB, bB = np.polyfit(xs[okb], B[okb], 1)
    def meet(ax, bx, ay, by):
        y = (ay * bx + by) / (1 - ay * ax); return [ax * y + bx, y]
    q = np.float32([meet(aL, bL, aT, bT), meet(aR, bR, aT, bT), meet(aR, bR, aB, bB), meet(aL, bL, aB, bB)])
    return q, scr
cap = cv2.VideoCapture('src/c7.mp4'); fr = []
while True:
    ok, f = cap.read()
    if not ok: break
    fr.append(f)
N = 48; off = float(sys.argv[1]) if len(sys.argv) > 1 else 0.3
idx = [min(len(fr) - 1, int(round((off + f / 30) * 24))) for f in range(N)]
Q = []; S = {}
for i in sorted(set(idx)):
    q, scr = screen(fr[i]); Q.append((i, q)); S[i] = scr
qi = {i: q for i, q in Q}
arr = np.array([qi[i] for i, _ in Q]); bad = 0
wT = np.median(arr[:, 1, 0] - arr[:, 0, 0]); wB = np.median(arr[:, 2, 0] - arr[:, 3, 0])
hL = np.median(arr[:, 3, 1] - arr[:, 0, 1]); hR = np.median(arr[:, 2, 1] - arr[:, 1, 1])
for j in range(len(arr)):  # the screen can't change size: an edge that jumps is a mis-detect (dark background merging), rebuild it from the opposite edge
    q = arr[j]
    if abs((q[1, 0] - q[0, 0]) - wT) > 12 or abs((q[2, 0] - q[3, 0]) - wB) > 12:
        q[1] = [q[0, 0] + wT, q[0, 1]]; q[2] = [q[3, 0] + wB, q[3, 1]]; bad += 1
    if abs((q[3, 1] - q[0, 1]) - hL) > 12: q[3, 1] = q[0, 1] + hL; bad += 1
    if abs((q[2, 1] - q[1, 1]) - hR) > 12: q[2, 1] = q[1, 1] + hR; bad += 1
fx = arr.copy()
for j in range(len(arr)):  # then drop any corner that still jumps away from its neighbours' median
    med = np.median(arr[max(0, j - 4):j + 5], axis=0); off_ = np.abs(arr[j] - med).max(axis=1) > 18
    fx[j][off_] = med[off_]; bad += int(off_.any())
sm = fx.copy()
for j in range(len(fx)):  # smooth corner jitter over +-2 source frames
    sm[j] = fx[max(0, j - 2):j + 3].mean(0)
print('corrections', bad)
qs = {i: sm[j] for j, (i, _) in enumerate(Q)}
d = np.abs(sm - sm[0]).max(); print('source frames', len(fr), 'max corner drift px %.1f' % d, 'first', arr[0].round(0).tolist())
os.makedirs('hookf', exist_ok=True)
src = np.float32([[0, 0], [848, 0], [848, 2000], [0, 2000]])
for f in range(N):
    im = fr[idx[f]]; h, w = im.shape[:2]
    M = cv2.getPerspectiveTransform(src, qs[idx[f]])
    wu = cv2.warpPerspective(cv2.imread(f'lockf/{f:03d}.png'), M, (w, h), flags=cv2.INTER_LINEAR)
    # matte = warped screen shape AND this frame's dark pixels, so a thumb over the edge stays in front
    shape = cv2.warpPerspective(np.ones((2000, 848), np.float32), M, (w, h))
    matte = cv2.GaussianBlur(np.minimum(shape, cv2.dilate(S[idx[f]], np.ones((5, 5), np.uint8)).astype(np.float32)), (5, 5), 0)[..., None]
    comp = (im * (1 - matte * .96) + wu * (matte * .96)).astype(np.uint8)
    s = 1.0 + 0.05 * f / (N - 1); W = int(1080 * s); H = int(W * h / w)
    r = cv2.resize(comp, (W, H), interpolation=cv2.INTER_CUBIC)
    xo = (W - 1080) // 2; yo = max(0, (H - 1920) // 2); out = r[yo:yo + 1920, xo:xo + 1080]
    if out.shape[0] < 1920: out = cv2.copyMakeBorder(out, 0, 1920 - out.shape[0], 0, 0, cv2.BORDER_REPLICATE)
    cv2.imwrite(f'hookf/{f:03d}.png', out)
print('hook ok')
