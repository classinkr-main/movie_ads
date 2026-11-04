#!/usr/bin/env python3
"""Classin Board 하드웨어 광고용 이미지 준비.

원본은 두 곳에서 온다.
  1) classinkr-web/public/images/product/hw/** (제품 페이지용 생성·촬영 이미지)
  2) Google Drive "0. 사진창고 / 제품 사진, 전자칠판" 의 실물 촬영본 2장 (20261103_144001.jpg, 20261103_144009.jpg)

실행:
  python3 scripts/prep-hw-assets.py --web ../classinkr-web/public/images --drive <실물 사진 폴더>

출력은 public/hw/ 아래에 저장되며, 영상 코드는 이 파일명만 참조한다.
색 보정(그레이딩)은 렌더 시 CSS 필터로 하므로 여기서는 크롭·리사이즈만 한다.
"""
import argparse
import os
from PIL import Image, ImageOps

ap = argparse.ArgumentParser()
ap.add_argument("--web", default="../classinkr-web/public/images")
ap.add_argument("--drive", default=None, help="실물 촬영본 폴더 (없으면 해당 산출물은 건너뜀)")
ap.add_argument("--out", default="public/hw")
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)


def save_jpg(im, name, width=None, q=88):
    im = ImageOps.exif_transpose(im).convert("RGB")
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(os.path.join(args.out, name), "JPEG", quality=q, optimize=True, progressive=True)
    print(name, im.size)


W = args.web
hw = lambda p: Image.open(os.path.join(W, "product/hw", p))

# ── 제품 페이지 이미지 ─────────────────────────────────────────
save_jpg(hw("hero/hero-board-stand.png"), "hero-stand.jpg", 1920)          # 오프닝: 다크 스튜디오 스탠드
save_jpg(hw("board/board-bezel-detail.webp"), "bezel-macro.jpg", 1920)     # 베젤 모서리 매크로(화이트)
save_jpg(hw("board/board-side-profile.webp"), "side-profile.jpg", 1920)    # 측면 슬림 프로파일
save_jpg(hw("details/bezel-closeup.webp"), "bezel-wall.jpg", 1920)         # 벽걸이 모서리(다크)
save_jpg(hw("display/display-wall-cinematic.jpg"), "display-wall.jpg", 1920)   # 벽걸이 + 블랙홀 화면
save_jpg(hw("writing/writing-teacher.jpg"), "teacher-writing.jpg", 1920)   # 교사 판서 + 학생 (트래킹 씬)
save_jpg(hw("ops/ops-chip-scene.png"), "ops-chip.jpg", 1920)               # OPS 칩
save_jpg(hw("lineup/lineup-all-sizes.png"), "lineup.jpg", 1920)            # 65/75/86/110 라인업

# 화면 콘텐츠로 쓸 UI 스크린샷 — 생태계 씬
save_jpg(Image.open(os.path.join(W, "home/board-class.webp")), "ui-board-class.jpg", 1600)
save_jpg(Image.open(os.path.join(W, "home/hero-board-screen.webp")), "ui-earth.jpg", 1400)

# ── 실물 촬영본(Drive) ─────────────────────────────────────────
if args.drive:
    # 1) 두 대가 나란히 걸린 쇼룸 벽 — 4:3 원본을 16:9로 크롭(조명 띠 + 보드 + 하단 벽)
    p1 = ImageOps.exif_transpose(Image.open(os.path.join(args.drive, "20261103_144001.jpg")))
    crop = (0, 600, 4000, 2850)  # 4000×2250 = 16:9
    save_jpg(p1.crop(crop), "showroom-wall.jpg", 2560, q=90)
    # 화면 사각형(크롭·리사이즈 후 좌표). 오른쪽 보드(카메라 달린 쪽) 화면 네 꼭짓점.
    # 원본 검출값: TL(2063,1214) TR(3855,1191) BR(3910,2224) BL(2073,2229) → crop y-600, ×(2560/4000)
    s = 2560 / 4000
    pts = [(2063, 1214), (3855, 1191), (3910, 2224), (2073, 2229)]
    print("showroom-wall right screen corners:", [(round(x * s), round((y - 600) * s)) for x, y in pts])
    ptsL = [(189, 1221), (1970, 1211), (1984, 2223), (159, 2253)]
    print("showroom-wall left screen corners:", [(round(x * s), round((y - 600) * s)) for x, y in ptsL])

    # 2) 한 대 클로즈업 — 상단 카메라 모듈과 베젤 디테일만 크롭(화면 얼룩 부분 제외)
    p2 = ImageOps.exif_transpose(Image.open(os.path.join(args.drive, "20261103_144009.jpg")))
    save_jpg(p2.crop((150, 250, 2150, 1375)), "real-camera-bezel.jpg", 1920, q=90)  # 2000×1125 = 16:9
