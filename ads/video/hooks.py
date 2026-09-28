import cv2, numpy as np, os, sys
# Moving hook, v4 (29 Sep): stabilise the Kling clip on the phone (ECC on a ring around the phone edge:
# bezel, thumb, fingers), so the phone, hand and screen graphics stay still and only the background moves.
# The screen quad is fixed from the reference frame. Needs: pip install "rembg[cpu]" (isnet-general-use).
exec(open('hookv.py').read().split("cap = cv2.VideoCapture")[0])   # reuses screen()
from rembg import remove, new_session
cap = cv2.VideoCapture('src/c7.mp4'); fr = []
while True:
    ok, f = cap.read()
    if not ok: break
    fr.append(f)
N = 48; off = float(sys.argv[1]) if len(sys.argv) > 1 else 0.3
idx = [min(len(fr) - 1, int(round((off + f / 30) * 24))) for f in range(N)]
ref = fr[idx[0]]; h, w = ref.shape[:2]
pm = remove(cv2.cvtColor(ref, cv2.COLOR_BGR2RGB), session=new_session('isnet-general-use'), only_mask=True, post_process_mask=True)
band = cv2.dilate((pm > 128).astype(np.uint8), np.ones((81, 81), np.uint8)) - cv2.erode((pm > 128).astype(np.uint8), np.ones((31, 31), np.uint8))
mask = (band > 0).astype(np.uint8) * 255
g0 = cv2.GaussianBlur(cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY), (5, 5), 0).astype(np.float32)
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)
warp = np.eye(2, 3, dtype=np.float32); stab = {}
for i in sorted(set(idx)):
    gi = cv2.GaussianBlur(cv2.cvtColor(fr[i], cv2.COLOR_BGR2GRAY), (5, 5), 0).astype(np.float32)
    try: _, warp = cv2.findTransformECC(g0, gi, warp, cv2.MOTION_EUCLIDEAN, crit, mask, 5)
    except cv2.error: pass
    stab[i] = cv2.warpAffine(fr[i], warp, (w, h), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)
q0, _ = screen(ref)
drift = [np.abs(screen(stab[i])[0] - q0)[[0, 3], 0].max() for i in sorted(stab)]
print('ref quad', q0.round(0).tolist(), 'left-edge drift after stabilising: median %.1f max %.1f px' % (np.median(drift), np.max(drift)))
os.makedirs('hookf', exist_ok=True)
src = np.float32([[0, 0], [848, 0], [848, 2000], [0, 2000]]); M = cv2.getPerspectiveTransform(src, q0)
shape = cv2.warpPerspective(np.ones((2000, 848), np.float32), M, (w, h))
_, scr0 = screen(ref); matte = cv2.GaussianBlur(np.minimum(shape, cv2.dilate(scr0, np.ones((5, 5), np.uint8)).astype(np.float32)), (5, 5), 0)[..., None]
for f in range(N):
    im = stab[idx[f]]
    wu = cv2.warpPerspective(cv2.imread(f'lockf/{f:03d}.png'), M, (w, h), flags=cv2.INTER_LINEAR)
    comp = (im * (1 - matte * .96) + wu * (matte * .96)).astype(np.uint8)
    s = 1.08; W = int(1080 * s); H = int(W * h / w)   # fixed scale: no push-in, the phone must not move
    r = cv2.resize(comp, (W, H), interpolation=cv2.INTER_CUBIC)
    xo = (W - 1080) // 2; yo = max(0, (H - 1920) // 2); out = r[yo:yo + 1920, xo:xo + 1080]
    if out.shape[0] < 1920: out = cv2.copyMakeBorder(out, 0, 1920 - out.shape[0], 0, 0, cv2.BORDER_REPLICATE)
    cv2.imwrite(f'hookf/{f:03d}.png', out)
print('hook ok')
