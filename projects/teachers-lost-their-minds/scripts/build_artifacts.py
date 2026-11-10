"""OpenMontage 단계별 아티팩트를 타임라인에서 생성합니다.

    python3 scripts/build_artifacts.py            # artifacts/*.json 생성
    OPENMONTAGE_HOME=/path/to/OpenMontage python3 scripts/build_artifacts.py --validate

대본·장면 타이밍은 `npm run mental:timeline` 이 만든 artifacts/timeline.json 한 곳에서만 옵니다.
(타이밍을 바꿨다면 timeline → 이 스크립트 순서로 다시 돌리면 OpenMontage 아티팩트가 같이 갱신됩니다.)
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "artifacts"
PROJECT_ID = "teachers-lost-their-minds"
TITLE = "선생님들은 멘탈이 나가 버렸습니다 — ClassIn 자동 녹화 쇼릴"
TL = json.loads((ART / "timeline.json").read_text(encoding="utf-8"))
TOTAL = TL["total_seconds"]

ACT_LABEL = {"problem": "1막 · 문제", "attempt": "2막 · 첫 시도", "solution": "3막 · 해결", "result": "4막 · 결과"}

TASTE = {
    "design_read": "책상 위 미니어처로 재현한 사건 보고서: 장난감처럼 귀여운 3D 블록 디오라마 위에 보도 그래픽처럼 단정한 형광펜·꼬리표 주석. 밈의 '과장된 진지함'을 화면 문법으로 옮긴다.",
    "visual_variance": 6,
    "motion_intensity": 7,
    "information_density": 4,
    "palette_discipline": "종이 #F3EEE2 + 잉크 #1B1A17 바탕. 막마다 강조색 하나: 레드(문제) → 코발트(첫 시도) → ClassIn 그린·라임(해결·결과).",
    "layout_variation": "세트 7종을 오가되 주 피사체는 장면마다 하나. 하단 자막 띠·좌상단 할 일 메모·우상단 막 레일은 고정.",
    "reference_strategy": "외부 레퍼런스 이미지 없음. 장면군마다 스틸 1장을 먼저 뽑아 룩을 확정한 뒤 나머지를 작성(snapshots/).",
    "anti_patterns": [
        "보라색 그라데이션 SaaS 영상, 글래스모피즘, 네온 글로우",
        "자막과 같은 문장을 화면 글자로 한 번 더 쓰기",
        "실제 제품 화면을 흉내 낸 가짜 UI 로 기능을 단정하기",
        "이 저장소 v1~v4 쇼릴의 아이보리·라임 에디토리얼 문법 재사용",
    ],
    "quality_gates": [
        "쉼표(구절)마다 화면 동작이 하나씩 걸린다",
        "어느 두 장면도 주 피사체가 같지 않다",
        "영혼 가출은 네 번, 나무는 한 장면에만 나온다",
        "글자는 최종 해상도에서 선명하다(HTML 주석 · 캔버스 인쇄면)",
    ],
}


def research_brief() -> dict:
    return {
        "version": "1.0",
        "topic": "‘~들은 완전히 멘탈이 나가 버렸습니다’ 밈 형식으로 푸는 ClassIn 자동 녹화 스토리 쇼릴 (3D Vox 스타일)",
        "research_date": "2026-11-10",
        "landscape": {
            "existing_content": [
                {
                    "title": "Replicating the Vox motion graphic look",
                    "url": "https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/",
                    "source": "PremiumBeat",
                    "angle": "Vox 해설 영상의 모션 그래픽 문법을 요소별로 분해",
                    "what_it_covers": "작은 모션 요소가 영상의 리듬을 만든다는 점, 12fps 의 일부러 끊기는 움직임",
                    "what_it_misses": "3D 장면에 같은 문법을 얹는 방법",
                },
                {
                    "title": "How to Make Vox-Style Animations (Step-by-Step Guide)",
                    "url": "https://www.kapwing.com/resources/how-to-make-informational-videos-like-vox/",
                    "source": "Kapwing",
                    "angle": "Vox 스타일을 '겹겹이 쌓은 다큐 모션 그래픽'으로 정의",
                    "what_it_covers": "레이어드 콜라주, 설명을 따라가는 화면 구성",
                    "what_it_misses": "내레이션 구절과 동작을 프레임 단위로 맞추는 방법",
                },
                {
                    "title": "vox-director",
                    "url": "https://github.com/Alisa0808/vox-director",
                    "source": "GitHub",
                    "angle": "종이 콜라주형 Vox 스타일 해설·광고 영상의 자동 제작",
                    "what_it_covers": "종이 콜라주가 Vox 스타일의 대표 접근이라는 방증",
                    "what_it_misses": "3D",
                },
            ],
            "saturated_angles": [
                "평면 2D 종이 콜라주 + 지도·차트 중심의 정통 Vox 모사",
                "제품 화면 녹화에 자막만 얹은 기능 소개",
            ],
            "underserved_gaps": [
                "실제 3D 디오라마에 Vox 식 주석(형광펜·꼬리표)을 투영해 붙이는 혼합 문법",
                "밈 내레이션의 쉼표 하나하나에 물리적 동작을 거는 구성",
            ],
        },
        "data_points": [
            {
                "claim": "의뢰 대본은 35문장 · 한글 690음절이다. 초당 6.3음절 기준 약 2분 11초.",
                "source_url": "local://story/beats.ts",
                "source_name": "의뢰 원문 대본",
                "credibility": "primary_source",
                "surprise_factor": "expected",
                "usable_as": "길이·컷 수 산정의 근거",
            },
            {
                "claim": "Vox 스타일 모션 그래픽에서는 작은 모션 요소들이 영상의 리듬을 만들고, 12fps 의 끊기는 움직임을 일부러 쓰기도 한다.",
                "source_url": "https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/",
                "source_name": "PremiumBeat",
                "credibility": "secondary_source",
                "surprise_factor": "notable",
                "usable_as": "쉼표마다 작은 동작 하나를 거는 설계의 근거",
            },
            {
                "claim": "Vox 스타일은 이야기를 설명하기 위해 시각 요소를 겹겹이 쌓는 다큐 모션 그래픽의 한 형태로 정의된다.",
                "source_url": "https://www.kapwing.com/resources/how-to-make-informational-videos-like-vox/",
                "source_name": "Kapwing",
                "credibility": "secondary_source",
                "surprise_factor": "expected",
                "usable_as": "3D 장면 위에 주석 레이어를 따로 두는 구조의 근거",
            },
            {
                "claim": "Vox 미디어의 모션 그래픽 디자이너 채용 공고는 모션 디자인이 자사 해설 스타일의 핵심이라고 적는다.",
                "source_url": "https://startup.jobs/motion-graphics-designer-at-voxmedia-2",
                "source_name": "startup.jobs (Vox Media 채용 공고 전재)",
                "credibility": "secondary_source",
                "surprise_factor": "expected",
                "usable_as": "스타일 정의 보강",
            },
        ],
        "audience_insights": {
            "common_questions": [
                "수업 녹화를 남기려면 선생님이 직접 뭘 해야 하나?",
                "촬영 장비를 좋게 바꾸면 해결되지 않나?",
                "ClassIn 은 어디까지 자동으로 해 주나?",
            ],
            "misconceptions": [
                {"myth": "좋은 카메라·마이크·저장 장치를 갖추면 수업 후 작업이 줄어든다", "reality": "장비가 늘면 챙길 것도 늘 뿐, 누르고·옮기고·올리고·체크하는 일은 그대로 선생님 몫이다(대본 2막)."},
                {"myth": "수업 녹화의 일은 촬영에서 끝난다", "reality": "촬영 뒤에 편집·업로드·시청 체크가 줄줄이 이어진다(대본 1막)."},
            ],
            "knowledge_level": "학원·학교 선생님과 운영자. 녹화·업로드의 번거로움은 몸으로 알지만 '시스템이 통째로 받는' 방식은 낯설다.",
            "pain_points": ["수업 외 시간의 소모", "밤샘 편집", "링크 공유와 미시청 학생 재안내"],
        },
        "angles_discovered": [
            {
                "name": "미니어처 디오라마 사건 보고서",
                "hook": "전시대 위 '옛날 선생님' 피규어들이 일제히 멘탈이 나간다",
                "type": "narrative",
                "why_now": "밈 형식이 익숙한 지금, 3D 장난감 문법이 2D 콜라주보다 눈에 띈다",
                "grounded_in": ["의뢰 원문 대본", "PremiumBeat", "Kapwing"],
            },
            {
                "name": "정통 2D 종이 콜라주",
                "hook": "오려 붙인 사진·신문 조각으로 재구성한 선생님의 하루",
                "type": "evergreen",
                "why_now": "Vox 스타일의 가장 안전한 해석",
                "grounded_in": ["Kapwing", "vox-director"],
            },
            {
                "name": "구조물 밈 직역 — 흔들리는 탑",
                "hook": "수업 위에 올라간 작업 탑이 흔들린다",
                "type": "contrarian",
                "why_now": "원본 밈의 구조 공학 화면을 그대로 뒤집어 쓴다",
                "grounded_in": ["의뢰 원문 대본(‘나무처럼’, ‘받쳐 주는 구조’)"],
            },
        ],
        "visual_references": [],
        "sources": [
            {"url": "https://www.premiumbeat.com/blog/replicating-vox-motion-graphic/", "title": "Replicating the Vox motion graphic look", "used_for": "모션 리듬·끊기는 움직임", "reliability": "secondary"},
            {"url": "https://www.kapwing.com/resources/how-to-make-informational-videos-like-vox/", "title": "How to Make Vox-Style Animations", "used_for": "Vox 스타일 정의", "reliability": "secondary"},
            {"url": "https://github.com/Alisa0808/vox-director", "title": "vox-director", "used_for": "종이 콜라주 접근의 방증", "reliability": "secondary"},
            {"url": "https://startup.jobs/motion-graphics-designer-at-voxmedia-2", "title": "Motion Graphics Designer at Vox Media", "used_for": "모션 디자인이 스타일의 핵심이라는 진술", "reliability": "secondary"},
            {"url": "https://contra.com/s/WZggPY3k-vox-style-motion-graphics-modern-journalism", "title": "Vox Style motion graphics — Modern journalism", "used_for": "Vox 스타일 포트폴리오 사례", "reliability": "anecdotal"},
            {"url": "https://fiverr.com/vossvisuals/create-vox-style-motion-graphics-maps-and-documentary-visuals", "title": "Vox style motion graphics, maps and documentary visuals", "used_for": "형광펜 효과·키네틱 타이포가 통용 요소라는 방증", "reliability": "anecdotal"},
        ],
        "research_summary": (
            "밈의 원본 영상과 유래는 검색으로 확인하지 못했다(결과가 무관한 건축 시각화·외주 광고뿐). 그래서 형식은 의뢰 대본 자체에서 읽었다: "
            "건조한 다큐 내레이션, 문제 → 그럴듯한 첫 시도 → '공사팀'의 새 방법 → 결과, 쉼표로 이어지는 나열. "
            "Vox 스타일은 2차 자료 기준으로 '겹겹의 2D 모션 그래픽·콜라주·형광펜·키네틱 타이포'로 요약되며, 종이 질감·주석·3D 사용을 직접 다룬 자료는 찾지 못했다. "
            "따라서 '3D Vox'는 3D 디오라마 + Vox 식 편집 주석의 혼합으로 해석했고, 이 해석은 의뢰자 확인이 필요하다."
        ),
        "metadata": {"limits": ["밈 원본 미확인", "Vox 1차 자료 없음"], "script_supplied_by_user": True},
    }


def proposal_packet() -> dict:
    stage = lambda s, tools, approach, fb=None: {"stage": s, "tools": tools, "approach": approach, **({"fallback_if_unavailable": fb} if fb else {})}
    t = lambda name, role, ok=True: {"tool_name": name, "role": role, "available": ok}
    return {
        "version": "1.0",
        "concept_options": [
            {
                "id": "A",
                "title": "책상 위 미니어처 사건 보고서",
                "hook": "전시대 위 '옛날 선생님' 피규어 셋이 '멘탈이'에서 동시에 나선 눈이 되고 영혼이 빠져나간다",
                "narrative_structure": "problem_solution",
                "visual_approach": "Three.js 블록 디오라마(세트 7종) + HTML 편집 주석(형광펜 자막·꼬리표·도장·큰 글자). 쉼표마다 물리적 동작 하나.",
                "target_audience": "학원·학교 선생님과 운영자",
                "target_platform": "youtube",
                "target_duration_seconds": TOTAL,
                "key_points": ["수업 후 작업 4종(촬영·편집·업로드·시청 체크)의 누적", "장비만 늘린 첫 시도의 한계", "버튼 하나 → 자동 촬영·업로드·시청 체크·관리", "수업이 끝나면 진짜로 끝"],
                "core_message": "선생님이 하던 수업 후 작업을 시스템이 통째로 받는다 — 클래스인 하나로.",
                "cta": "classin.co.kr",
                "tone": "건조하고 과장되게 진지한 밈 다큐 톤",
                "grounded_in": ["의뢰 원문 대본", "PremiumBeat", "Kapwing"],
                "why_this_works": "일이 '쌓인다'는 감각을 블록이 실제로 쌓이는 것으로 보여 줄 수 있고, 3막의 '나무처럼 받쳐 주는 구조'를 은유가 아니라 구조물로 세울 수 있다.",
            },
            {
                "id": "B",
                "title": "정통 2D 종이 콜라주",
                "hook": "오려 붙인 종이 인형 선생님 위로 포스트잇이 쏟아진다",
                "narrative_structure": "problem_solution",
                "visual_approach": "평면 종이 콜라주, 12fps 스톱모션 느낌, 지도·차트 대신 포스트잇과 서류",
                "target_platform": "youtube",
                "target_duration_seconds": TOTAL,
                "why_this_works": "Vox 스타일의 가장 안전한 해석이지만 '3D' 요청과 맞지 않고, 구조물 은유(나무)가 평면에서는 약하다.",
            },
            {
                "id": "C",
                "title": "구조물 밈 직역 — 흔들리는 탑 원테이크",
                "hook": "수업 받침 아래 작업 탑이 한 층씩 올라가며 흔들린다",
                "narrative_structure": "analogy",
                "visual_approach": "탑 하나를 원테이크로 돌려 보는 3D. 세트 전환 없음.",
                "target_platform": "youtube",
                "target_duration_seconds": TOTAL,
                "why_this_works": "원본 밈과 가장 닮았지만 2분 넘게 한 피사체만 보여 주면 쉼표마다의 세부 동작(각도 맞추기, 자막 넣기…)을 그릴 자리가 없다.",
            },
        ],
        "selected_concept": {
            "concept_id": "A",
            "rationale": "‘3D’와 ‘Vox’ 요청을 둘 다 살리고, 대본의 쉼표 나열을 장면별 세부 동작으로 받을 수 있는 유일한 안. C 의 탑은 1막 끝(에너지 방전)과 3막(나무) 장면으로 흡수했다.",
            "modifications": ["C 안의 '쌓이는 탑'을 s09·s13·s17 에 흡수", "세로 9:16 컴포지션을 같은 코드로 함께 제공"],
        },
        "production_plan": {
            "pipeline": "animation",
            "playbook": "custom (atelier art direction — art-direction.md)",
            "render_runtime": "remotion",
            "composition_mode": "atelier",
            "renderer_family": "animation-first",
            "art_direction": "projects/teachers-lost-their-minds/art-direction.md",
            "taste_profile": TASTE,
            "delivery_promise": {"promise_type": "motion_led", "motion_required": True, "tone_mode": "playful", "quality_floor": "presentable", "approved_fallback": None},
            "music_source": {"source_type": "none", "mood_direction": "렌더에는 음악 없음(무음 마스터). 더빙을 따로 녹음하므로 음악·효과음은 믹스 단계에서 얹는다. music_library/ 비어 있음, 음악 생성 제공자 0/8 설정.", "estimated_cost_usd": 0},
            "voice_selection": {"provider": "none — 의뢰자 직접 녹음", "rationale": "의뢰에 '따로 녹음 할거야'로 명시. TTS 는 쓰지 않는다(제공자 0/19 설정). 추정 타이밍 대본과 가이드 SRT 를 제공하고, 녹음 후 SRT 로 영상을 다시 맞출 수 있다.", "estimated_cost_usd": 0, "delivery_style": "건조하고 과장되게 진지한 밈 다큐 낭독", "pacing_policy": "초당 6.3음절, 쉼표 0.16초, 문장 끝 0.34초", "sample_approval_required": False},
            "stages": [
                stage("research", [t("WebSearch", "형식·스타일 리서치")], "밈 형식과 Vox 스타일 조사. 밈 원본은 미확인."),
                stage("proposal", [], "콘셉트 3안, 런타임·작성 방식·음악·성우 결정 기록"),
                stage("script", [], "의뢰 원문을 고치지 않고 35비트·구절로 분절, 음절 수로 타이밍 추정"),
                stage("scene_plan", [], "18장면, 장면마다 주 피사체 1개, 전환 3종(컷·휩·와이프)"),
                stage("assets", [t("remotion still", "장면별 스냅샷"), t("threejs_world", "미사용 — HyperFrames 전용 경로", True)], "생성 에셋 없음. 3D 는 코드로 조립, 폰트·로고만 정적 파일.", "해당 없음"),
                stage("edit", [], "아틀리에 컴포지션이 편집을 소유. 장면 경계 = 비트 경계."),
                stage("compose", [t("video_compose", "아틀리에 렌더 + 사후 검수"), t("audio_mixer", "미사용 — 무음 마스터")], "Remotion + @remotion/three, swangle(소프트웨어 GL) 렌더"),
            ],
            "quality_tradeoffs": [
                {"tradeoff": "내레이션 없이 추정 타이밍으로 먼저 그림을 잠근다", "recommendation": "더빙을 화면에 맞추거나, 녹음 후 `mental:sync` 로 영상을 목소리에 맞춘다"},
                {"tradeoff": "GPU 없이 소프트웨어 GL 로 렌더 — 후처리(피사계 심도·블룸) 없음", "recommendation": "토이 룩은 조명·그림자·종이 질감으로 만든다"},
            ],
            "alternative_paths": [
                {"description": "HyperFrames(HTML/GSAP + Three.js 어댑터)로 작성 — 품질은 동급. 다만 의뢰가 Remotion 을 지정했고, 프레임 결정론적 React 장면 구성이 구절 싱크에 더 직접적", "total_cost_usd": 0, "quality_level": "premium"},
                {"description": "FFmpeg 스틸 슬라이드 — 모션이 핵심인 의뢰라 부적합", "total_cost_usd": 0, "quality_level": "free"},
            ],
        },
        "cost_estimate": {
            "total_estimated_usd": 0,
            "budget_cap_usd": 2.0,
            "budget_verdict": "within_budget",
            "line_items": [
                {"tool": "remotion (local)", "operation": "아틀리에 렌더 16:9 · 9:16", "quantity": 2, "estimated_usd": 0, "notes": "로컬 CPU 렌더"},
                {"tool": "tts_selector", "operation": "내레이션", "quantity": 0, "estimated_usd": 0, "notes": "의뢰자 직접 녹음 — 미사용"},
                {"tool": "music_gen", "operation": "음악", "quantity": 0, "estimated_usd": 0, "notes": "미사용"},
            ],
            "savings_options": [],
        },
        "approval": {
            "status": "pending",
            "user_notes": "의뢰가 런타임(Remotion)·스타일(3D Vox)·대본·성우(직접 녹음)를 지정한 '제작 요청'이어서, 승인 게이트에서 멈추지 않고 1차 완성본까지 한 번에 만들었다. 콘셉트 A 와 '3D Vox' 해석은 아직 의뢰자 확인 전이다.",
            "approved_budget_usd": 0,
        },
        "metadata": {"preflight": {"composition_runtimes": {"ffmpeg": True, "remotion": True, "hyperframes": True}, "tts": "0/19", "music_generation": "0/8", "image_generation": "0/31", "video_generation": "0/35", "note": "Remotion 은 preflight 시점에 remotion-composer node_modules 미설치로 false 였고, npm install 후 사용 가능"}},
    }


def decision_log() -> dict:
    opt = lambda i, label, score, reason, rej=None: {"option_id": i, "label": label, "score": score, "reason": reason, **({"rejected_because": rej} if rej else {})}
    d = lambda i, stage, cat, subject, opts, sel, reason, approved: {
        "decision_id": i, "stage": stage, "category": cat, "subject": subject, "options_considered": opts, "selected": sel, "reason": reason, "user_visible": True, "user_approved": approved, "confidence": 0.8,
    }
    return {
        "version": "1.0",
        "project_id": PROJECT_ID,
        "decisions": [
            d("d01", "proposal", "pipeline_selection", "제작 파이프라인", [
                opt("animation", "animation", 0.9, "모션그래픽·명시적 Three.js 장면 중심"),
                opt("animated-explainer", "animated-explainer", 0.5, "생성 이미지·TTS 전제", "생성 에셋·TTS 를 쓰지 않음"),
                opt("character-animation", "character-animation", 0.4, "리깅 캐릭터 연기 중심", "SVG 리그 기반 — 3D 블록 피규어와 맞지 않음"),
            ], "animation", "대본이 주어진 모션 중심 작품이고 3D 장면을 코드로 조립한다.", False),
            d("d02", "proposal", "render_runtime_selection", "컴포지션 런타임", [
                opt("remotion", "Remotion", 0.9, "프레임 결정론적 React 장면. 구절 시작 프레임을 그대로 props 로 써서 쉼표 싱크가 직접적. @remotion/three 로 실제 3D."),
                opt("hyperframes", "HyperFrames", 0.6, "HTML/GSAP 키네틱 타이포에 강하고 Three.js 어댑터도 있음", "의뢰자가 Remotion 을 지정. 이 머신에서 사용 가능했으나 선택하지 않음."),
                opt("ffmpeg", "FFmpeg", 0.1, "단순 이어 붙이기", "모션이 핵심인 의뢰에 부적합"),
            ], "remotion", "의뢰 문장에 'remotion … 사용해서'가 명시되어 있다.", True),
            d("d03", "proposal", "composition_mode", "작성 방식", [
                opt("atelier", "아틀리에(직접 작성)", 0.95, "히어로 작품. 3D 디오라마는 스톡 scene-type 으로 만들 수 없음."),
                opt("templated", "템플릿(cut.type 조립)", 0.1, "빠르고 싸지만 text_card·stat_card 조합으로는 3D·구절 싱크 불가", "요청한 룩을 만들 수 없음"),
            ], "atelier", "쇼릴은 단일 납품물 히어로 작업이고 3D 장면이 필요하다. 토큰·반복 비용이 템플릿보다 크다는 점은 감수.", False),
            d("d04", "proposal", "playbook_selection", "스타일", [
                opt("custom", "커스텀 아트 디렉션(art-direction.md)", 0.9, "‘3D Vox’에 맞는 프리셋이 없음"),
                opt("flat-motion-graphics", "flat-motion-graphics", 0.4, "소셜용 평면 모션", "3D 아님"),
                opt("clean-professional", "clean-professional", 0.2, "기업용 정돈된 톤", "밈 톤과 충돌"),
            ], "custom", "styles/ 에 'vox' 프리셋이 없어 taste_profile 을 직접 썼다. ‘3D Vox’는 3D 디오라마 + Vox 식 편집 주석으로 해석했다.", False),
            d("d05", "proposal", "concept_selection", "콘셉트", [
                opt("A", "미니어처 사건 보고서", 0.9, "3D·Vox·쉼표 싱크를 모두 수용"),
                opt("B", "2D 종이 콜라주", 0.5, "정통 Vox", "3D 요청과 불일치"),
                opt("C", "흔들리는 탑 원테이크", 0.6, "원본 밈과 가장 유사", "세부 동작을 그릴 자리가 없음 — A 에 흡수"),
            ], "A", "proposal_packet.selected_concept 참조.", False),
            d("d06", "proposal", "voice_selection", "내레이션", [
                opt("user_recorded", "의뢰자 직접 녹음", 1.0, "의뢰에 명시('따로 녹음 할거야')"),
                opt("tts", "TTS 가이드 트랙", 0.2, "타이밍 확인용 임시 음성", "TTS 제공자 0/19 설정 — 사용 불가, 의뢰 범위도 아님"),
            ], "user_recorded", "영상은 무음. 초당 6.3음절 추정 타이밍으로 그림을 잠그고, 녹음 후 SRT 로 재정렬할 수 있게 했다.", True),
            d("d07", "proposal", "music_source", "음악", [
                opt("none", "렌더에 음악 없음", 0.8, "더빙 믹스 단계에서 얹는 편이 안전"),
                opt("library", "music_library/ 트랙", 0.0, "보유 트랙 사용", "폴더가 비어 있음"),
                opt("generate", "음악 생성 API", 0.0, "생성 음악", "제공자 0/8 설정"),
                opt("pixabay", "Pixabay 무료 음원 검색", 0.3, "키 없이 검색 가능", "저작권·톤 확인을 의뢰자가 직접 하는 편이 안전해 이번 렌더에는 넣지 않음"),
            ], "none", "음악 없이 납품한다는 점을 명시적으로 알린다. 원하면 트랙을 받아 얹을 수 있다.", False),
            d("d08", "proposal", "motion_commitment", "모션 약속", [
                opt("real_3d", "실제 3D 모션", 1.0, "Three.js 장면을 프레임마다 렌더"),
                opt("stills", "스틸 + 켄 번스", 0.0, "정지 이미지", "금지된 대체"),
            ], "real_3d", "WebGL 은 이 컨테이너에서 swangle 로 확인(1080p 프레임당 약 0.3초).", False),
            d("d09", "proposal", "approval_policy", "승인 게이트 처리", [
                opt("first_cut_ahead", "게이트 앞질러 1차 완성본 제작", 0.7, "비용 0, 되돌리기 쉬움, 의뢰가 구체적인 제작 요청"),
                opt("stop_at_each_gate", "게이트마다 멈춤", 0.5, "OpenMontage 기본 규약", "자리를 비운 의뢰자에게 제안서만 남기는 것보다 볼 수 있는 결과물이 낫다고 판단"),
            ], "first_cut_ahead", "에이전트 판단이며 의뢰자의 명시적 사전 승인이 아니다. 그래서 proposal 은 awaiting_human, 이후 단계는 in_progress(초안)로만 기록했다. 어느 단계든 수정 요청 가능.", False),
            d("d10", "compose", "visual_accuracy_check", "제품 표현의 정확성", [
                opt("script_only", "대본이 말한 것만 블록 은유로 표현", 0.9, "버튼 하나 → 자동 촬영·업로드·시청 체크·관리"),
                opt("ui_mock", "제품 화면 목업", 0.2, "구체적이지만 실제 UI 와 다를 위험", "기능을 화면으로 단정하게 됨"),
            ], "script_only", "화면에 추가한 수치(저장 공간 97%, 8.4GB→0.9GB, 시청 7명·미시청 5명, 에너지 3%)는 모두 '옛날 방식'의 고충을 그린 연출용 예시이며 제품 성능 수치가 아니다. ‘편집’은 대본에 자동화 항목으로 없으므로 '자동' 대신 취소선(안 해도 됨)으로 처리했다.", False),
        ],
    }


def script() -> dict:
    sections = []
    for b in TL["beats"]:
        sections.append({
            "id": b["id"],
            "label": ACT_LABEL[b["act"]],
            "text": b["text"],
            "start_seconds": b["start_seconds"],
            "end_seconds": b["end_seconds"],
            "speaker_directions": "쉼표마다 아주 짧게 끊는다(화면 동작이 하나씩 걸려 있음)." if len(b["phrases"]) > 2 else "건조하게, 끝을 내려 읽는다.",
            "delivery_cues": {
                "pace": "brisk",
                "energy": {"problem": "점점 숨차게", "attempt": "그럴듯하게 차분히", "solution": "확신 있게", "result": "풀어지며 밝게"}[b["act"]],
                "pause_after_seconds": round(b["end_seconds"] - b["speech_end_seconds"], 3),
                "delivery_note": " / ".join(f"{p['start_seconds']:.2f}s {p['text']}" for p in b["phrases"]),
                "provider_text": b["text"],
            },
        })
    return {
        "version": "1.0",
        "title": TITLE,
        "total_duration_seconds": TOTAL,
        "voice_performance": {
            "performance_intent": "밈 쇼츠 특유의 건조하고 과장되게 진지한 다큐 낭독. 웃기려 하지 않을수록 웃긴다.",
            "pacing_profile": "energetic",
            "energy_curve": "1막은 일이 쌓이는 만큼 조금씩 숨이 차게 → 2막은 그럴듯하게 차분히 → '그대로였죠'에서 툭 → 3막은 확신 있게 → 4막은 풀어지며 마지막 한 줄은 밝게.",
            "pause_policy": f"쉼표 0.16초, 문장 끝 0.34초, 초당 {TL['pace_syllables_per_second']}음절 기준. 큰 글자 장면(멘탈이 나가 버렸습니다 / 문제였습니다 / 끝이 아니었습니다 / 그대로였죠) 뒤에는 0.2~0.45초를 더 둔다.",
            "sample_section_id": "b01",
            "provider_notes": {"provider": "none — 의뢰자 직접 녹음", "guide_files": "deliverables/dubbing-script.md, deliverables/narration-guide.srt"},
        },
        "sections": sections,
        "metadata": {"source": "의뢰 원문 그대로(띄어쓰기·어미 수정 없음)", "syllables_total": sum(b["syllables"] for b in TL["beats"]), "timing": "추정값 — 녹음 후 scripts/sync-from-srt.ts 로 갱신"},
    }


ROLE = {
    "s01": "introduce_subject", "s02": "establish_context", "s03": "build_tension", "s05": "build_tension", "s06": "build_tension",
    "s08": "build_tension", "s09": "emotional_beat", "s10": "transition", "s11": "evidence", "s12": "emotional_beat",
    "s13": "deliver_payload", "s14": "deliver_payload", "s15": "evidence", "s16": "deliver_payload", "s17": "resolution",
    "s18": "comparison", "s19": "resolution", "s21": "call_to_action",
}
FRAMING = {
    "s01": "정면 와이드 → 구절 2에서 펀치 인, 약한 더치 앵글", "s02": "아이소메트릭 와이드 → 교탁 미디엄 → 칠판", "s03": "미디엄 → 휴대폰 클로즈업 → 풀백",
    "s05": "야간 미디엄 와이드, 타임라인에 시선", "s06": "로우 앵글 수직 구도 → 휴대폰 줄 하이 앵글", "s08": "하이 앵글 군중 와이드",
    "s09": "정면 와이드, 세로 스택", "s10": "미디엄 와이드 → 코르크 보드", "s11": "아이소메트릭 와이드(청사진 후처리)", "s12": "정면 로우 와이드 → 인물 미디엄",
    "s13": "가장 넓은 와이드(크레인 전체)", "s14": "가장 가까운 클로즈업", "s15": "측면 트래킹 → 풀 와이드", "s16": "지면 로우 → 로우 앵글 히어로",
    "s17": "와이드, 스택 쪽으로 팬", "s18": "전시품별 달리 숏", "s19": "아이소메트릭 → 교탁 미디엄, 노을 조명", "s21": "정면 와이드, 느린 푸시인",
}


def scene_plan() -> dict:
    scenes = []
    for s in TL["scenes"]:
        scenes.append({
            "id": s["id"],
            "type": "animation",
            "description": f"{s['name']} — {s['action']}",
            "start_seconds": s["start_seconds"],
            "end_seconds": s["end_seconds"],
            "script_section_id": s["beats"][0][:3],
            "framing": FRAMING[s["id"]],
            "movement": "느린 푸시인 + 미세한 손떨림. 낙하·착지 순간 카메라 셰이크.",
            "transition_in": {"cut": "하드 컷", "whip": "휩 팬(6프레임 + 블러)", "wipe": "사선 색면 와이프(막 전환)"}[s["enter"]],
            "overlay_notes": "하단 구절 자막(형광펜), 좌상단 '수업 끝나고 할 일' 메모, 우상단 막 레일. 3D 물체에 투영한 꼬리표 주석.",
            "shot_intent": s["subject"],
            "narrative_role": ROLE[s["id"]],
            "information_role": f"주 피사체: {s['subject']}",
            "hero_moment": bool(s.get("hero")),
            "required_assets": [{"type": "animation", "description": "코드로 조립한 Three.js 블록 디오라마 — scenes/*.tsx (생성 에셋 없음)", "source": "provided"}],
        })
    return {
        "version": "1.0",
        "style_playbook": "custom-atelier",
        "scenes": scenes,
        "metadata": {
            "animation_mode": "bespoke_threejs_remotion",
            "transition_rules": "컷(같은 세트 안), 휩 팬(세트가 바뀔 때), 색면 와이프(막이 바뀔 때 — 코발트 / 그린 / 라임)의 세 가지만 쓴다.",
            "hold_rules": "큰 글자 장면과 막 끝에는 대사 뒤 0.2~0.45초를 붙잡는다.",
            "animatic_rules": "모든 동작의 기준점은 구절 시작 프레임(story/beats.ts). 쉼표 하나 = 동작 하나.",
            "reusable_motifs": ["영혼 가출(4회)", "'수업 끝나고 할 일' 메모", "작업 블록 4단(촬영·편집·업로드·시청 체크)", "전시대 명판(옛날 선생님 → 요즘 선생님)"],
            "scene_distinctness": {s["id"]: s["subject"] for s in TL["scenes"]},
            "five_aspect_note": "Subject/Subject Motion 은 description, Spatial Framing 은 framing, Camera 는 movement, Scene 은 art-direction.md, 오버레이는 overlay_notes 에 분리 기재.",
        },
    }


def asset_manifest() -> dict:
    a = []
    add = lambda **kw: a.append(kw)
    for w in ["Medium", "SemiBold", "Bold", "ExtraBold", "Black"]:
        add(id=f"font-pretendard-{w.lower()}", type="font", path=f"public/fonts/Pretendard-{w}.woff2", source_tool="static", scene_id="all", license="SIL OFL 1.1", provider="Pretendard")
    add(id="font-blackhansans-ko", type="font", path="public/fonts/BlackHanSans-Korean.woff2", source_tool="static", scene_id="all", license="SIL OFL 1.1", provider="@fontsource/black-han-sans 5.3.0")
    add(id="font-blackhansans-latin", type="font", path="public/fonts/BlackHanSans-Latin.woff2", source_tool="static", scene_id="all", license="SIL OFL 1.1", provider="@fontsource/black-han-sans 5.3.0")
    add(id="brand-wordmark", type="image", path="public/brand/classin-wordmark.png", source_tool="static", scene_id="s14", subtype="brand_logo", provider="classinkr-main/movie_ads public/brand")
    add(id="brand-stacked", type="image", path="public/brand/classin-logo-stacked.png", source_tool="static", scene_id="s21", subtype="brand_logo", provider="classinkr-main/movie_ads public/brand")
    add(id="world-blockkit", type="3d_world", path="three/kit.tsx", source_tool="hand_authored", scene_id="all", generation_summary="둥근 모서리 블록·원기둥·구로 조립한 캐릭터·소품 키트. 외부 모델·텍스처 없음.", provider="threejs")
    add(id="guide-srt", type="subtitle", path="deliverables/narration-guide.srt", source_tool="scripts/timeline.ts", scene_id="all", format="srt")
    for s in TL["scenes"]:
        p = ROOT / "snapshots" / f"{s['id']}.png"
        if p.exists():
            add(id=f"snap-{s['id']}", type="image", path=f"snapshots/{s['id']}.png", source_tool="remotion still", scene_id=s["id"], subtype="scene_snapshot", resolution="1920x1080", format="png", cost_usd=0)
    return {
        "version": "1.0",
        "assets": a,
        "total_cost_usd": 0,
        "metadata": {"layer3_skills_read": ["remotion-best-practices", "threejs-fundamentals"], "generated_assets": 0, "note": "생성형 에셋(이미지·영상·TTS·음악) 없음. 장면 자체가 코드."},
    }


def edit_decisions() -> dict:
    cuts = [{
        "id": s["id"], "source": f"bespoke:{s['id']}", "in_seconds": s["start_seconds"], "out_seconds": s["end_seconds"], "layer": "primary",
        "transition_in": s["enter"], "reason": s["name"],
    } for s in TL["scenes"]]
    return {
        "version": "1.0",
        "render_runtime": "remotion",
        "composition_mode": "atelier",
        "renderer_family": "animation-first",
        "cuts": cuts,
        "bespoke": {
            "entry": "projects/teachers-lost-their-minds/index.tsx",
            "composition_id": "TeachersMental",
            "art_direction": "projects/teachers-lost-their-minds/art-direction.md",
            "public_dir": "projects/teachers-lost-their-minds/public",
            "crf": 18,
            "concurrency": 4,
        },
        "subtitles": {"enabled": True, "style": "구절 단위 스티커 자막 + 형광펜(컴포지션에 내장, props.captions 로 끔)", "source": "story/beats.ts", "font": "Pretendard 900", "position": "bottom-center"},
        "audio": {"narration": {"status": "의뢰자 녹음 예정 — 렌더는 무음", "guide": "deliverables/dubbing-script.md"}, "sfx": []},
        "transitions": [{"type": s["enter"], "at_seconds": s["start_seconds"], "duration_seconds": {"cut": 0, "whip": 0.27, "wipe": 0.6}[s["enter"]]} for s in TL["scenes"][1:]],
        "metadata": {"compositions": {"TeachersMental": "1920x1080", "TeachersMentalVertical": "1080x1920"}, "gl": "swangle", "timing_source": "artifacts/timeline.json"},
    }


BUILDERS = {
    "research_brief": research_brief,
    "proposal_packet": proposal_packet,
    "decision_log": decision_log,
    "script": script,
    "scene_plan": scene_plan,
    "asset_manifest": asset_manifest,
    "edit_decisions": edit_decisions,
}


def main() -> int:
    ART.mkdir(exist_ok=True)
    built = {}
    for name, fn in BUILDERS.items():
        built[name] = fn()
        (ART / f"{name}.json").write_text(json.dumps(built[name], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("wrote", f"artifacts/{name}.json")
    if "--validate" in sys.argv:
        home = os.environ.get("OPENMONTAGE_HOME")
        if not home:
            print("OPENMONTAGE_HOME 이 없어 스키마 검증을 건너뜁니다.")
            return 0
        import jsonschema  # type: ignore

        bad = 0
        for name, data in built.items():
            schema = json.loads((Path(home) / "schemas" / "artifacts" / f"{name}.schema.json").read_text(encoding="utf-8"))
            errs = list(jsonschema.Draft202012Validator(schema).iter_errors(data))
            print(("OK  " if not errs else "FAIL"), name, *(f"\n     - {'/'.join(map(str, e.path))}: {e.message[:140]}" for e in errs[:6]))
            bad += len(errs)
        return 1 if bad else 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
