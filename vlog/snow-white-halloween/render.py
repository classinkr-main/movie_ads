"""Render the Snow White vlog from the edit decision list in edl.py.

usage: python render.py <raw_dir> <sfx_dir> <fonts_dir> <work_dir> <out.mp4> [--preview] [--edl=edl_shorts]

--edl picks the edit list module: edl (16:9 vlog, default) or edl_shorts (9:16 shorts).

Pipeline
  1. each shot -> work/seg/<hash>.mkv (29.97p H.264 + PCM at the output size), exact frame count
  2. concat segments, burn ASS captions, mix synthesized SFX track
  3. static gain to -15 LUFS integrated, limiter keeps peaks under ~-1.5 dBFS
"""
import hashlib, importlib, json, os, subprocess, sys, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
EDL = importlib.import_module(next((a[6:] for a in sys.argv if a.startswith("--edl=")), "edl"))
SHOTS, CLIP_GAIN_DB = EDL.SHOTS, EDL.CLIP_GAIN_DB

FPS_NUM, FPS_DEN = 30000, 1001
FPS = FPS_NUM / FPS_DEN
SRC_W, SRC_H = 1920, 1080
W, H = getattr(EDL, "SIZE", (SRC_W, SRC_H))
VERTICAL = H > W
# vertical output: the picture sits in a window (width W, height WIN_H, top WIN_Y) on a black canvas
WIN_H, WIN_Y = getattr(EDL, "VIDEO_WINDOW", (H, 0))
SR = 48000

raw_dir, sfx_dir, fonts_dir, work, out_path = sys.argv[1:6]
PREVIEW = "--preview" in sys.argv
ONLY = None
for a in sys.argv:
    if a.startswith("--only="):
        ONLY = set(int(x) for x in a[7:].split(","))
seg_dir = os.path.join(work, "seg")
os.makedirs(seg_dir, exist_ok=True)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(" ".join(cmd)[:3000])
        print(r.stderr[-3000:])
        raise SystemExit(1)
    return r


def nframes(d):
    return max(1, int(round(d * FPS)))


# ---------------------------------------------------------------- timeline
timeline = []
t_out = 0.0
for i, s in enumerate(SHOTS):
    if s["kind"] == "clip":
        dur = (s["b"] - s["a"]) / s.get("speed", 1.0)
    else:
        dur = s["dur"]
    n = nframes(dur)
    timeline.append({"i": i, "start": t_out, "n": n, "dur": n / FPS, "shot": s})
    t_out += n / FPS
TOTAL = t_out
print(f"{len(SHOTS)} shots, total {TOTAL:.2f}s")


# ---------------------------------------------------------------- video filters
def smooth(p):
    return f"(({p})*({p})*(3-2*({p})))"


def zoom_chain(s, dur):
    """scale-up + crop for zoom / punch-in / shake. returns filter list."""
    z = s.get("zoom")  # (z0, z1, cx, cy[, ramp_seconds])
    shake = s.get("shake")  # (amp_px, decay_per_s, start_s)
    whip = s.get("whip")  # zoom-blur in at the start
    if not (z or shake or whip):
        return []
    z0, z1, cx, cy = (z[:4] if z else (1.0, 1.0, 0.5, 0.5))
    ramp = (z[4] if z and len(z) > 4 else dur)
    if shake:
        z0, z1 = max(z0, 1.06), max(z1, 1.06)
    p = f"min(t/{ramp:.4f}\\,1)"
    zexpr = f"({z0}+({z1}-{z0})*{smooth(p)})" if z0 != z1 else f"{z0}"
    if whip:
        # extra 1.35x -> 1x over the first 0.2s
        zexpr = f"({zexpr})*(1+0.35*max(0\\,1-t/0.2)*max(0\\,1-t/0.2))"
    f = [f"scale=w='trunc({W}*{zexpr}/2)*2':h='trunc({H}*{zexpr}/2)*2':eval=frame:flags=bicubic"]
    xs = f"(iw-{W})*{cx}"
    ys = f"(ih-{H})*{cy}"
    if shake:
        amp, dec, st = shake
        env = f"if(gte(t\\,{st})\\,{amp}*exp(-{dec}*(t-{st}))\\,0)"
        xs = f"{xs}+{env}*sin(t*61)"
        ys = f"{ys}+{env}*cos(t*47)"
    f.append(f"crop={W}:{H}:x='max(0\\,min(iw-{W}\\,{xs}))':y='max(0\\,min(ih-{H}\\,{ys}))'")
    return f


def piecewise(kfs):
    """ffmpeg expression for linear interpolation through [(t, value), ...] in shot time."""
    kfs = sorted(kfs)
    expr = f"{kfs[-1][1]}"
    for (t0, x0), (t1, x1) in reversed(list(zip(kfs, kfs[1:]))):
        if t1 - t0 < 1e-3:
            continue
        expr = f"if(lt(t\\,{t1:.3f})\\,{x0}+({x1 - x0})*(t-{t0:.3f})/{t1 - t0:.3f}\\,{expr})"
    return f"if(lt(t\\,{kfs[0][0]:.3f})\\,{kfs[0][1]}\\,{expr})"


def vertical_reframe(s, dur):
    """crop a WIN-aspect window that follows `vcx` keyframes (source px), scale into the window."""
    z = s.get("vzoom", 1.0)
    ch = int(round(SRC_H / z / 2)) * 2
    cw = int(round(ch * W / WIN_H / 2)) * 2
    cy = s.get("vcy", 0.5)
    speed = s.get("speed", 1.0)
    kfs = s.get("vcx") or [(s.get("a", 0), SRC_W // 2)]
    if s["kind"] == "clip":
        kfs = [((t - s["a"]) / speed, x) for t, x in kfs]
    else:
        kfs = [(0.0, kfs[0][1])]
    x = f"max(0\\,min({SRC_W - cw}\\,{piecewise(kfs)}-{cw // 2}))"
    return [f"crop={cw}:{ch}:x='{x}':y={int((SRC_H - ch) * cy)}", f"scale={W}:{WIN_H}:flags=lanczos", "unsharp=5:5:0.4"]


def vertical_graph(inp, s, dur, pre, tail):
    """full filtergraph for one vertical shot; returns string ending in [v]."""
    pad = f"pad={W}:{H}:0:{WIN_Y}:black"
    if s.get("layout") == "fit":  # whole 16:9 frame, blurred fill behind it
        fit_h = int(round(W * SRC_H / SRC_W / 2)) * 2
        return (f"{inp}{','.join(pre)},split[bg0][fg0];"
                f"[bg0]scale=-2:{WIN_H},crop={W}:{WIN_H},gblur=sigma=40,eq=brightness=-0.22:saturation=0.7[bg1];"
                f"[fg0]scale={W}:{fit_h}:flags=lanczos[fg1];"
                f"[bg1][fg1]overlay=0:{(WIN_H - fit_h) // 2},{','.join(tail + [pad, 'format=yuv420p'])}[v]")
    return f"{inp}{','.join(pre + vertical_reframe(s, dur) + tail + [pad, 'format=yuv420p'])}[v]"


def video_filters(s, dur):
    f = []
    if not VERTICAL:
        f += zoom_chain(s, dur)
    if s.get("whip"):
        f.append("gblur=sigma=18:enable='lt(t,0.12)'")
    g = s.get("grade")
    if g == "bw":
        f.append("hue=s=0")
    elif g == "dream":
        f.append("gblur=sigma=2,eq=brightness=0.06:saturation=1.25")
    elif g == "dark":
        f.append("eq=brightness=-0.08:saturation=0.6,vignette=PI/3.2")
    if s.get("vignette"):
        f.append("vignette=PI/4")
    f.append("eq=saturation=1.08:contrast=1.03")
    if s.get("flash"):
        f.append(f"fade=t=in:st=0:d={s['flash']}:color=white")
    if s.get("fade_out"):
        f.append(f"fade=t=out:st={dur - s['fade_out']:.3f}:d={s['fade_out']}")
    if s.get("fade_in"):
        f.append(f"fade=t=in:st=0:d={s['fade_in']}")
    return f


def atempo_chain(speed):
    out = []
    while speed > 2.0:
        out.append("atempo=2.0")
        speed /= 2.0
    out.append(f"atempo={speed:.5f}")
    return out


ENC = ["-c:v", "libx264", "-preset", "ultrafast" if PREVIEW else "veryfast", "-crf", "16",
       "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
       "-color_range", "tv", "-c:a", "pcm_s16le", "-ar", str(SR), "-ac", "2"]


def seg_key(e):
    s = {k: v for k, v in e["shot"].items() if k not in ("subs", "caps", "fx", "label")}
    raw = json.dumps(s, sort_keys=True) + f"|{e['n']}|{PREVIEW}"
    return hashlib.sha1(raw.encode()).hexdigest()[:12]


def render_shot(e):
    s, n, dur = e["shot"], e["n"], e["dur"]
    out = os.path.join(seg_dir, seg_key(e) + ".mkv")
    src = os.path.join(raw_dir, s["src"] + ".mp4")
    vf_tail = video_filters(s, dur)
    if s["kind"] == "clip":
        speed = s.get("speed", 1.0)
        a, b = s["a"], s["b"]
        pre = [f"setpts=(PTS-STARTPTS)/{speed}", f"fps={FPS_NUM}/{FPS_DEN}", f"scale={SRC_W}:{SRC_H}"]
        inputs = ["-ss", f"{a:.4f}", "-t", f"{(b - a) + 0.5:.4f}", "-i", src]
        if s.get("mute"):
            af_src = None
        else:
            gain = s.get("gain_db", CLIP_GAIN_DB.get(s["src"], 0)) + s.get("gain_adj", 0)
            af = ["asetpts=PTS-STARTPTS"]
            if speed != 1.0:
                af += atempo_chain(speed)
            af += ["highpass=f=80", f"volume={gain}dB"]
            if s.get("afade_in"):
                af.append(f"afade=t=in:st=0:d={s['afade_in']}")
            af += ["apad", f"atrim=0:{dur:.5f}"]
            if s.get("afade_out", 0.03):
                fo = s.get("afade_out", 0.03)
                af.append(f"afade=t=out:st={dur - fo:.5f}:d={fo}")
            af_src = "[0:a:0]" + ",".join(af) + ",aformat=sample_rates=48000:channel_layouts=stereo[a]"
        if VERTICAL:
            fc = vertical_graph("[0:v:0]", s, dur, pre, vf_tail)
        else:
            fc = "[0:v:0]" + ",".join(pre + vf_tail + ["format=yuv420p"]) + "[v]"
        if af_src:
            fc += ";" + af_src
            amap = ["-map", "[a]"]
            extra_in = []
        else:
            extra_in = ["-f", "lavfi", "-t", f"{dur:.5f}", "-i", f"anullsrc=r={SR}:cl=stereo"]
            amap = ["-map", "1:a"]
        cmd = ["ffmpeg", "-y", "-v", "error"] + inputs + extra_in + ["-filter_complex", fc, "-map", "[v]"] + amap + \
              ["-frames:v", str(n), "-t", f"{dur:.5f}"] + ENC + [out]
    else:  # freeze
        png = os.path.join(seg_dir, seg_key(e) + ".png")
        run(["ffmpeg", "-y", "-v", "error", "-ss", f"{s['t']:.4f}", "-i", src, "-map", "0:v:0", "-frames:v", "1",
             "-vf", f"scale={SRC_W}:{SRC_H}", png])
        pre = [f"scale={SRC_W}:{SRC_H}"]
        if VERTICAL:
            fc = vertical_graph("[0:v]", s, dur, pre, vf_tail)
        else:
            fc = "[0:v]" + ",".join(pre + vf_tail + ["format=yuv420p"]) + "[v]"
        cmd = ["ffmpeg", "-y", "-v", "error", "-loop", "1", "-framerate", f"{FPS_NUM}/{FPS_DEN}", "-t", f"{dur + 0.2:.4f}", "-i", png,
               "-f", "lavfi", "-t", f"{dur:.5f}", "-i", f"anullsrc=r={SR}:cl=stereo",
               "-filter_complex", fc, "-map", "[v]", "-map", "1:a",
               "-frames:v", str(n), "-t", f"{dur:.5f}"] + ENC + [out]
    run(cmd)
    return out


# ---------------------------------------------------------------- captions (ASS)
def ass_time(t):
    t = max(0, t)
    cs = int(round(t * 100))
    return f"{cs // 360000}:{(cs // 6000) % 60:02d}:{(cs // 100) % 60:02d}.{cs % 100:02d}"


DEFAULT_STYLES = """[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Jua,66,&H00FFFFFF,&H00FFFFFF,&H00141414,&H96000000,0,0,0,0,100,100,0,0,1,5,2,2,80,80,64,1
Style: SubSW,Jua,68,&H004DE1FF,&H00FFFFFF,&H00602A0E,&H96000000,0,0,0,0,100,100,0,0,1,6,2,2,80,80,64,1
Style: SubQ,Jua,62,&H00FFFFFF,&H00FFFFFF,&H00A0602A,&H96000000,0,0,0,0,100,100,0,0,1,5,2,2,80,80,64,1
Style: Big,Black Han Sans,118,&H00FFFFFF,&H00FFFFFF,&H00202020,&H64000000,0,0,0,0,100,100,2,0,1,9,4,5,60,60,60,1
Style: BigY,Black Han Sans,124,&H0033D6FF,&H00FFFFFF,&H00602A0E,&H64000000,0,0,0,0,100,100,2,0,1,10,4,5,60,60,60,1
Style: BigR,Black Han Sans,124,&H003C3CFF,&H00FFFFFF,&H00FFFFFF,&H64000000,0,0,0,0,100,100,2,0,1,10,4,5,60,60,60,1
Style: Title,Black Han Sans,150,&H00FFFFFF,&H00FFFFFF,&H00602A0E,&H78000000,0,0,0,0,100,100,4,0,1,12,6,5,60,60,60,1
Style: Label,Do Hyeon,54,&H00FFFFFF,&H00FFFFFF,&H00202020,&HC8141414,0,0,0,0,100,100,1,0,3,14,0,7,60,60,50,1
Style: LabelY,Do Hyeon,54,&H00141414,&H00FFFFFF,&H0033D6FF,&H0033D6FF,0,0,0,0,100,100,1,0,3,14,0,7,60,60,50,1
Style: Note,Jua,52,&H00E6E6E6,&H00FFFFFF,&H00141414,&H96000000,0,0,0,0,100,100,0,0,1,4,1,5,60,60,60,1
Style: Draw,Arial,20,&H00FFFFFF,&H00FFFFFF,&H003C3CFF,&H00000000,0,0,0,0,100,100,0,0,1,10,0,7,0,0,0,1
"""

STYLES = getattr(EDL, "STYLES", DEFAULT_STYLES)
POP = getattr(EDL, "CAP_ANIM", r"{\fscx140\fscy140\t(0,120,\fscx100\fscy100)}")
POP_SOFT = getattr(EDL, "SUB_ANIM", r"{\fscx118\fscy118\t(0,100,\fscx100\fscy100)}")


def build_ass(path):
    ev = []
    for e in timeline:
        s, st, dur = e["shot"], e["start"], e["dur"]
        speed = s.get("speed", 1.0)
        end = st + dur
        # dialogue (source time for clips, shot-relative for freezes)
        for sub in s.get("subs", []):
            a, b, text = sub[0], sub[1], sub[2]
            style = sub[3] if len(sub) > 3 else "Sub"
            if s["kind"] == "clip":
                oa = st + (a - s["a"]) / speed
                ob = st + (b - s["a"]) / speed
            else:
                oa, ob = st + a, st + b
            oa, ob = max(oa, st), min(ob, end)
            if ob - oa < 0.15:
                continue
            ev.append((oa, ob, 1, style, POP_SOFT + text))
        # overlay captions: shot-relative
        for c in s.get("caps", []):
            a, b, text = c[0], c[1], c[2]
            style = c[3] if len(c) > 3 else "Big"
            pos = c[4] if len(c) > 4 else None
            oa = st + a
            ob = st + (b if b is not None else dur)
            pre = POP if style.startswith(("Big", "Title")) else POP_SOFT
            if pos:
                pre = r"{\pos(" + f"{pos[0]},{pos[1]}" + r")}" + pre
            if style == "Draw":
                ev.append((oa, ob, 3, "Draw", text))
            else:
                layer = 2 if style.startswith(("Big", "Title")) else 1
                ev.append((oa, ob, layer, style, pre + text))
    for a, b, text, style, pos in getattr(EDL, "GLOBAL_CAPS", []):  # output time, e.g. a fixed title
        pre = r"{\pos(" + f"{pos[0]},{pos[1]}" + r")}" if pos else ""
        ev.append((a, TOTAL if b is None else b, 0, style, pre + text))
    ev.sort(key=lambda x: x[0])
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\nWrapStyle: 2\nScaledBorderAndShadow: yes\nYCbCr Matrix: TV.709\n\n")
        f.write(STYLES)
        f.write("\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
        for a, b, layer, style, text in ev:
            f.write(f"Dialogue: {layer},{ass_time(a)},{ass_time(b)},{style},,0,0,0,,{text}\n")


# ---------------------------------------------------------------- SFX track
_sfx_cache = {}


def load_sfx(name):
    if name not in _sfx_cache:
        with wave.open(os.path.join(sfx_dir, name + ".wav")) as w:
            x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
            _sfx_cache[name] = x.reshape(-1, 2)
    return _sfx_cache[name]


def build_sfx(path):
    buf = np.zeros((int(TOTAL * SR) + SR, 2), dtype=np.float32)
    for e in timeline:
        for fx in e["shot"].get("fx", []):
            t, name = fx[0], fx[1]
            db = fx[2] if len(fx) > 2 else -6
            x = load_sfx(name) * (10 ** (db / 20))
            i = int((e["start"] + t) * SR)
            j = min(len(buf), i + len(x))
            buf[i:j] += x[: j - i]
    buf = np.clip(buf, -1, 1)
    with wave.open(path, "w") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((buf * 32767).astype(np.int16).tobytes())


# ---------------------------------------------------------------- main
if __name__ == "__main__":
    segs = []
    for e in timeline:
        p = os.path.join(seg_dir, seg_key(e) + ".mkv")
        if (ONLY is not None and e["i"] in ONLY) or not os.path.exists(p):
            render_shot(e)
            print(f"  seg {e['i']:03d} {e['shot']['src']} {e['dur']:.2f}s", flush=True)
        segs.append(p)
    with open(os.path.join(work, "concat.txt"), "w") as f:
        for p in segs:
            f.write(f"file '{os.path.abspath(p)}'\n")
    ass = os.path.join(work, "captions.ass")
    build_ass(ass)
    sfxw = os.path.join(work, "sfx.wav")
    build_sfx(sfxw)
    json.dump([{k: v for k, v in e.items() if k != "shot"} | {"src": e["shot"]["src"], "label": e["shot"].get("label", "")}
               for e in timeline], open(os.path.join(work, "timeline.json"), "w"), ensure_ascii=False, indent=1)

    # dialogue bed: concat audio, compress, then mix with sfx and limit
    fc = (f"[0:v]ass={ass}:fontsdir={fonts_dir}[v];"
          "[0:a]acompressor=threshold=-24dB:ratio=3:attack=8:release=200:makeup=4dB[d];"
          "[1:a]volume=1.0[s];"
          "[d][s]amix=inputs=2:normalize=0:duration=first,"
          "alimiter=limit=0.84:attack=3:release=60:level=disabled,aresample=48000[a]")
    venc = ["-c:v", "libx264", "-preset", "veryfast" if PREVIEW else "slow", "-crf", "22" if PREVIEW else "19",
            "-profile:v", "high", "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709",
            "-color_trc", "bt709", "-color_range", "tv", "-movflags", "+faststart"]
    if PREVIEW:
        fc = fc.replace("[v];", f",scale={W * 2 // 3}:{H * 2 // 3}[v];", 1)
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", os.path.join(work, "concat.txt"),
         "-i", sfxw, "-filter_complex", fc, "-map", "[v]", "-map", "[a]"] + venc +
        ["-c:a", "aac", "-b:a", "192k", "-t", f"{TOTAL:.4f}", out_path])
    # static gain to hit -15 LUFS integrated (limiter keeps true peak under ~-1.5 dBFS)
    r = run(["ffmpeg", "-v", "info", "-i", out_path, "-map", "0:a", "-af", "ebur128", "-f", "null", "-"])
    lufs = float([l for l in r.stderr.splitlines() if l.strip().startswith("I:")][-1].split()[1])
    gain = -15.0 - lufs
    print(f"integrated {lufs:.1f} LUFS -> gain {gain:+.1f} dB")
    if abs(gain) > 0.4:
        tmp = out_path + ".tmp.mp4"
        run(["ffmpeg", "-y", "-v", "error", "-i", out_path, "-map", "0:v", "-map", "0:a", "-c:v", "copy",
             "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:attack=3:release=60:level=disabled",
             "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp])
        os.replace(tmp, out_path)
    print("wrote", out_path, f"{TOTAL:.2f}s")
