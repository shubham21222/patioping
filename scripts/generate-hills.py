"""Procedural misty hill-country landscape. Layered fractal ridgelines with
atmospheric perspective, slope shading and valley fog. Deterministic (seeded)."""
import sys, numpy as np
from PIL import Image, ImageFilter

def smooth_noise(n, cells, rng):
    pts = rng.random(cells + 3)
    x = np.linspace(0, cells, n, endpoint=False)
    i = x.astype(int); f = x - i
    p0, p1, p2, p3 = pts[i], pts[i+1], pts[i+2], pts[i+3]
    # Catmull-Rom
    return 0.5*((2*p1) + (-p0+p2)*f + (2*p0-5*p1+4*p2-p3)*f**2 + (-p0+3*p1-3*p2+p3)*f**3)

def fractal(n, base, octaves, rng, rough=0.5):
    out = np.zeros(n); amp = 1; tot = 0
    for o in range(octaves):
        out += amp * smooth_noise(n, base * 2**o, rng); tot += amp; amp *= rough
    return out / tot

def hex2(c): return np.array([int(c[i:i+2], 16) for i in (1, 3, 5)], float)

def render(W, H, seed, out, layers_cfg, sky_top, sky_bot, fog, fade_bottom=True):
    rng = np.random.default_rng(seed)
    y = np.arange(H)[:, None] / H
    img = hex2(sky_top) * (1 - y[..., None]) + hex2(sky_bot) * y[..., None]
    img = np.broadcast_to(img, (H, W, 3)).copy()
    # soft sun glow
    yy, xx = np.mgrid[0:H, 0:W]
    glow = np.exp(-(((xx - W*0.62)/(W*0.35))**2 + ((yy - H*0.30)/(H*0.35))**2))
    img = img + glow[..., None] * (255 - img) * 0.35
    fogc = hex2(fog)
    for (base_y, amp, cells, octv, rough, color, shade, mist) in layers_cfg:
        ridge = fractal(W, cells, octv, rng, rough)
        ridge = (ridge - ridge.mean())
        ridge_y = (base_y - ridge * amp) * H  # pixel y of crest per column
        k = np.exp(-np.linspace(-3, 3, 361) ** 2); k /= k.sum()
        slope = np.convolve(np.gradient(ridge_y), k, mode="same")
        light = np.tanh(-slope * 2.5)  # lit faces lean left, smoothed so no column streaks
        col = hex2(color)
        mask = yy >= ridge_y[None, :]
        depth = np.clip((yy - ridge_y[None, :]) / (H * mist), 0, 1)
        # crest a touch lighter (snow / sunlit), valley fills with fog
        below = np.clip(yy - ridge_y[None, :], 0, None)
        reach = np.exp(-below / (H * 0.07))  # shading lives near the crest, fades into mist
        def blur(field, r):
            # separable gaussian, numpy only
            x = np.arange(-3 * r, 3 * r + 1); g = np.exp(-(x / r) ** 2 / 2); g /= g.sum()
            f = np.apply_along_axis(lambda v: np.convolve(np.pad(v, 3 * r, mode="edge"), g, "valid"), 1, field)
            return np.apply_along_axis(lambda v: np.convolve(np.pad(v, 3 * r, mode="edge"), g, "valid"), 0, f)
        sh = blur(np.broadcast_to(light[None, :] * reach, (H, W)).copy(), 9)
        layer = col[None, None, :] + sh[..., None] * shade
        crest = blur(np.exp(-below / (H*0.018)) * np.clip(light[None, :] + 0.3, 0, 1), 3) * mask
        layer = layer + crest[..., None] * (255 - layer) * 0.35
        layer = layer * (1 - depth[..., None]) + fogc * depth[..., None]
        a = mask.astype(float)
        # antialias the crest
        edge = np.clip((yy - ridge_y[None, :]) + 1, 0, 1)
        a = a * edge
        img = img * (1 - a[..., None]) + layer * a[..., None]
    if fade_bottom:
        f = np.clip((y - 0.78) / 0.22, 0, 1)[..., None] ** 1.5
        img = img * (1 - f) + hex2(sky_bot) * f
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    # faint grain so gradients don't band
    g = (rng.standard_normal((H, W, 1)) * 1.4)
    im = Image.fromarray(np.clip(np.asarray(im, float) + g, 0, 255).astype(np.uint8))
    im.save(out, quality=82, method=6)

if __name__ == "__main__":
    outdir = sys.argv[1]
    #        base_y amp  cells oct rough color      shade mist
    hero = [
        (0.40, 0.42, 3,  7, 0.58, "#c3d6e3", 22, 0.34),
        (0.52, 0.30, 4,  7, 0.55, "#adc6d8", 26, 0.28),
        (0.63, 0.20, 5,  6, 0.52, "#9bb9cf", 24, 0.22),
        (0.72, 0.12, 4,  5, 0.48, "#94b4cb", 14, 0.20),
        (0.82, 0.08, 3,  4, 0.45, "#a9c4d6", 10, 0.18),
    ]
    render(2400, 1100, 7, f"{outdir}/hills-hero.webp", hero, "#d7e7f1", "#f4f8fa", "#eef4f8")
    band = [
        (0.50, 0.32, 3, 6, 0.55, "#c9dbe6", 10, 0.32),
        (0.62, 0.22, 4, 6, 0.52, "#b4ccdc", 14, 0.26),
        (0.74, 0.14, 5, 5, 0.50, "#a4c0d4", 14, 0.22),
        (0.86, 0.08, 3, 4, 0.45, "#b7cedd", 10, 0.18),
    ]
    render(2400, 700, 21, f"{outdir}/hills-band.webp", band, "#e3eef5", "#f4f8fa", "#eef4f8")

def render_fg(W, H, seed, out, layers_cfg, fog, fade_to):
    """Foreground ridges only, transparent sky, for layering in front of UI."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W]
    rgb = np.zeros((H, W, 3)); alpha = np.zeros((H, W))
    fogc = hex2(fog); fade = hex2(fade_to)
    for (base_y, amp, cells, octv, rough, color, shade, mist) in layers_cfg:
        ridge = fractal(W, cells, octv, rng, rough); ridge -= ridge.mean()
        u = np.linspace(-1, 1, W)
        envelope = np.abs(u) ** 2.2 * 0.55  # peaks climb at the edges, valley in the middle
        ridge_y = (base_y - ridge * amp - envelope) * H
        below = np.clip(yy - ridge_y[None, :], 0, None)
        depth = np.clip(below / (H * mist), 0, 1)
        col = hex2(color)
        crest = np.exp(-below / (H * 0.03))
        layer = col + crest[..., None] * (255 - col) * 0.30
        layer = layer * (1 - depth[..., None]) + fogc * depth[..., None]
        a = np.clip(yy - ridge_y[None, :] + 1, 0, 1)
        rgb = rgb * (1 - a[..., None]) + layer * a[..., None]
        alpha = np.maximum(alpha, a)
    y = (np.arange(H) / H)[:, None]
    f = np.clip((y - 0.70) / 0.30, 0, 1)[..., None]
    rgb = rgb * (1 - f) + fade * f
    im = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), "RGBA")
    im.save(out, quality=85, method=6)

if __name__ == "__main__":
    fg = [
        (0.62, 0.40, 4, 7, 0.58, "#a9c3d6", 0, 0.60),
        (0.80, 0.26, 5, 6, 0.55, "#c4d7e5", 0, 0.45),
    ]
    render_fg(2400, 700, 33, f"{sys.argv[1]}/hills-front.webp", fg, "#eaf2f7", "#f4f8fa")
