import cv2, numpy as np
im = cv2.imread('src/s7.png'); h, w = im.shape[:2]
g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
m = (g < 18).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
scr = (lab == k).astype(np.uint8)
scr = cv2.morphologyEx(scr, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
x0, y0, bw, bh = st[k, :4]
# side edges from rows in the middle band, ignoring rows where something (a thumb) cuts in
ys = np.arange(y0 + int(bh * .12), y0 + int(bh * .88))
L = np.array([np.argmax(scr[y] > 0) for y in ys]); R = np.array([w - 1 - np.argmax(scr[y][::-1] > 0) for y in ys])
okL = np.abs(L - np.median(L)) < 8; okR = np.abs(R - np.median(R)) < 8
aL, bL = np.polyfit(ys[okL], L[okL], 1); aR, bR = np.polyfit(ys[okR], R[okR], 1)
xs = np.arange(x0 + int(bw * .2), x0 + int(bw * .8))
T = np.array([np.argmax(scr[:, x] > 0) for x in xs]); Bt = np.array([h - 1 - np.argmax(scr[::-1, x] > 0) for x in xs])
okt = np.abs(T - np.median(T)) < 40; okb = np.abs(Bt - np.median(Bt)) < 40
aT, bT = np.polyfit(xs[okt], T[okt], 1); aB, bB = np.polyfit(xs[okb], Bt[okb], 1)
def meet(ax, bx, ay, by):  # x = ax*y+bx ; y = ay*x+by
    y = (ay * bx + by) / (1 - ay * ax); return [ax * y + bx, y]
q = np.float32([meet(aL, bL, aT, bT), meet(aR, bR, aT, bT), meet(aR, bR, aB, bB), meet(aL, bL, aB, bB)])
print('corners', q.round(1).tolist(), 'slopes L %.3f R %.3f top %.3f' % (aL, aR, aT))
matte = cv2.GaussianBlur(scr.astype(np.float32), (7, 7), 0)[..., None]
M = cv2.getPerspectiveTransform(np.float32([[0, 0], [848, 0], [848, 2000], [0, 2000]]), q)
N = 48
for f in range(N):
    ui = cv2.imread(f'lockf/{f:03d}.png')
    wu = cv2.warpPerspective(ui, M, (w, h), flags=cv2.INTER_LINEAR)
    comp = (im * (1 - matte * .95) + wu * (matte * .95)).astype(np.uint8)
    s = 1.0 + 0.06 * (f / (N - 1)); W = int(1080 * s); H = int(W * h / w)
    r = cv2.resize(comp, (W, H), interpolation=cv2.INTER_AREA)
    xo = (W - 1080) // 2; yo = max(0, (H - 1920) // 2)
    out = r[yo:yo + 1920, xo:xo + 1080]
    if out.shape[0] < 1920: out = cv2.copyMakeBorder(out, 0, 1920 - out.shape[0], 0, 0, cv2.BORDER_REPLICATE)
    cv2.imwrite(f'hookf/{f:03d}.png', out)
print('hook ok')
