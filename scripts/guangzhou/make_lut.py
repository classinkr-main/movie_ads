"""Generate a 33^3 .cube 'vlog cinematic' look LUT (input/output: BT.709 gamma-encoded RGB)."""
import numpy as np, sys
N = 33
def look(rgb, lift=0.93, contrast=0.17, sat=1.14, matte=0.016, warm=1.15):
    x = np.clip(rgb, 0, 1)
    # 1) gentle midtone lift
    x = x ** lift
    # 2) filmic S-curve around pivot via smoothstep blend
    p = 0.46
    s = np.where(x < p, p * (x / p) ** (1 + contrast), 1 - (1 - p) * ((1 - x) / (1 - p)) ** (1 + contrast))
    x = s
    # luminance (Rec.709)
    l = (0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2])[..., None]
    # 3) saturation (less in bright highlights to avoid neon clipping)
    sat_l = sat - (sat - 1.0) * np.clip((l - 0.8) / 0.2, 0, 1)
    x = l + (x - l) * sat_l
    # 4) split tone: teal shadows, warm highlights
    sh = (1 - l) ** 2.2
    hi = l ** 2.0
    x = x + sh * np.array([-0.018, 0.004, 0.022]) * warm + hi * np.array([0.022, 0.008, -0.020]) * warm
    # 5) highlight roll-off
    k = 0.90
    x = np.where(x > k, k + (1 - k) * np.tanh((x - k) / (1 - k)), x)
    # 6) matte black
    x = matte + (1 - matte) * x
    return np.clip(x, 0, 1)
def write(path, **kw):
    g = np.linspace(0, 1, N)
    b, gg, r = np.meshgrid(g, g, g, indexing='ij')  # .cube: R changes fastest
    rgb = np.stack([r, gg, b], -1).reshape(-1, 3)
    out = look(rgb, **kw)
    with open(path, 'w') as f:
        f.write(f'TITLE "classin-vlog"\nLUT_3D_SIZE {N}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
        for v in out: f.write(f'{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n')
if __name__ == '__main__':
    import os
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(out, exist_ok=True)
    write(os.path.join(out, 'look.cube'))
    write(os.path.join(out, 'look_night.cube'), lift=0.97, contrast=0.20, sat=1.18, matte=0.012)
    write(os.path.join(out, 'look_photo.cube'), lift=0.97, contrast=0.08, sat=1.06, matte=0.014, warm=0.7)
    print('luts ->', out)
