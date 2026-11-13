"""Lighting-only edit: exposure / highlights / shadows / local brightness.
Every adjustment is a per-pixel luminance gain applied equally to R,G,B in
linear light, so hue and saturation ratios (makeup shades, skin undertone)
are unchanged and pixel structure (pores, texture, edges) is untouched."""
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src)
rgb = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0
H, W, _ = rgb.shape

def to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)

lin = to_lin(rgb)
Y = 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

def blob(cx, cy, sx, sy, angle=0.0):
    a = np.deg2rad(angle)
    dx, dy = xx - cx, yy - cy
    u = dx * np.cos(a) + dy * np.sin(a)
    v = -dx * np.sin(a) + dy * np.cos(a)
    return np.exp(-0.5 * ((u / sx) ** 2 + (v / sy) ** 2))

# --- Light map (stops of exposure) -------------------------------------
# Face is tilted ~ -25deg (head leaning to image-left). Key light: frontal,
# just above eye level, so the upper planes of the face get most of it.
face = blob(2080, 1560, 620, 820, -25)                # whole face, gentle
stops = 0.30 * face
stops += 0.10 * blob(1960, 1000, 380, 220, -25)        # forehead
stops += 0.24 * blob(2150, 1430, 110, 260, -25)        # nose bridge
stops += 0.30 * blob(1740, 1700, 230, 170, -25)        # cheekbone (image-left, the darker side)
stops += 0.06 * blob(2430, 1460, 200, 160, -25)        # cheekbone (image-right, already lit)
stops += 0.12 * blob(1840, 1470, 220, 120, -25)        # eye area L - shows shadow blending
stops += 0.10 * blob(2320, 1280, 220, 120, -25)        # eye area R
# Light falls off below: keep jaw / under-chin / under-nose shadows defined.
stops -= 0.12 * blob(2300, 2160, 420, 160, -25)        # under-jaw / chin underside
stops -= 0.08 * blob(2200, 1770, 120, 50, -25)         # nose shadow (keep shape)
# Spill onto neck/shoulders/hand, tiny; none on the background edges.
stops += 0.06 * blob(2050, 2300, 1300, 1200, 0)
gain = 2.0 ** stops

# --- Highlights: lift existing highlights but roll off before clipping ---
Yg = Y * gain
knee, ceil = 0.42, 0.82
over = np.clip((Yg - knee) / (1 - knee), 0, None)
Yh = np.where(Yg > knee, knee + (ceil - knee) * (1 - np.exp(-over * (1 - knee) / (ceil - knee))), Yg)
# never darken an original highlight below its starting value
Yh = np.maximum(Yh, np.minimum(Y, Yg))

# --- Shadows: open deep face shadows slightly, keep them darker than mids --
face_w = np.clip(face * 1.3, 0, 1)
s = np.clip(1 - Yh / 0.06, 0, 1) ** 2                  # only the deepest tones
Ys = Yh * (1 + 0.35 * s * face_w)

ratio = Ys / np.maximum(Y, 1e-6)
out_lin = lin * ratio[..., None]
# guard: if any channel would clip, scale the pixel down uniformly (keeps hue)
# (only for pixels we brightened; originally-bright pixels keep their value)
mx = out_lin.max(axis=2, keepdims=True)
limit = np.maximum(0.985, lin.max(axis=2, keepdims=True))
out_lin = np.where(mx > limit, out_lin * (limit / mx), out_lin)

out = (to_srgb(out_lin) * 255 + 0.5).astype(np.uint8)
kw = {k: im.info[k] for k in ("exif", "icc_profile", "dpi") if k in im.info}
Image.fromarray(out).save(dst, quality=97, subsampling=0, **kw)

clip0 = (rgb.max(axis=2) >= 0.995).mean() * 100
clip1 = (out.max(axis=2) >= 254).mean() * 100
print(f"clipped px before {clip0:.3f}%  after {clip1:.3f}%")
print(f"max hue-preserving gain on face: {gain.max():.2f}x ({np.log2(gain.max()):.2f} EV)")
