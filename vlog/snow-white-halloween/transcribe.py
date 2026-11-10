import sys, json, os, glob, wave
import numpy as np
from faster_whisper import WhisperModel
wavdir, outdir, size = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir, exist_ok=True)
m = WhisperModel(size, device="cpu", compute_type="int8", cpu_threads=4)
for w in sorted(glob.glob(os.path.join(wavdir, "*.wav"))):
    n = os.path.basename(w)[:-4]
    wf = wave.open(w); a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    segs, info = m.transcribe(a, language="ko", word_timestamps=True, vad_filter=False, beam_size=5)
    out = []
    for s in segs:
        out.append({"start": s.start, "end": s.end, "text": s.text,
                    "words": [{"s": x.start, "e": x.end, "w": x.word} for x in (s.words or [])]})
    json.dump(out, open(os.path.join(outdir, n + ".json"), "w"), ensure_ascii=False, indent=1)
    print(n, len(out), flush=True)
