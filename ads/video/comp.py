import cv2, json, numpy as np, subprocess, sys
# python3 comp.py out.mp4 : composites clips/stills + overlay frames (ovf/) + hook frames (hookf/)
TL = json.load(open('tl.json')); W, H = 1080, 1920
def cover(fr):
    h, w = fr.shape[:2]; s = max(W / w, H / h)
    r = cv2.resize(fr, (int(w * s + .5), int(h * s + .5)), interpolation=cv2.INTER_AREA)
    y = (r.shape[0] - H) // 2; x = (r.shape[1] - W) // 2; return r[y:y + H, x:x + W]
def zoom(b, z, anchor=0.5):
    if z <= 1.001: return b
    r = cv2.resize(b, None, fx=z, fy=z, interpolation=cv2.INTER_LINEAR)
    y = int((r.shape[0] - H) * anchor); x = (r.shape[1] - W) // 2; return r[y:y + H, x:x + W]
def grade(b, g):
    if not g: return b
    f = (b.astype(np.float32) / 255) ** g.get('gamma', 1.0)
    return np.clip(f * 255, 0, 255).astype(np.uint8)
clips = {}
def load(n):
    if n not in clips:
        cap = cv2.VideoCapture(f'src/c{n}.mp4'); fr = []
        while True:
            ok, f = cap.read()
            if not ok: break
            fr.append(f)
        clips[n] = fr
    return clips[n]
def pick_off(fr, need, calm):
    g = [cv2.cvtColor(cv2.resize(f, (90, 160)), cv2.COLOR_BGR2GRAY).astype(np.float32) for f in fr]
    m = [0] + [float(np.abs(g[i] - g[i - 1]).mean()) for i in range(1, len(g))]
    L = int(need * 24) + 1; cand = []
    for s in range(int(0.25 * 24), len(fr) - L): cand.append((sum(m[s:s + L]), s))
    if not cand: return 0.25
    v, s = (min if calm else max)(cand); return s / 24
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                      '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-shortest', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
                      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', sys.argv[1]], stdin=subprocess.PIPE)
F = 0; log = []
for s in TL:
    n = s['b'] * 16; g = s.get('grade', {})
    if s.get('clip'):
        fr = load(s['clip']); off = pick_off(fr, n / 30, s.get('pick') == 'calm'); log.append((s['id'], round(off, 2)))
    if s.get('still'): st = cover(cv2.imread(s['still']))
    for f in range(n):
        ov = cv2.imread(f'ovf/{F:04d}.png', cv2.IMREAD_UNCHANGED)
        if s.get('src') == 'hook': base = cv2.imread(f'hookf/{min(f, 47):03d}.png')
        elif s.get('clip'):
            i = min(len(fr) - 1, int(round((off + f / 30) * 24)))
            base = zoom(grade(cover(fr[i]), g), g.get('zoom', 1.0) + 0.05 * f / n, g.get('anchor', 0.5))
        elif s.get('still'): base = zoom(st, 1.0 + 0.08 * f / n)
        else: base = np.zeros((H, W, 3), np.uint8)
        if ov is not None and ov.shape[2] == 3: base = ov          # opaque card rendered in HTML
        elif ov is not None:
            a = ov[..., 3:4].astype(np.float32) / 255; base = (base * (1 - a) + ov[..., :3] * a).astype(np.uint8)
        p.stdin.write(base.tobytes()); F += 1
p.stdin.close(); p.wait(); print('frames', F, log)
