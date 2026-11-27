#!/usr/bin/env python3
"""개별진도 오프닝 제작기 인포그래픽(HTML) 생성기.

- 한국어/중국어 전환(#ko, #zh). 인쇄·캡처용(#ko-print, #zh-print)은 언어 버튼을 숨긴다.
- 썸네일은 data URI로 넣어 파일 하나로 열린다.
- 숫자는 세션 기록(2026-11-23, UTC → KST)과 git 기록에서 뽑은 값이다.

사용: python3 build_info.py <썸네일 폴더> <본문만.html> <단독 실행용.html>
"""
import base64
import html
import sys
from pathlib import Path

TH = Path(sys.argv[1])
OUT_BODY = Path(sys.argv[2])
OUT_FULL = Path(sys.argv[3])


def img(name: str) -> str:
    return "data:image/jpeg;base64," + base64.b64encode((TH / name).read_bytes()).decode()


def L(ko: str, zh: str, tag: str = "span", cls: str = "") -> str:
    """한 요소 안에 두 언어를 나란히 둔다(보이지 않는 쪽은 CSS로 숨김)."""
    c = f' class="{cls}"' if cls else ""
    return f'<{tag}{c}><span class="ko" lang="ko">{ko}</span><span class="zh" lang="zh">{zh}</span></{tag}>'


def B(ko: str, zh: str, tag: str = "p", cls: str = "") -> str:
    """블록 요소를 언어별로 따로 둔다."""
    c = f" {cls}" if cls else ""
    return f'<{tag} class="ko{c}" lang="ko">{ko}</{tag}><{tag} class="zh{c}" lang="zh">{zh}</{tag}>'


def sec(no: str, ko: str, zh: str) -> str:
    return f'<div class="sec-h"><span class="no">{no}</span>{L(ko, zh, "h2")}</div>'


ICONS = {
    "person": '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2c1.3-3.7 4-5.6 7.2-5.6s5.9 1.9 7.2 5.6"/>',
    "term": '<rect x="3" y="4.5" width="18" height="15" rx="1.6"/><path d="M7 10l3 2.4L7 14.8M12.6 15.2h4.4"/>',
    "music": '<path d="M9 17.6V6.2l10-2.1v11.4"/><circle cx="6.6" cy="17.8" r="2.4"/><circle cx="16.6" cy="15.6" r="2.4"/>',
}


def ico(name: str) -> str:
    return (
        '<svg class="ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" '
        f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</svg>'
    )


ARROW_DOWN = '<svg width="16" height="26" viewBox="0 0 16 26" aria-hidden="true"><path d="M8 2 V22 M3 17 L8 23 L13 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROW_UP = '<svg width="16" height="26" viewBox="0 0 16 26" aria-hidden="true"><path d="M8 24 V4 M3 9 L8 3 L13 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROW_LR = '<svg width="34" height="16" viewBox="0 0 34 16" aria-hidden="true"><path d="M2 8 H32 M26 3 L32 8 L26 13 M8 3 L2 8 L8 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'

# ── 내용 ────────────────────────────────────────────────────────────────
STATS = [
    ("2", "AI 에이전트", "메인 1 · 서브 1, 동시에", "AI智能体", "主1 · 子1，同时进行"),
    ("5<small>h</small>33<small>m</small>", "첫 요청 → 최종본", "그중 메인 실작업 1h 43m", "首次需求 → 定稿", "其中主智能体实际工作 1h 43m"),
    ("4", "버전", "피드백 4회, 코드로 바로 반영", "版本", "4轮反馈，改代码即时更新"),
    ("320", "도구 호출", "메인 268 · 서브 52", "工具调用", "主268 · 子52"),
    ("3,740", "코드 줄", "장면 7 · 아이콘 44 · 음악 합성", "代码行数", "7个场景 · 44个图标 · 配乐合成"),
    ("0", "생성 크레딧", "이미지·영상 생성 없이 전부 코드", "生成额度", "未用图像/视频生成，全部代码实现"),
]

SCENES = [
    ("scene_100.jpg", "0s", "여섯 갈래 진도", "六条进度线"),
    ("scene_225.jpg", "4s", "손이 많이 간다", "管理太费力"),
    ("scene_285.jpg", "8s", "한 화면으로", "汇入一个界面"),
    ("scene_405.jpg", "10s", "개별진도 대시보드", "个别进度仪表盘"),
    ("scene_525.jpg", "14s", "수업 · AI 강의분석", "课堂 · AI课堂分析"),
    ("scene_700.jpg", "18s", "원장 화면 · 리포트", "校长视图 · 报告"),
    ("scene_899.jpg", "24s", "손은 덜고, 촘촘하게", "省力又精细"),
]

TOOLS = [
    ("Remotion", "영상 렌더", "视频渲染"),
    ("Python", "음악 · 글꼴 · 종이 질감", "配乐 · 字体 · 纸张质感"),
    ("ffmpeg", "인코딩 · 검수 시트", "编码 · 质检联系表"),
    ("Playwright", "HTML 재생 검증", "HTML播放验证"),
    ("Notion · Drive · 웹", "자료 수집", "素材收集"),
    ("GitHub", "버전 관리 · 커밋 6회", "版本管理 · 6次提交"),
]

REFS = [
    ("본사 과제 원문", "제출 요건: 영상 1편 + 제작 설명 · 복기", "总部作业原文", "提交要求：视频1条 + 制作说明 · 复盘"),
    ("제작 브리프 v1.0", "대상 · 메시지 · 금지 사항", "制作简报 v1.0", "受众 · 核心信息 · 禁用事项"),
    ("설명회 페이지 v2.2", "기능 상태표(지금 됨 / 개발 필요) · 가상 반 데이터", "说明会页面 v2.2", "功能状态表（已上线 / 待开发）· 虚拟班级数据"),
    ("ClassIn 공식 사이트", "수업 다시보기 · AI 강의 분석 · 칠판 화면", "ClassIn 官网", "课程回放 · AI课堂分析 · 板书界面"),
    ("Notion 「AI 강의 분석 기능 소개」", "관리자 콘솔 · 한국어 리포트 화면", "Notion《AI课堂分析功能介绍》", "管理后台 · 韩文报告界面"),
    ("앱 홈 스크린샷 (디렉터 제공)", "사이드바 · 코스 카드 · 우측 패널 구성", "App首页截图（导演提供）", "侧边栏 · 课程卡片 · 右侧面板布局"),
]

# 타임라인(KST). 세션 기록에서 4분 넘게 멈춘 구간을 끊어 실작업 구간으로 묶었다.
T0, T1 = 11 * 60 + 30, 17 * 60 + 15
MAIN = [
    ("11:36:05", "11:38:40", "etc", "기획", "策划", "below"),
    ("11:44:00", "11:47:55", "etc", "", "", ""),
    ("11:56:50", "12:14:33", "old", "v1", "v1", "in"),
    ("12:14:33", "12:46:10", "main", "v2", "v2", "in"),
    ("13:06:12", "13:08:41", "etc", "음악 합류", "合入配乐", "below"),
    ("13:46:43", "13:50:44", "etc", "자료 조사", "资料调研", "below"),
    ("14:16:48", "14:42:32", "main", "v3", "v3", "in"),
    ("16:55:22", "17:09:49", "main", "v4", "v4", "in"),
]
SUB = ("12:05:14", "13:06:12", "음악 · 효과음 61분", "配乐 · 音效 61分钟")
DIRECTOR = [
    ("11:36:05", "30초 영상 기획 요청", "提出30秒视频策划"),
    ("11:44:00", "디자인 · 그래픽 스타일 정리", "整理设计与图形风格"),
    ("11:56:50", "전면 재작업 — 16:9 쇼릴로", "全面重做 —— 改为16:9宣传短片"),
    ("12:14:33", "AI 같은 장식 빼기 · 아이콘 · 색조", "去掉AI感装饰 · 加图标与色调"),
    ("13:46:43", "앱 화면 참고 가능?", "能否参考App界面？"),
    ("14:16:48", "앱 화면 · 제목 2줄 · 아날로그 느낌", "参考App · 标题两行 · 手写学习感"),
    ("16:55:22", "별도 대시보드 · 채점 동그라미 · 인포그래픽", "独立仪表盘 · 批改圆圈 · 信息图"),
]

STEPS = [
    ("기획", "30초 기획 v2.0 · 7컷 · 120 BPM 컷 그리드", "策划", "30秒策划 v2.0 · 7个镜头 · 120 BPM卡点网格"),
    ("디자인 시스템", "종이 · 연필 · 색연필 질감 · 아이콘 44종 · 글꼴 3종", "设计系统", "纸张 · 铅笔 · 彩铅质感 · 44个图标 · 3款字体"),
    ("장면 코딩", "Remotion(React)으로 7장면 · 3,740줄", "场景编码", "用Remotion（React）写7个场景 · 3,740行"),
    ("음악 · 동시 진행", "서브 에이전트가 오리지널 트랙 · 효과음 · 61분", "配乐 · 并行", "子智能体制作原创配乐与音效 · 61分钟"),
    ("검수", "스틸 · 콘택트 시트 41장 확인 · 예시 · 가상 데이터 표시 점검", "质检", "查看截图与联系表41张 · 检查“示例 / 虚拟数据”标注"),
    ("패키징", "MP4 · 설명회 HTML(영상 맨 위) · 자막 SRT · 제작노트", "打包", "MP4 · 说明会HTML（视频置顶）· SRT字幕 · 制作笔记"),
]

VERS = [
    ("v1.jpg", "v1", "다크 에메랄드 · 발광 · 실사 사진", "AI 같은 장식(점 · 색 띠 · 둥근 모서리)은 빼고, 아이콘과 색조 변화", "深绿 · 发光 · 实拍图", "去掉AI感装饰（圆点 · 色条 · 大圆角），加图标和色调变化"),
    ("v2.jpg", "v2", "평면도 · 노선도 · 자체 아이콘 · 장면별 색조", "앱 화면을 참고하고, 제목은 2줄, 아날로그 학습 느낌으로", "平面图 · 线路图 · 自制图标 · 分场色调", "参考App界面，标题两行以内，做出手写学习的质感"),
    ("v3.jpg", "v3", "공책 × ClassIn 앱 · 고운바탕 · 손글씨", "10초는 별도 대시보드, 동그라미는 채점처럼, 후반은 인포그래픽", "笔记本 × ClassIn App · 衬线体 · 手写", "10秒处改为独立仪表盘，圆圈像批改，后半段做信息图"),
    ("v4.jpg", "v4", "최종 · 개별진도 대시보드 · 손은 덜고 촘촘하게", "제출본", "定稿 · 个别进度仪表盘 · 省力又精细", "提交版"),
]

REFLECT = [
    ("얻은 것", "기능 상태표를 먼저 정리하니 '보여 줄 것 / 예시로만 보여 줄 것'이 화면 설계 단계에서 갈렸습니다. 음악을 서브 에이전트에 맡겨 장면 작업과 동시에 끝냈습니다.",
     "收获", "先整理功能状态表，“可展示 / 仅作示例”在画面设计阶段就已分清。配乐交给子智能体，与场景制作同步完成。"),
    ("겪은 문제", "첫 시안의 발광 · 유리 카드가 'AI가 만든 티'를 냈습니다. 원장님 대상에는 손글씨 · 종이 질감과 실제 앱 화면이 더 잘 맞았습니다.",
     "遇到的问题", "初版的发光效果和玻璃卡片“AI感”太重。面向校长，手写 · 纸张质感加真实App界面更合适。"),
    ("업무 시사점", "사람은 방향과 판단, 에이전트는 제작과 검수로 나누니 피드백 한 번이 곧 새 버전이 됐습니다. 문제(아날로그) → 해결(앱) 구도는 다른 기능 영상에도 씁니다.",
     "工作启示", "人负责方向与判断，智能体负责制作与质检，每轮反馈都能直接变成新版本。“问题（手写）→ 解决（App）”的结构可复用到其他功能视频。"),
    ("다음 단계", "데모 계정 실화면 녹화로 수업 장면 교체, 발표장 스피커 점검, 9:16 세로 버전 파생.",
     "下一步", "用演示账号实录替换课堂画面，现场音箱试听，衍生9:16竖版。"),
]


def pct(hms: str) -> float:
    h, m, s = (int(x) for x in hms.split(":"))
    return round((h * 60 + m + s / 60 - T0) / (T1 - T0) * 100, 3)


def timeline() -> str:
    hours = [f"{h}:00:00" for h in range(12, 18)]
    grid = "".join(f'<i class="hr" style="left:{pct(h)}%"></i>' for h in hours)
    ticks = "".join(f'<span class="tick" style="left:{pct(h)}%">{h[:5]}</span>' for h in hours)
    marks = "".join(f'<span class="mk" style="left:{pct(t)}%">{i + 1}</span>' for i, (t, _, _) in enumerate(DIRECTOR))
    bars = ""
    for a, b, cls, ko, zh, where in MAIN:
        left = pct(a)
        width = max(pct(b) - left, 0.45)
        label = L(ko, zh, "span", where) if ko else ""
        bars += f'<div class="bar {cls}" style="left:{left}%;width:{width}%">{label}</div>'
    sa, sb, sko, szh = SUB
    sub = (
        f'<i class="conn" style="left:{pct(sa)}%"></i><i class="conn" style="left:{pct(sb)}%"></i>'
        f'<div class="bar sub" style="left:{pct(sa)}%;width:{pct(sb) - pct(sa)}%">{L(sko, szh, "span", "in")}</div>'
    )
    legend = "".join(
        f'<li><span class="mk-s">{i + 1}</span><span class="tm">{t[:5]}</span>{L(ko, zh)}</li>' for i, (t, ko, zh) in enumerate(DIRECTOR)
    )
    return f"""
    <div class="tl-wrap"><div class="tl">
      <div class="ln">{L("디렉터", "导演", "b")}{L("요청 · 피드백", "需求 · 反馈", "small")}</div>
      <div class="track">{grid}{marks}</div>
      <div class="ln">{L("메인 에이전트", "主智能体", "b")}{L("기획 · 제작 · 검수", "策划 · 制作 · 质检", "small")}</div>
      <div class="track">{grid}{bars}</div>
      <div class="ln">{L("서브 에이전트", "子智能体", "b")}{L("음악 · 효과음", "配乐 · 音效", "small")}</div>
      <div class="track">{grid}{sub}</div>
      <div></div>
      <div class="axis">{ticks}</div>
    </div></div>
    <ol class="tl-legend">{legend}</ol>
    """


CSS = """
/* 영상과 같은 '모눈 공책' 위에 제작 과정을 한 장으로. 종이에 맞춘 단일(라이트) 테마. */
:root {
  --paper: #F2F3EE; --sheet: #FCFCF8; --ink: #1D2321; --sub: #5A615D; --line: rgba(29,35,33,.14); --grid: rgba(0,140,100,.07);
  --green: #00A975; --green-ink: #0A7A55; --red: #D9473A; --navy: #2A4A94;
  --display: "Gowun Batang", "Noto Serif KR", "Nanum Myeongjo", serif;
  --body: "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --hand: "Nanum Pen Script", "Gaegu", cursive;
  color-scheme: light;
}
html[data-lang="zh"] {
  --display: "Noto Serif SC", "Songti SC", "SimSun", serif;
  --body: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --hand: "Long Cang", "Kaiti SC", "KaiTi", cursive;
}
html:not([data-lang="zh"]) .zh, html[data-lang="zh"] .ko { display: none !important; }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; background-color: var(--paper); color: var(--ink); font-family: var(--body); font-size: 15px; line-height: 1.55;
  background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 28px 28px;
}
.wrap { position: relative; max-width: 1240px; margin: 0 auto; padding-block: 46px 40px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 40px; }
.wrap > * { min-width: 0; }
.toolbar { position: absolute; top: 12px; right: max(16px, env(safe-area-inset-right, 0px)); display: flex; gap: 6px; z-index: 5; }
.toolbar button { font: 700 13px var(--body); padding: 7px 12px; border-radius: 999px; border: 1.5px solid var(--ink); background: var(--sheet); color: var(--ink); cursor: pointer; }
.toolbar button[aria-pressed="true"] { background: var(--ink); color: var(--sheet); }
.toolbar button:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }
html.print .toolbar { display: none; }

/* 머리 */
.hero { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: 40px; align-items: end; }
.eyebrow { font-family: var(--hand); color: var(--red); font-size: 30px; line-height: 1; }
h1 { font-family: var(--display); font-weight: 700; font-size: clamp(28px, 3.9vw, 46px); line-height: 1.2; letter-spacing: -0.02em; margin: 12px 0 16px; }
h1 em { font-style: normal; color: var(--green-ink); background: linear-gradient(transparent 66%, rgba(0,169,117,.2) 66%); }
.lede { color: var(--sub); font-size: 15.5px; margin: 0; max-width: 58ch; }
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 2px solid var(--ink); }
.stat { padding: 14px 12px 12px 0; border-bottom: 1px solid var(--line); min-width: 0; }
.stat .num { font-family: var(--display); font-weight: 700; font-size: 40px; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; white-space: nowrap; }
.stat .num small { font-size: 17px; margin: 0 4px 0 2px; color: var(--sub); letter-spacing: 0; }
.stat .lab { font-weight: 800; font-size: 14px; margin-top: 9px; }
.stat .cap { color: var(--sub); font-size: 12.5px; margin-top: 2px; }

/* 완성본 장면 띠 */
.strip-h { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 10px; font-size: 13px; color: var(--sub); }
.strip-h b { color: var(--ink); font-size: 14px; }
.strip { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; }
.shot { margin: 0; min-width: 0; }
.shot img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; border-radius: 3px; box-shadow: 0 6px 16px rgba(30,40,35,.14); }
.shot figcaption { display: flex; gap: 6px; align-items: baseline; margin-top: 7px; font-size: 12.5px; font-weight: 700; }
.shot .t { font-family: var(--hand); color: var(--red); font-size: 20px; font-weight: 400; line-height: 1; }

/* 구역 제목 */
.sec-h { display: flex; align-items: baseline; gap: 10px; margin-bottom: 2px; }
.sec-h .no { font-family: var(--hand); color: var(--red); font-size: 30px; line-height: 1; }
h2 { font-family: var(--display); font-weight: 700; font-size: 27px; line-height: 1.25; letter-spacing: -0.015em; margin: 0; }
.sub { color: var(--sub); font-size: 13.5px; margin: 6px 0 18px; }

.two > * { min-width: 0; }
.two { display: grid; grid-template-columns: minmax(0, 1.22fr) minmax(0, 1fr); gap: 26px; align-items: start; }
.sheet { position: relative; background: var(--sheet); padding: 26px 26px 24px; box-shadow: 0 14px 34px rgba(40,50,45,.12), 0 1px 3px rgba(40,50,45,.08); }
.sheet::before { content: ""; position: absolute; top: -12px; left: 50%; width: 118px; height: 26px; transform: translateX(-50%) rotate(-2deg); background: rgba(246,238,206,.88); box-shadow: 0 1px 2px rgba(0,0,0,.06); }

/* 01 분업 */
.org { display: grid; gap: 10px; }
.node { border: 1.5px solid var(--ink); border-radius: 6px; padding: 12px 14px; background: var(--sheet); min-width: 0; }
.node .who { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; letter-spacing: .04em; color: var(--sub); }
.node .ico { flex: none; color: var(--ink); }
.node .nm { font-weight: 900; font-size: 17.5px; margin-top: 4px; }
.node .ds { font-size: 13px; color: #3A413D; margin-top: 4px; }
.node .meta { font-size: 12px; font-weight: 700; margin-top: 8px; padding-top: 7px; border-top: 1px dashed var(--line); font-variant-numeric: tabular-nums; }
.node.human { border-style: dashed; border-color: var(--red); }
.node.human .ico { color: var(--red); }
.node.main { border-color: var(--green-ink); box-shadow: 4px 4px 0 rgba(0,169,117,.2); }
.node.main .ico, .node.main .meta { color: var(--green-ink); }
.node.subag { border-color: var(--navy); box-shadow: 4px 4px 0 rgba(42,74,148,.15); }
.node.subag .ico, .node.subag .meta { color: var(--navy); }
.row2 { display: grid; grid-template-columns: minmax(0, 1.2fr) auto minmax(0, 1fr); gap: 10px; align-items: stretch; }
.link { display: flex; align-items: center; justify-content: center; gap: 10px; font-family: var(--hand); font-size: 22px; color: var(--sub); line-height: 1; }
.link.side { flex-direction: column; gap: 3px; padding: 0 2px; color: var(--navy); }
.link svg { flex: none; }
.tools { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.tools li { border: 1px solid var(--line); border-radius: 6px; padding: 9px 10px; font-size: 12.5px; color: var(--sub); background: #fff; min-width: 0; }
.tools b { display: block; color: var(--ink); font-size: 13.5px; }

/* 02 참고 */
.refs { list-style: none; margin: 0; padding: 0; counter-reset: r; }
.refs li { padding: 11px 0 11px 34px; border-bottom: 1px dashed var(--line); position: relative; counter-increment: r; }
.refs li::before { content: counter(r); position: absolute; left: 0; top: 11px; width: 22px; height: 22px; border: 1.5px solid var(--ink); border-radius: 99px; font: 800 11.5px/19px var(--body); text-align: center; }
.refs b { display: block; font-size: 14.5px; }
.refs .d { color: var(--sub); font-size: 13px; }
.note { margin: 16px 0 0; font-family: var(--hand); font-size: 24px; line-height: 1.15; color: var(--green-ink); }

/* 03 타임라인 */
.tl-wrap { overflow-x: auto; padding-bottom: 4px; }
.tl { min-width: 760px; display: grid; grid-template-columns: 132px minmax(0, 1fr); column-gap: 16px; }
.tl .ln { display: flex; flex-direction: column; justify-content: center; border-top: 1px solid var(--line); padding: 6px 0; }
.tl .ln b { font-size: 13.5px; font-weight: 900; }
.tl .ln small { font-size: 11.5px; color: var(--sub); }
.tl .track { position: relative; height: 60px; border-top: 1px solid var(--line); }
.tl .track::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; border-top: 1.5px dashed rgba(29,35,33,.16); }
.tl .hr { position: absolute; top: 0; bottom: 0; border-left: 1px dotted rgba(29,35,33,.18); }
.tl .bar { position: absolute; top: 20px; height: 20px; border-radius: 3px; z-index: 1; }
.tl .bar.etc { background: #48514C; }
.tl .bar.old { background: #737B77; }
.tl .bar.main { background: var(--green-ink); }
.tl .bar.sub { background: var(--navy); }
.tl .bar .in { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font: 800 12px/1 var(--body); white-space: nowrap; }
.tl .bar .below { position: absolute; left: 50%; transform: translateX(-50%); top: 24px; font: 700 11.5px/1.2 var(--body); color: var(--sub); white-space: nowrap; }
.tl .conn { position: absolute; top: -21px; height: 41px; border-left: 2px dashed var(--navy); z-index: 2; margin-left: -1px; }
.tl .mk { position: absolute; top: 19px; width: 22px; height: 22px; margin-left: -11px; border-radius: 99px; border: 2px solid var(--red); background: var(--sheet); color: var(--red); font: 900 11.5px/18px var(--body); text-align: center; z-index: 1; }
.tl .axis { position: relative; height: 26px; border-top: 1.5px solid var(--ink); }
.tl .tick { position: absolute; top: 7px; transform: translateX(-50%); font: 700 11.5px/1 var(--body); color: var(--sub); font-variant-numeric: tabular-nums; }
.tl .tick::before { content: ""; position: absolute; left: 50%; top: -8px; height: 5px; border-left: 1.5px solid var(--ink); }
.tl-legend { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 6px 20px; font-size: 13px; }
.tl-legend li { display: flex; gap: 8px; align-items: baseline; min-width: 0; }
.tl-legend .mk-s { flex: none; width: 20px; height: 20px; border-radius: 99px; border: 1.5px solid var(--red); color: var(--red); font: 900 11px/17px var(--body); text-align: center; position: relative; top: -1px; }
.tl-legend .tm { flex: none; font-weight: 800; font-variant-numeric: tabular-nums; }
.tl-call { font-family: var(--hand); font-size: 27px; line-height: 1.15; color: var(--green-ink); margin: 18px 0 0; }
.fine { font-size: 11.5px; color: var(--sub); margin: 8px 0 0; }

/* 04 흐름 */
.flow { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 16px; position: relative; }
.flow::before { content: ""; position: absolute; left: 18px; right: 18px; top: 18px; height: 3px; background: repeating-linear-gradient(90deg, var(--ink) 0 14px, transparent 14px 22px); opacity: .5; }
.flow li { position: relative; min-width: 0; }
.flow .n { position: relative; display: inline-flex; width: 38px; height: 38px; border-radius: 99px; background: var(--sheet); border: 2px solid var(--ink); align-items: center; justify-content: center; font: 900 15px var(--body); }
.flow li:nth-child(4) .n { border-color: var(--navy); color: var(--navy); }
.flow b { display: block; margin-top: 10px; font-size: 15px; }
.flow .d { display: block; color: var(--sub); font-size: 12.5px; margin-top: 3px; }

/* 05 버전 */
.start { display: flex; align-items: center; gap: 10px; font-family: var(--hand); font-size: 24px; line-height: 1.1; color: var(--red); margin: -4px 0 14px; }
.start svg { flex: none; }
.vers { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
.ver { margin: 0; min-width: 0; }
.vimg { position: relative; }
.vimg img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; border-radius: 3px; box-shadow: 0 6px 16px rgba(30,40,35,.14); }
.vtag { position: absolute; left: 8px; top: 8px; background: var(--ink); color: var(--sheet); font: 800 12px var(--body); padding: 3px 8px; border-radius: 3px; }
.ver.last .vtag { background: var(--green-ink); }
.ver .vt { font-weight: 800; font-size: 13.5px; margin-top: 10px; }
.ver .fb { font-family: var(--hand); font-size: 22px; line-height: 1.12; color: var(--red); margin-top: 6px; }
.ver.last .fb { color: var(--green-ink); }

/* 06 복기 */
.reflect { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; border-top: 2px solid var(--ink); padding-top: 14px; margin-top: 14px; }
.rf h4 { margin: 0 0 6px; font-size: 15px; font-weight: 900; }
.rf p { margin: 0; font-size: 13.5px; color: #2E3532; }

footer { display: flex; flex-wrap: wrap; gap: 8px 22px; justify-content: space-between; color: var(--sub); font-size: 12.5px; border-top: 1px solid var(--line); padding-top: 12px; }
footer b { color: var(--ink); }

@media (max-width: 960px) {
  .hero, .two { grid-template-columns: minmax(0, 1fr); }
  .strip { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .flow { grid-template-columns: repeat(3, minmax(0, 1fr)); row-gap: 22px; }
  .flow::before { display: none; }
  .vers, .reflect { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .wrap { padding-top: 58px; gap: 34px; }
  .stats, .tools { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stat .num { font-size: 34px; }
  .strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .row2 { grid-template-columns: minmax(0, 1fr); }
  .link.side { flex-direction: row; }
  .sheet { padding: 22px 16px 20px; }
  .vers, .reflect, .flow { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: no-preference) {
  .toolbar button { transition: background .15s, color .15s; }
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
    document.title = lang === "zh" ? "个别进度开场视频 制作说明" : "개별진도 오프닝 제작기";
  };
  const go = (lang) => { try { history.replaceState(null, "", "#" + lang); } catch (e) { location.hash = lang; } apply(); };
  ko.addEventListener("click", () => go("ko"));
  zh.addEventListener("click", () => go("zh"));
  window.addEventListener("hashchange", apply);
  apply();
})();
"""

HEAD = f"""<title>개별진도 오프닝 제작기</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&family=Nanum+Pen+Script&family=Noto+Sans+KR:wght@400;500;700;800;900&family=Noto+Sans+SC:wght@400;500;700;800;900&family=Noto+Serif+SC:wght@700&family=Long+Cang&display=swap">
<style>{CSS}</style>"""


def body() -> str:
    stats = "".join(
        f'<div class="stat"><div class="num">{n}</div>{L(k1, z1, "div", "lab")}{L(k2, z2, "div", "cap")}</div>' for n, k1, k2, z1, z2 in STATS
    )
    strip = "".join(
        f'<figure class="shot"><img src="{img(f)}" alt="{html.escape(k)}" loading="eager"><figcaption><span class="t">{tm}</span>{L(k, z)}</figcaption></figure>'
        for f, tm, k, z in SCENES
    )
    tools = "".join(f"<li><b>{n}</b>{L(k, z)}</li>" for n, k, z in TOOLS)
    refs = "".join(f'<li>{L(k1, z1, "b")}{L(k2, z2, "span", "d")}</li>' for k1, k2, z1, z2 in REFS)
    steps = "".join(
        f'<li><span class="n">{i + 1}</span>{L(k1, z1, "b")}{L(k2, z2, "span", "d")}</li>' for i, (k1, k2, z1, z2) in enumerate(STEPS)
    )
    vers = "".join(
        f'<figure class="ver{" last" if v == "v4" else ""}"><div class="vimg"><img src="{img(f)}" alt="{v}"><span class="vtag">{v}</span></div>'
        f'{L(k1, z1, "div", "vt")}{L(k2, z2, "div", "fb")}</figure>'
        for f, v, k1, k2, z1, z2 in VERS
    )
    refl = "".join(f'<div class="rf">{L(k1, z1, "h4")}{B(k2, z2, "p")}</div>' for k1, k2, z1, z2 in REFLECT)

    return f"""
<main class="wrap">
  <div class="toolbar" role="group" aria-label="언어 / 语言">
    <button id="lang-ko" type="button" aria-pressed="true">한국어</button>
    <button id="lang-zh" type="button" aria-pressed="false">中文</button>
  </div>

  <header class="hero">
    <div>
      {L("新媒体工作流 과제 · 제작 설명", "新媒体工作流 作业 · 制作说明", "div", "eyebrow")}
      {B("디렉터 한 명, AI 에이전트 둘이<br>만든 <em>30초 오프닝 영상</em>", "一位导演 + 两个AI智能体<br>完成的<em>30秒开场视频</em>", "h1")}
      {B("개별진도 × ClassIn + AI — 학원 원장 설명회 맨 앞에 트는 영상입니다. 사람은 방향과 판단을, 메인 에이전트는 기획부터 패키징까지를, 서브 에이전트는 음악을 맡았습니다.",
        "个别进度 × ClassIn + AI —— 韩国补习机构校长说明会的开场视频。人负责方向与判断，主智能体负责从策划到打包的全部制作，子智能体负责配乐。", "p", "lede")}
    </div>
    <div class="stats">{stats}</div>
  </header>

  <section aria-label="완성본">
    <div class="strip-h">{L("완성본 · 7컷", "成片 · 7个镜头", "b")}{L("30초 · 1920×1080 · 오리지널 음악 · 한국어 자막", "30秒 · 1920×1080 · 原创配乐 · 韩文字幕")}</div>
    <div class="strip">{strip}</div>
  </section>

  <section class="two">
    <div class="sheet">
      {sec("01", "누가 무엇을 맡았나", "谁负责什么")}
      {B("사람은 방향을 정하고 판단합니다. 만드는 일은 두 에이전트가 나눴습니다.", "人负责定方向、做判断；制作由两个智能体分工完成。", "p", "sub")}
      <div class="org">
        <div class="node human">
          <div class="who">{ico("person")}{L("디렉터 · 사람", "导演 · 人")}</div>
          <div class="nm">Wayne</div>
          {L("주제 · 방향 · 피드백 4회 · 최종 판단", "主题与方向 · 4轮反馈 · 最终判断", "div", "ds")}
        </div>
        <div class="link">{ARROW_DOWN}{L("요청 · 피드백 7회", "需求 · 反馈 7次")}<span style="width:14px"></span>{ARROW_UP}{L("시안 · 렌더", "样片 · 渲染")}</div>
        <div class="row2">
          <div class="node main">
            <div class="who">{ico("term")}{L("메인 에이전트", "主智能体")}</div>
            <div class="nm">Claude Code</div>
            {L("기획 문서 · 디자인 시스템 · 장면 7개 코딩 · 검수 · 패키징", "策划文档 · 设计系统 · 7个场景编码 · 质检 · 打包", "div", "ds")}
            {L("도구 호출 268회 · 실작업 1h 43m", "工具调用268次 · 实际工作1h 43m", "div", "meta")}
          </div>
          <div class="link side">{ARROW_LR}{L("맡김 · 반납", "委派 · 交回")}</div>
          <div class="node subag">
            <div class="who">{ico("music")}{L("서브 에이전트 · 백그라운드", "子智能体 · 后台")}</div>
            {L("음악 · 효과음", "配乐 · 音效", "div", "nm")}
            {L("Python 합성 · 컷 시점 히트 · −15 LUFS 측정", "Python合成 · 镜头卡点 · 响度−15 LUFS", "div", "ds")}
            {L("도구 호출 52회 · 61분", "工具调用52次 · 61分钟", "div", "meta")}
          </div>
        </div>
        <div class="link">{ARROW_DOWN}{L("두 에이전트가 쓴 도구", "两个智能体使用的工具")}</div>
        <ul class="tools">{tools}</ul>
      </div>
    </div>

    <div class="sheet">
      {sec("02", "무엇을 참고했나", "参考了什么")}
      {B("회사 문서와 실제 앱 화면을 지식베이스로 썼습니다.", "以公司文档和真实App界面作为知识库。", "p", "sub")}
      <ol class="refs">{refs}</ol>
      {B("캡처는 영상에 넣지 않고, 같은 구조를 가상 데이터로 다시 그렸습니다. 실명 · 고객 데이터 0.", "截图不直接放进视频，用虚拟数据重绘相同结构。真实姓名 · 客户数据为0。", "p", "note")}
    </div>
  </section>

  <section class="sheet">
    {sec("03", "시간은 이렇게 나눴습니다", "时间是这样分配的")}
    {B("11월 23일(월) 세션 기록 · 한국 시간. 빨간 번호는 디렉터 요청, 막대는 에이전트가 실제로 일한 구간입니다.", "依据11月23日（周一）会话记录 · 韩国时间。红色编号为导演需求，色条为智能体实际工作时段。", "p", "sub")}
    {timeline()}
    {B("5시간 33분 중 메인 에이전트 실작업은 1시간 43분. 음악은 서브 에이전트가 v2 작업과 동시에 61분 동안 만들었습니다.", "5小时33分钟里，主智能体实际工作1小时43分钟；配乐由子智能体在v2制作期间同步完成，用时61分钟。", "p", "tl-call")}
    {B("실작업 = 기록에서 4분 넘게 멈춘 구간(검토 · 대기)을 뺀 시간", "实际工作 = 扣除记录中停顿超过4分钟的时段（审阅 · 等待）", "p", "fine")}
  </section>

  <section>
    {sec("04", "어떻게 만들었나", "怎么做的")}
    {B("기획부터 패키징까지 여섯 단계. 4단계 음악은 서브 에이전트가 따로 맡았습니다.", "从策划到打包共六步，第4步配乐由子智能体单独负责。", "p", "sub")}
    <ol class="flow">{steps}</ol>
  </section>

  <section>
    {sec("05", "피드백 4번, 버전 4개", "4轮反馈，4个版本")}
    {B("빨간 글씨는 디렉터 피드백, 다음 버전이 그 답입니다.", "红字是导演反馈，下一版就是回应。", "p", "sub")}
    <div class="start">{ARROW_DOWN}{L("시작 피드백 — 기존 시안 전면 재작업: 뼈대와 내용만 두고 16:9 쇼릴로", "起点反馈 —— 推翻原方案：只保留骨架和内容，做成16:9宣传短片")}</div>
    <div class="vers">{vers}</div>
  </section>

  <section>
    {sec("06", "복기", "复盘")}
    <div class="reflect">{refl}</div>
  </section>

  <footer>
    {L("<b>개별진도 × ClassIn + AI</b> · ClassIn 한국 · 2026.11", "<b>个别进度 × ClassIn + AI</b> · ClassIn 韩国 · 2026.11")}
    {L("화면 속 학생 · 점수는 가상 데이터 · 개발이 필요한 기능은 영상에 '방향 예시'로 표시", "画面中的学生与分数均为虚拟数据 · 待开发功能在视频中标注“方向示例”")}
  </footer>
</main>
<script>{JS}</script>
"""


BODY = body()
OUT_BODY.write_text(HEAD + "\n" + BODY, encoding="utf-8")
OUT_FULL.write_text(
    '<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
    f"{HEAD}\n</head>\n<body>\n{BODY}\n</body>\n</html>\n",
    encoding="utf-8",
)
print("wrote", OUT_BODY, OUT_BODY.stat().st_size, "|", OUT_FULL, OUT_FULL.stat().st_size)
