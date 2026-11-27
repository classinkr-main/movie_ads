#!/usr/bin/env python3
"""개별진도 오프닝 제작기 — 요약판(비개발자용). 도구 이름 없이 역할 중심, 큰 글씨.

사용: python3 build_summary.py <썸네일 폴더> <본문만.html> <단독 실행용.html>
"""
import base64
import sys
from pathlib import Path

TH = Path(sys.argv[1])
OUT_BODY = Path(sys.argv[2])
OUT_FULL = Path(sys.argv[3])
SIMPLE = len(sys.argv) > 4 and sys.argv[4] == "simple"  # 같은 구조, 글을 더 줄인 한눈판


def img(name: str) -> str:
    return "data:image/jpeg;base64," + base64.b64encode((TH / name).read_bytes()).decode()


def L(ko: str, zh: str, tag: str = "span", cls: str = "") -> str:
    c = f' class="{cls}"' if cls else ""
    return f'<{tag}{c}><span class="ko" lang="ko">{ko}</span><span class="zh" lang="zh">{zh}</span></{tag}>'


def B(ko: str, zh: str, tag: str = "p", cls: str = "") -> str:
    c = f" {cls}" if cls else ""
    return f'<{tag} class="ko{c}" lang="ko">{ko}</{tag}><{tag} class="zh{c}" lang="zh">{zh}</{tag}>'


def sec(no: str, ko: str, zh: str) -> str:
    return f'<div class="sec-h"><span class="no">{no}</span>{L(ko, zh, "h2")}</div>'


ICONS = {
    "person": '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2c1.3-3.7 4-5.6 7.2-5.6s5.9 1.9 7.2 5.6"/>',
    "film": '<rect x="3" y="5" width="18" height="14" rx="1.6"/><path d="M3 9h18M3 15h18M7.5 5v4M12 5v4M16.5 5v4"/>',
    "music": '<path d="M9 17.6V6.2l10-2.1v11.4"/><circle cx="6.6" cy="17.8" r="2.4"/><circle cx="16.6" cy="15.6" r="2.4"/>',
}


def ico(name: str) -> str:
    return (
        '<svg class="ico" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="none" stroke="currentColor" '
        f'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>'
    )


STATS = [
    ("30<small>초</small>", "30<small>秒</small>", "설명회 오프닝 영상 1편", "说明会开场视频1条"),
    ("4<small>번</small>", "4<small>次</small>", "고쳐서 완성", "修改后定稿"),
    ("5<small>시간 반</small>", "5.5<small>小时</small>", "첫 요청부터 완성까지", "从首次需求到定稿"),
    ("0<small>장</small>", "0<small>张</small>", "가져온 사진 없이 화면을 새로 그림", "未用现成图片，画面全部重新绘制"),
]

ROLES = [
    ("person", "human", "사람 · 디렉터", "人 · 导演", "방향을 정하고 판단", "定方向、做判断",
     ["무엇을 만들지 정합니다", "시안을 보고 고칠 점을 말합니다", "최종 결정을 내립니다"],
     ["决定做什么", "看样片并提出修改意见", "做最终决定"]),
    ("film", "main", "AI 담당자 ①", "AI负责人 ①", "기획부터 완성까지 제작", "从策划到成片的制作",
     ["기획안과 화면 디자인", "영상 제작과 수정", "표기 점검, 설명회 페이지에 넣기"],
     ["写策划、做画面设计", "制作并修改视频", "检查标注，放进说明会页面"]),
    ("music", "sub", "AI 담당자 ②", "AI负责人 ②", "음악을 동시에 따로 제작", "同时单独制作配乐",
     ["배경 음악 작곡", "장면이 바뀔 때 나는 효과음", "소리 크기 맞추기"],
     ["创作背景音乐", "转场音效", "统一音量"]),
]

REFS = [
    ("회사 자료", "公司资料", ["본사 과제 안내", "영상 제작 브리프", "원장 설명회 페이지"], ["总部作业说明", "视频制作简报", "校长说明会页面"]),
    ("ClassIn 실제 화면", "ClassIn真实界面", ["공식 홈페이지의 앱 화면", "AI 강의 분석 기능 소개 문서", "앱 첫 화면 캡처"], ["官网上的App界面", "AI课堂分析功能介绍文档", "App首页截图"]),
]

VERS = [
    ("v1.jpg", "v1", "어두운 화면 · 빛나는 효과", "'AI가 만든 티'가 난다", "深色画面 · 发光效果", "“AI感”太重"),
    ("v2.jpg", "v2", "도면 · 노선도 그림", "실제 앱 화면처럼, 손글씨 느낌으로", "平面图 · 线路图", "像真实App界面，加手写感"),
    ("v3.jpg", "v3", "공책 + ClassIn 앱 화면", "학생별 진도판을 넣고, 동그라미는 채점처럼", "笔记本 + ClassIn App界面", "加入学生进度看板，圆圈改成批改样式"),
    ("v4.jpg", "v4", "완성본", "제출", "定稿", "提交"),
]

LEARN = [
    ("사람은 판단, AI는 제작", "人做判断，AI做制作",
     "무엇을 어떻게 보여 줄지는 사람이 정하고, 만드는 일은 AI에 맡겼습니다. 피드백 한 번이 바로 새 시안이 됐습니다.",
     "展示什么、怎么展示由人决定，制作交给AI。每次反馈都能马上变成新样片。"),
    ("'AI 티'는 사람이 잡는다", "“AI感”要靠人来把关",
     "첫 시안은 화려했지만 AI가 만든 느낌이 강했습니다. 원장님께는 손글씨·종이 느낌과 실제 앱 화면이 더 잘 맞았습니다.",
     "初版很华丽，但AI感太重。面向校长，手写·纸张质感加真实App界面更合适。"),
    ("다음에는", "下一步",
     "실제 앱 녹화 화면으로 일부를 바꾸고, 휴대폰용 세로 영상도 만들 수 있습니다.",
     "用真实App录屏替换部分画面，并制作手机用竖版视频。"),
]

if SIMPLE:
    STATS = [
        ("30<small>초</small>", "30<small>秒</small>", "오프닝 영상", "开场视频"),
        ("4<small>번</small>", "4<small>次</small>", "고쳐서 완성", "修改后定稿"),
        ("5<small>시간 반</small>", "5.5<small>小时</small>", "요청부터 완성까지", "从需求到定稿"),
        ("0<small>장</small>", "0<small>张</small>", "가져온 사진 없음", "未用现成图片"),
    ]
    ROLES = [
        ("person", "human", "사람 · 디렉터", "人 · 导演", "방향 결정 · 최종 판단", "定方向 · 做决定", [], []),
        ("film", "main", "AI 담당자 ①", "AI负责人 ①", "기획 · 디자인 · 영상 제작", "策划 · 设计 · 视频制作", [], []),
        ("music", "sub", "AI 담당자 ②", "AI负责人 ②", "배경 음악 · 효과음", "背景音乐 · 音效", [], []),
    ]
    REFS = [
        ("회사 자료", "公司资料", ["과제 안내 · 제작 브리프 · 설명회 페이지"], ["作业说明 · 制作简报 · 说明会页面"]),
        ("ClassIn 실제 화면", "ClassIn真实界面", ["앱 화면 · 기능 소개 문서"], ["App界面 · 功能介绍文档"]),
    ]
    VERS = [
        ("v1.jpg", "v1", "어두운 화면", "AI 티 빼기", "深色画面", "去掉AI感"),
        ("v2.jpg", "v2", "도면 그림", "앱 화면처럼", "平面图", "改成App界面风格"),
        ("v3.jpg", "v3", "공책 + 앱 화면", "진도판 추가", "笔记本 + App界面", "加入进度看板"),
        ("v4.jpg", "v4", "완성본", "제출", "定稿", "提交"),
    ]

ARROW_DOWN = '<svg width="18" height="30" viewBox="0 0 16 26" aria-hidden="true"><path d="M8 2 V22 M3 17 L8 23 L13 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROW_UP = '<svg width="18" height="30" viewBox="0 0 16 26" aria-hidden="true"><path d="M8 24 V4 M3 9 L8 3 L13 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROW_LR = '<svg width="40" height="18" viewBox="0 0 34 16" aria-hidden="true"><path d="M2 8 H32 M26 3 L32 8 L26 13 M8 3 L2 8 L8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

CSS = """
:root {
  --paper: #F2F3EE; --sheet: #FCFCF8; --ink: #1D2321; --sub: #4F5652; --line: rgba(29,35,33,.14); --grid: rgba(0,140,100,.07);
  --green: #00A975; --green-ink: #0A7A55; --red: #D9473A; --navy: #2A4A94;
  --display: "Gowun Batang", "Noto Serif KR", serif;
  --body: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --hand: "Nanum Pen Script", cursive;
  color-scheme: light;
}
html[data-lang="zh"] {
  --display: "Noto Serif SC", "Songti SC", serif;
  --body: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --hand: "Long Cang", "KaiTi", cursive;
}
html:not([data-lang="zh"]) .zh, html[data-lang="zh"] .ko { display: none !important; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background-color: var(--paper); color: var(--ink); font-family: var(--body); font-size: 17px; line-height: 1.6;
  background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 28px 28px;
}
.wrap { position: relative; max-width: 1180px; margin: 0 auto; padding-block: 50px 40px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 48px; }
.wrap > * { min-width: 0; }
.toolbar { position: absolute; top: 12px; right: max(16px, env(safe-area-inset-right, 0px)); display: flex; gap: 6px; z-index: 5; }
.toolbar button { font: 700 14px var(--body); padding: 7px 13px; border-radius: 999px; border: 1.5px solid var(--ink); background: var(--sheet); color: var(--ink); cursor: pointer; }
.toolbar button[aria-pressed="true"] { background: var(--ink); color: var(--sheet); }
.toolbar button:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }
html.print .toolbar { display: none; }

.eyebrow { font-family: var(--hand); color: var(--red); font-size: 32px; line-height: 1; }
h1 { font-family: var(--display); font-weight: 700; font-size: clamp(30px, 4.4vw, 52px); line-height: 1.22; letter-spacing: -0.02em; margin: 12px 0 14px; }
h1 em { font-style: normal; color: var(--green-ink); background: linear-gradient(transparent 66%, rgba(0,169,117,.2) 66%); }
.lede { color: var(--sub); font-size: 18px; margin: 0; max-width: 62ch; }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border-top: 2px solid var(--ink); margin-top: 28px; }
.stat { padding: 16px 14px 14px 0; border-bottom: 1px solid var(--line); min-width: 0; }
.stat .num { font-family: var(--display); font-weight: 700; font-size: 46px; line-height: 1; letter-spacing: -0.02em; white-space: nowrap; }
.stat .num small { font-size: 20px; margin-left: 3px; color: var(--sub); letter-spacing: 0; }
.stat .cap { color: var(--sub); font-size: 15px; margin-top: 8px; }

.sec-h { display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px; }
.sec-h .no { font-family: var(--hand); color: var(--red); font-size: 34px; line-height: 1; }
h2 { font-family: var(--display); font-weight: 700; font-size: 31px; line-height: 1.25; letter-spacing: -0.015em; margin: 0; }

/* 역할 */
.org { display: grid; gap: 14px; }
.role.top { width: min(560px, 100%); justify-self: center; }
.row2 { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 16px; align-items: stretch; }
.link { display: flex; align-items: center; justify-content: center; gap: 10px; font-family: var(--hand); font-size: 26px; line-height: 1; color: var(--sub); }
.link .gap { width: 22px; }
.link svg { flex: none; }
.link.side { flex-direction: column; gap: 4px; color: var(--navy); }
.role { position: relative; background: var(--sheet); padding: 24px 24px 22px; border-top: 5px solid var(--ink); box-shadow: 0 12px 30px rgba(40,50,45,.11), 0 1px 3px rgba(40,50,45,.08); min-width: 0; }
.role.human { border-top-color: var(--red); }
.role.main { border-top-color: var(--green-ink); }
.role.sub { border-top-color: var(--navy); }
.role .ico { display: block; margin-bottom: 10px; }
.role.human .ico, .role.human .who { color: var(--red); }
.role.main .ico, .role.main .who { color: var(--green-ink); }
.role.sub .ico, .role.sub .who { color: var(--navy); }
.role .who { font-weight: 800; font-size: 16px; }
.role .what { font-family: var(--display); font-weight: 700; font-size: 23px; line-height: 1.3; margin-top: 4px; }
.role ul { margin: 14px 0 0; padding: 14px 0 0; border-top: 1px dashed var(--line); list-style: none; display: grid; gap: 7px; }
.role li { position: relative; padding-left: 18px; font-size: 16.5px; }
.role li::before { content: ""; position: absolute; left: 2px; top: .7em; width: 7px; height: 7px; border-radius: 99px; background: currentColor; opacity: .35; }
.roles-note { font-family: var(--hand); font-size: 27px; line-height: 1.15; color: var(--green-ink); margin: 18px 0 0; }

/* 참고 */
.refs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.ref { border: 1.5px solid var(--ink); border-radius: 6px; padding: 18px 22px; background: var(--sheet); min-width: 0; }
.ref h3 { margin: 0 0 8px; font-size: 18px; font-weight: 900; }
.ref ol { margin: 0; padding-left: 22px; display: grid; gap: 4px; font-size: 16.5px; }
.ref p.one { margin: 0; font-size: 17px; }
.fine { font-size: 15px; color: var(--sub); margin: 14px 0 0; }

/* 버전 */
.vers { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; }
.ver { margin: 0; min-width: 0; }
.vimg { position: relative; }
.vimg img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; border-radius: 3px; box-shadow: 0 6px 16px rgba(30,40,35,.14); }
.vtag { position: absolute; left: 8px; top: 8px; background: var(--ink); color: var(--sheet); font: 800 13px var(--body); padding: 3px 9px; border-radius: 3px; }
.ver.last .vtag { background: var(--green-ink); }
.ver .vt { font-weight: 800; font-size: 16px; margin-top: 10px; }
.ver .fb { font-family: var(--hand); font-size: 25px; line-height: 1.12; color: var(--red); margin-top: 6px; }
.ver.last .fb { color: var(--green-ink); }
.ver .fb::before { content: "→ "; }

/* 시간 막대 */
.time { margin-top: 30px; }
.time-h { font-weight: 800; font-size: 17px; margin-bottom: 10px; }
.tbar { display: flex; height: 44px; border-radius: 4px; overflow: hidden; border: 1.5px solid var(--ink); }
.tbar .ai { background: var(--green-ink); color: #fff; display: flex; align-items: center; padding: 0 14px; font-weight: 800; font-size: 15.5px; white-space: nowrap; }
.tbar .rest { flex: 1; background: repeating-linear-gradient(135deg, #E4E6E1 0 8px, #EDEFEA 8px 16px); color: var(--sub); display: flex; align-items: center; padding: 0 14px; font-weight: 700; font-size: 15.5px; white-space: nowrap; overflow: hidden; }
.time p { margin: 10px 0 0; font-size: 15.5px; color: var(--sub); }

/* 배운 점 */
.learn { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; border-top: 2px solid var(--ink); padding-top: 18px; }
.learn h3 { margin: 0 0 8px; font-size: 19px; font-weight: 900; }
.learn p { margin: 0; font-size: 16.5px; color: #2E3532; }

footer { display: flex; flex-wrap: wrap; gap: 8px 22px; justify-content: space-between; color: var(--sub); font-size: 14px; border-top: 1px solid var(--line); padding-top: 12px; }
footer b { color: var(--ink); }

@media (max-width: 900px) {
  .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .learn { grid-template-columns: minmax(0, 1fr); }
  .row2 { grid-template-columns: minmax(0, 1fr); }
  .link.side { flex-direction: row; }
  .vers { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .wrap { padding-top: 60px; gap: 40px; }
  .refs { grid-template-columns: minmax(0, 1fr); }
  .stat .num { font-size: 38px; }
  .tbar .rest span { display: none; }
}
"""

JS = """
(() => {
  const root = document.documentElement;
  const ko = document.getElementById("lang-ko");
  const zh = document.getElementById("lang-zh");
  const apply = () => {
    const h = (location.hash || "").replace("#", "");
    const lang = h.startsWith("zh") ? "zh" : "ko";
    root.classList.toggle("print", h.endsWith("-print"));
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang === "zh" ? "zh-Hans" : "ko");
    ko.setAttribute("aria-pressed", String(lang === "ko"));
    zh.setAttribute("aria-pressed", String(lang === "zh"));
    document.title = lang === "zh" ? "开场视频 制作摘要" : "오프닝 영상 제작 요약";
  };
  const go = (lang) => { try { history.replaceState(null, "", "#" + lang); } catch (e) { location.hash = lang; } apply(); };
  ko.addEventListener("click", () => go("ko"));
  zh.addEventListener("click", () => go("zh"));
  window.addEventListener("hashchange", apply);
  apply();
})();
"""

HEAD = f"""<title>오프닝 영상 제작 요약</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@400;500;700;800;900&family=Noto+Sans+SC:wght@400;500;700;800;900&family=Noto+Serif+SC:wght@700&family=Long+Cang&display=swap">
<style>{CSS}</style>"""


def body() -> str:
    stats = "".join(
        f'<div class="stat">{L(nk, nz, "div", "num")}{L(ck, cz, "div", "cap")}</div>' for nk, nz, ck, cz in STATS
    )
    cards = []
    for icon, cls, wk, wz, ak, az, lk, lz in ROLES:
        items = "".join(f"<li>{L(a, b)}</li>" for a, b in zip(lk, lz))
        ul = f"<ul>{items}</ul>" if items else ""
        cards.append(f'<div class="role {cls}">{ico(icon)}{L(wk, wz, "div", "who")}{L(ak, az, "div", "what")}{ul}</div>')
    human, main_ai, sub_ai = cards
    human = human.replace('class="role human"', 'class="role human top"')
    roles = (
        f'<div class="org">{human}'
        f'<div class="link">{ARROW_DOWN}{L("요청 · 피드백", "需求 · 反馈")}<span class="gap"></span>{ARROW_UP}{L("시안 확인", "查看样片")}</div>'
        f'<div class="row2">{main_ai}<div class="link side">{ARROW_LR}{L("맡김 · 반납", "委派 · 交回")}</div>{sub_ai}</div></div>'
    )
    refs = ""
    for hk, hz, ik, iz in REFS:
        if len(ik) == 1:
            refs += f'<div class="ref">{L(hk, hz, "h3")}{L(ik[0], iz[0], "p", "one")}</div>'
            continue
        items = "".join(f"<li>{L(a, b)}</li>" for a, b in zip(ik, iz))
        refs += f'<div class="ref">{L(hk, hz, "h3")}<ol>{items}</ol></div>'
    vers = "".join(
        f'<figure class="ver{" last" if v == "v4" else ""}"><div class="vimg"><img src="{img(f)}" alt="{v}"><span class="vtag">{v}</span></div>'
        f'{L(k1, z1, "div", "vt")}{L(k2, z2, "div", "fb")}</figure>'
        for f, v, k1, k2, z1, z2 in VERS
    )
    learn = "".join(f'<div>{L(hk, hz, "h3")}{B(pk, pz, "p")}</div>' for hk, hz, pk, pz in LEARN)
    ai_pct = round(103 / 333 * 100, 1)

    return f"""
<main class="wrap">
  <div class="toolbar" role="group" aria-label="언어 / 语言">
    <button id="lang-ko" type="button" aria-pressed="true">한국어</button>
    <button id="lang-zh" type="button" aria-pressed="false">中文</button>
  </div>

  <header>
    {L("新媒体工作流 과제 · 제작 요약", "新媒体工作流 作业 · 制作摘要", "div", "eyebrow")}
    {B("사람 한 명과 AI 둘이<br>함께 만든 <em>30초 오프닝 영상</em>", "一个人和两个AI<br>一起完成的<em>30秒开场视频</em>", "h1")}
    {B("학원 원장님 설명회 맨 앞에 트는 ‘개별진도 × ClassIn + AI’ 소개 영상입니다. 사람은 방향을 정하고, 만드는 일은 AI 둘이 나눠 맡았습니다.",
       "这是在补习机构校长说明会开场播放的“个别进度 × ClassIn + AI”介绍视频。人负责定方向，制作由两个AI分工完成。", "p", "lede")}
    <div class="stats">{stats}</div>
  </header>

  <section>
    {sec("01", "누가 무엇을 했나", "谁做了什么")}
    {roles}
    {B("AI 둘이 동시에 일해서, 음악을 기다리는 시간 없이 영상과 음악이 함께 완성됐습니다.", "两个AI同时工作，视频和配乐同步完成，不用互相等待。", "p", "roles-note")}
  </section>

  <section>
    {sec("02", "무엇을 참고했나", "参考了什么")}
    <div class="refs">{refs}</div>
    {B("캡처 화면은 그대로 쓰지 않고, 같은 모양을 가상의 학생·점수로 다시 그렸습니다. 실제 이름이나 고객 정보는 들어가지 않습니다.",
       "截图没有直接使用，而是用虚拟的学生和分数重新绘制相同的样式，不包含真实姓名或客户信息。", "p", "fine")}
  </section>

  <section>
    {sec("03", "어떻게 완성했나", "怎么完成的")}
    <div class="vers">{vers}</div>
    <div class="time">
      {L("하루 작업 시간 5시간 반 중", "一天5.5小时的工作中", "div", "time-h")}
      <div class="tbar" role="img" aria-label="AI 작업 1시간 43분, 검토와 대기 3시간 50분">
        <div class="ai" style="width:{ai_pct}%">{L("AI 작업 1시간 43분", "AI工作 1小时43分")}</div>
        <div class="rest"><span>{L("사람이 보고 판단하는 시간 · 대기", "人审阅、判断及等待")}</span></div>
      </div>
      {B("빨간 글씨가 사람의 피드백입니다. 피드백을 받으면 AI가 바로 고쳐 다음 시안을 보여 주는 방식으로 네 번 만에 완성했습니다.",
         "红字是人的反馈。收到反馈后AI立即修改并给出下一版，共四版完成。", "p")}
    </div>
  </section>

  <footer>
    {L("<b>개별진도 × ClassIn + AI</b> · ClassIn 한국 · 2026.11", "<b>个别进度 × ClassIn + AI</b> · ClassIn 韩国 · 2026.11")}
    {L("영상 속 학생과 점수는 모두 가상입니다", "视频中的学生与分数均为虚拟")}
  </footer>
</main>
<script>{JS}</script>
"""


BODY = body()
if SIMPLE:
    import re
    # 설명 문장은 빼고 한 줄 소개만 남긴다
    BODY = re.sub(r'<p class="(ko|zh) (roles-note|fine)" lang="(ko|zh)">.*?</p>', "", BODY, flags=re.S)
    BODY = re.sub(r'<p class="(ko|zh)" lang="(ko|zh)">(빨간 글씨|红字).*?</p>', "", BODY, flags=re.S)
    BODY = re.sub(r'(<p class="ko lede" lang="ko">).*?(</p>)', r"\1사람은 방향을 정하고, AI 둘이 나눠 만들었습니다.\2", BODY, flags=re.S)
    BODY = re.sub(r'(<p class="zh lede" lang="zh">).*?(</p>)', r"\1人定方向，两个AI分工制作。\2", BODY, flags=re.S)
    BODY = BODY.replace("제작 요약", "한눈에 보기").replace("制作摘要", "一页看懂").replace("오프닝 영상 제작 요약", "오프닝 영상 한눈에 보기")
    HEAD = HEAD.replace("오프닝 영상 제작 요약", "오프닝 영상 한눈에 보기")
OUT_BODY.write_text(HEAD + "\n" + BODY, encoding="utf-8")
OUT_FULL.write_text(
    '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    f"{HEAD}\n</head>\n<body>\n{BODY}\n</body>\n</html>\n",
    encoding="utf-8",
)
print("wrote", OUT_BODY, "|", OUT_FULL)
