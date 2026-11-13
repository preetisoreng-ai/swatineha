"""Dewy-skin pass on top of relit.jpg:
 - soften skin (edge-preserving guided filter) while adding fine texture back
 - luminous sheen grown from the photo's own highlights (forehead, nose, cheekbones, chin)
 - glossy, softer lips
Eyes, brows, lashes, hair, jewellery and clothes are masked out."""
import sys
import cv2
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
SOFT, DETAIL, GLOW, LIPGLOSS = 0.9, 0.5, 0.65, 0.75
if len(sys.argv) > 3:
    SOFT, DETAIL, GLOW, LIPGLOSS = map(float, sys.argv[3:7])

bgr = cv2.imread(src).astype(np.float32) / 255.0
H, W = bgr.shape[:2]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def ell(cx, cy, sx, sy, ang=-25, feather=0.35):
    a = np.deg2rad(ang)
    dx, dy = xx - cx, yy - cy
    u = dx * np.cos(a) + dy * np.sin(a)
    v = -dx * np.sin(a) + dy * np.cos(a)
    r = np.sqrt((u / sx) ** 2 + (v / sy) ** 2)
    return np.clip((1 - r) / feather, 0, 1)

def blur(x, s):
    return cv2.GaussianBlur(x, (0, 0), s)

def guided(I, p, r, eps):
    k = (2 * r + 1, 2 * r + 1)
    mI, mp = cv2.blur(I, k), cv2.blur(p, k)
    cov = cv2.blur(I * p, k) - mI * mp
    var = cv2.blur(I * I, k) - mI * mI
    a = cov / (var + eps)
    b = mp - a * mI
    return cv2.blur(a, k) * I + cv2.blur(b, k)

# ---------- masks ----------
hsv = cv2.cvtColor((bgr * 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
h, s, v = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
skin_col = ((h > 4) & (h < 38) & (s > 0.10) & (s < 0.70) & (v > 0.22)).astype(np.float32)
region = np.maximum.reduce([
    ell(2080, 1560, 700, 900, -25, 0.15),      # face
    ell(2150, 2550, 520, 420, 0, 0.3),         # neck / chest
    ell(2750, 2550, 650, 350, -30, 0.3),       # hand
    ell(3550, 3550, 450, 900, -10, 0.3),       # forearm
])
eyes = np.maximum(ell(1840, 1440, 260, 140, -25, 0.5), ell(2320, 1250, 260, 140, -25, 0.5))
lips = ell(2275, 1925, 300, 125, -22, 0.45)
skin = skin_col * region * (1 - eyes) * (1 - lips)
skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
skin = blur(skin, 6)

# ---------- 1. soft skin, texture kept ----------
fine = bgr - blur(bgr, 1.4)                      # pores / freckles / product texture
smooth = np.dstack([guided(bgr[..., c], bgr[..., c], 14, 0.0015) for c in range(3)])
soft = smooth + DETAIL * fine
out = bgr + (soft - bgr) * (skin * SOFT)[..., None]

# ---------- 2. dewy glow from the photo's own highlights ----------
Y = 0.114 * out[..., 0] + 0.587 * out[..., 1] + 0.299 * out[..., 2]
# (a) luminous high planes: brightness gain that keeps hue + saturation (skin tone stays rich)
hi = np.clip((Y - 0.50) / 0.40, 0, 1) ** 1.6 * skin
# areas that are already near-white get less extra light, so their texture survives
already = 1 - np.clip((blur(Y, 10) - 0.72) / 0.18, 0, 1) * 0.75
sheen = (0.5 * blur(hi, 14) + 0.5 * blur(hi, 45)) * already
lum = out * (1 + GLOW * 0.55 * sheen)[..., None]
m = lum.max(axis=2, keepdims=True)                # roll off instead of clipping, hue-safe
lum = np.where(m > 0.93, lum * (0.93 + 0.07 * np.tanh((m - 0.93) / 0.07)) / m, lum)
out = lum
# (b) small dewy specular sheen only on the very top of the highlights
spec = np.clip((Y - 0.70) / 0.25, 0, 1) ** 2 * skin
sp = (blur(spec, 8) * 0.6 + blur(spec, 22) * 0.4) * GLOW * 0.45 * already
tint = 0.75 + 0.25 * blur(out, 20)                # near-white, warmed by the skin
out = 1 - (1 - out) * (1 - sp[..., None] * tint)

# ---------- 3. softer, glossier lips ----------
lip_sm = np.dstack([guided(out[..., c], out[..., c], 8, 0.0008) for c in range(3)])
out = out + (lip_sm + 0.6 * (out - blur(out, 1.2)) - out) * (lips * 0.6)[..., None]
Yl = 0.114 * out[..., 0] + 0.587 * out[..., 1] + 0.299 * out[..., 2]
spec = np.clip((Yl - 0.55) / 0.35, 0, 1) * lips
gloss = blur(spec, 6) * LIPGLOSS
out = 1 - (1 - out) * (1 - gloss[..., None] * (0.35 + 0.65 * out))

out = np.clip(out, 0, 1)
cv2.imwrite(dst, (out * 255 + 0.5).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 97])
cv2.imwrite(dst.rsplit('.', 1)[0] + '_mask.jpg', (np.dstack([skin, lips, eyes]) * 255).astype(np.uint8))
