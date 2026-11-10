"""렌더 결과를 검수하고 OpenMontage compose 단계 아티팩트(render_report · final_review)를 씁니다.

    OPENMONTAGE_HOME=/path/to/OpenMontage python3 scripts/finalize_report.py [--render-seconds 2400]

- 기술 검사(ffprobe)·프레임 샘플·아틀리에 규약 검사는 OpenMontage 의 video_compose 도구 함수를 그대로 부릅니다.
- 이 영상은 더빙을 따로 녹음하는 무음 마스터라 "오디오 스트림 없음"은 결함이 아니라 의도입니다(아래에서 따로 표시).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "artifacts"
HOME = os.environ.get("OPENMONTAGE_HOME")
if not HOME:
    sys.exit("OPENMONTAGE_HOME 환경 변수가 필요합니다.")
sys.path.insert(0, HOME)

from tools.video.video_compose import VideoCompose  # noqa: E402

load = lambda n: json.loads((ART / f"{n}.json").read_text(encoding="utf-8"))
edit = load("edit_decisions")
proposal = load("proposal_packet")
script = load("script")
tl = load("timeline")
vc = VideoCompose()


def probe(path: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,width,height,r_frame_rate,pix_fmt,nb_frames", "-show_entries", "format=duration,size", "-of", "json", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout
    d = json.loads(out)
    st, fm = d["streams"][0], d["format"]
    num, den = st["r_frame_rate"].split("/")
    return {"codec": st["codec_name"], "w": st["width"], "h": st["height"], "fps": round(int(num) / int(den), 3), "pix_fmt": st["pix_fmt"], "frames": int(st.get("nb_frames", 0)), "duration": round(float(fm["duration"]), 3), "size": int(fm["size"])}


outputs, reviews = [], {}
for name, platform in [("final.mp4", "youtube 16:9"), ("final-vertical.mp4", "shorts/reels 9:16"), ("final-clean.mp4", "자막 없는 16:9")]:
    p = ROOT / "renders" / name
    if not p.exists():
        continue
    info = probe(p)
    outputs.append({"path": f"renders/{name}", "format": "mp4", "codec": info["codec"], "resolution": f"{info['w']}x{info['h']}", "fps": info["fps"], "duration_seconds": info["duration"], "file_size_bytes": info["size"], "platform_target": platform})
    review = vc._run_final_review(output_path=p, edit_decisions=edit, proposal_packet=proposal, narration_transcript_path=None, script_text=None)
    review.setdefault("checks", {})["atelier"] = vc._run_atelier_checks(ROOT / "index.tsx", edit["bespoke"])
    reviews[name] = {"info": info, "review": review}

if not outputs:
    sys.exit("renders/ 에 최종 영상이 없습니다.")

main = reviews[outputs[0]["path"].split("/")[-1]]
rv = main["review"]
expected = tl["total_seconds"]
SILENT = "No audio stream in output"
real_issues = [i for i in rv.get("issues_found", []) if SILENT not in i]
for name, r in reviews.items():
    if abs(r["info"]["duration"] - expected) > 0.1:
        real_issues.append(f"{name}: 길이 {r['info']['duration']}s ≠ 타임라인 {expected}s")
    if r["info"]["frames"] and r["info"]["frames"] != tl["total_frames"]:
        real_issues.append(f"{name}: 프레임 수 {r['info']['frames']} ≠ {tl['total_frames']}")
    real_issues += [f"{name}: {i}" for i in r["review"].get("issues_found", []) if SILENT not in i and name != outputs[0]["path"].split("/")[-1]]

checks = rv["checks"]
checks["audio_spotcheck"] = {**checks.get("audio_spotcheck", {}), "intentional_silence": True, "note": "더빙을 따로 녹음하는 무음 마스터. 오디오 스트림 없음은 의도된 납품 형태."}
checks["subtitle_check"] = {**checks.get("subtitle_check", {}), "burned_in": True, "note": "구절 자막은 컴포지션에 내장(추정 타이밍). 큰 글자 장면에서는 같은 문장의 자막을 숨김."}
checks["visual_spotcheck"] = {
    **checks.get("visual_spotcheck", {}),
    "self_review_completed": True,
    "method": "반해상도 초안 전체를 1.5초 간격으로 훑고, 전환 4곳을 프레임 단위로 확인. 최종본은 장면별 대표 프레임(snapshots/)으로 재확인.",
    "per_scene_notes": {s["id"]: s["subject"] for s in tl["scenes"]},
}
final_review = {
    "version": "1.0",
    "output_path": outputs[0]["path"],
    "status": "pass" if not real_issues else "revise",
    "checks": {k: checks[k] for k in ["technical_probe", "visual_spotcheck", "audio_spotcheck", "promise_preservation", "subtitle_check", "atelier"] if k in checks},
    "issues_found": real_issues,
    "recommended_action": "present_to_user" if not real_issues else "re_render",
    "metadata": {"tool_reported_issues": rv.get("issues_found", []), "other_outputs": {n: r["review"].get("status") for n, r in reviews.items()}},
}

secs = None
if "--render-seconds" in sys.argv:
    secs = float(sys.argv[sys.argv.index("--render-seconds") + 1])
render_report = {
    "version": "1.0",
    "outputs": outputs,
    **({"render_time_seconds": secs} if secs else {}),
    "render_grammar": "animation-first",
    "warnings": [
        "무음 마스터 — 더빙·음악·효과음은 후반 믹스에서 얹는다.",
        "타이밍은 초당 6.3음절 추정값. 녹음 속도가 다르면 scripts/sync-from-srt.ts 로 재정렬 후 다시 렌더.",
    ],
    "verification_notes": [
        f"길이 {outputs[0]['duration_seconds']}s / 타임라인 {expected}s, {tl['total_frames']}프레임 @ {tl['fps']}fps",
        "렌더 경로: Remotion 4 + @remotion/three, 소프트웨어 GL(swangle), 장면 18개를 나눠 렌더한 뒤 무손실 concat → H.264 1회 인코딩",
        "OpenMontage video_compose 아틀리에 경로(remotion-composer · React 18)에서도 같은 소스가 렌더됨을 스틸로 확인",
        "아틀리에 규약: 스톡 scene-type import 없음, art-direction.md 선언됨",
    ],
    "final_review_ref": "artifacts/final_review.json",
    "decision_log_ref": "decision_log.json",
    "metadata": {"self_review_completed": True, "compositions": {"TeachersMental": "1920x1080", "TeachersMentalVertical": "1080x1920"}},
}

import jsonschema  # noqa: E402

for name, data in [("final_review", final_review), ("render_report", render_report)]:
    schema = json.loads((Path(HOME) / "schemas" / "artifacts" / f"{name}.schema.json").read_text(encoding="utf-8"))
    errs = list(jsonschema.Draft202012Validator(schema).iter_errors(data))
    (ART / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")
    print(("OK  " if not errs else "FAIL"), name, *(f"\n   - {'/'.join(map(str, e.path))}: {e.message[:160]}" for e in errs[:8]))

print("status:", final_review["status"], "| issues:", real_issues or "없음")
for o in outputs:
    print(f"  {o['path']}: {o['resolution']} {o['fps']}fps {o['duration_seconds']}s {o['file_size_bytes'] / 1e6:.1f}MB")
