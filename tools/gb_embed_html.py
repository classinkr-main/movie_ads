#!/usr/bin/env python3
"""설명회 HTML 맨 위 오프닝 영상(#openingVideo)을 새 쇼릴로 교체한다.

사용:
  python3 tools/gb_embed_html.py <원본.html> <영상.mp4> <포스터.jpg> <출력.html>

- <video id="openingVideo">의 src를 새 MP4(base64)로 바꾸고 poster를 넣는다.
- 페이지의 '오프닝 영상 자막' 목록과 방향 예시 구간 표기를 30초 쇼릴 기준으로 바꾼다.
"""
import base64
import re
import sys

CAPTIONS = [
    "한 반에 여섯 명, 진도는 여섯 갈래.",
    "진도표, 채점, 상담, 보고까지. 개별진도는 손이 많이 갑니다.",
    "AI로 설계하고, 한 화면에서 관리한다면요?",
    "진단 결과로, 학생마다 진도 경로를 짜고,",
    "수업은 ClassIn에 남기고, AI 강의분석으로 수업의 질을 확인합니다.",
    "원장님은 한 화면에서 챙길 학생을 보고, 학부모 리포트 초안까지.",
    "손은 덜고, 퀄리티와 만족은 높게. 시작은, 개별진도반 하나부터.",
]
NOTE = '<p class="note">영상 10~14초 · 18~24초 <span class="tag t-idea">방향 예시</span> · 14~18초 <span class="tag t-now">지금 됨</span> · 화면 속 학생과 점수는 가상 데이터</p>'


def b64(path: str) -> str:
    with open(path, "rb") as fh:
        return base64.b64encode(fh.read()).decode("ascii")


def main() -> None:
    src, mp4, poster, out = sys.argv[1:5]
    html = open(src, encoding="utf-8").read()

    video_re = re.compile(r'(<video id="openingVideo")\s+src="data:video/mp4;base64,[A-Za-z0-9+/=]+"')
    if not video_re.search(html):
        sys.exit("openingVideo 태그를 찾지 못했습니다")
    html = video_re.sub(
        lambda m: f'{m.group(1)} src="data:video/mp4;base64,{b64(mp4)}" poster="data:image/jpeg;base64,{b64(poster)}"',
        html,
        count=1,
    )

    cap_re = re.compile(r'(<details class="opening-captions"[^>]*>\s*<summary>[^<]*</summary>\s*)<ul>.*?</ul>\s*<p class="note">.*?</p>', re.S)
    if not cap_re.search(html):
        sys.exit("오프닝 영상 자막 목록을 찾지 못했습니다")
    items = "\n".join(f"    <li>{c}</li>" for c in CAPTIONS)
    html = cap_re.sub(lambda m: f"{m.group(1)}<ul>\n{items}\n  </ul>\n  {NOTE}", html, count=1)

    with open(out, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"wrote {out} ({len(html) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
