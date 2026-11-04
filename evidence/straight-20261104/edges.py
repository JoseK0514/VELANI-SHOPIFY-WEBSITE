import sys, json, numpy as np
from PIL import Image, ImageDraw
from collections import deque
src, seed, rows_lr, cols_t, cols_b, out = sys.argv[1], json.loads(sys.argv[2]), json.loads(sys.argv[3]), json.loads(sys.argv[4]), json.loads(sys.argv[5]), sys.argv[6]
thr = json.loads(sys.argv[7]) if len(sys.argv) > 7 else None
a = np.asarray(Image.open(src).convert('RGB')).astype(int)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
lum = (R + G + B) / 3
m = eval(thr) if thr else ((B > 120) & (B > R + 25))
H, W = m.shape; seen = np.zeros_like(m, bool); q = deque([tuple(seed[::-1])]); seen[seed[1], seed[0]] = True
while q:
    y, x = q.popleft()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny, nx = y+dy, x+dx
        if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx] and m[ny, nx]: seen[ny, nx] = True; q.append((ny, nx))
c = seen
print('component px', c.sum())
def fit(pts):  # fit x = a*y + b or y = a*x + b
    p = np.array(pts, float); A = np.vstack([p[:, 0], np.ones(len(p))]).T; k, b = np.linalg.lstsq(A, p[:, 1], rcond=None)[0]; return k, b
L = [(y, np.argmax(c[y])) for y in range(*rows_lr) if c[y].any()]
Rr = [(y, W - 1 - np.argmax(c[y][::-1])) for y in range(*rows_lr) if c[y].any()]
T = [(x, np.argmax(c[:, x])) for x in range(*cols_t) if c[:, x].any()]
Bm = [(x, H - 1 - np.argmax(c[::-1, x])) for x in range(*cols_b) if c[:, x].any()]
kl, bl = fit(L); kr, br = fit(Rr); kt, bt = fit(T); kb, bb = fit(Bm)  # x = kl*y+bl ; y = kt*x+bt
def inter(kx, bx, ky, by):  # x = kx*y + bx ; y = ky*x + by
    y = (ky * bx + by) / (1 - ky * kx); return [round(kx * y + bx, 1), round(y, 1)]
quad = [inter(kl, bl, kt, bt), inter(kr, br, kt, bt), inter(kr, br, kb, bb), inter(kl, bl, kb, bb)]
print(json.dumps(quad))
im = Image.open(src).convert('RGB'); d = ImageDraw.Draw(im); d.polygon([tuple(p) for p in quad], outline=(255, 0, 0)); im.save(out)
