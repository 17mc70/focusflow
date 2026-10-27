---
name: 坐香历
description: 老黄历世界的桌面番茄钟——竹纸底、朱红刊头、套印重影倒计时、朱批正字记功
colors:
  paper: "#e8d9b8"          # 竹纸底：全局背景
  paper-raise: "#f0e5ca"    # 抬升纸面：历页缩样、今日格
  cinnabar: "#c23a2b"       # 朱红：刊头底、宜字、印章、选中态
  cinnabar-deep: "#8f2618"  # 深朱：文字强调、悬停归宿
  zhu-red: "#d05540"        # 朱批红：正字笔画、印框
  seal-red: "#e0563f"       # 印文红：功成印章字色
  azurite: "#31606b"        # 石青：休息相专用，换相时整体替换朱红
  ink: "#221c15"            # 玄墨：正文、忌字底、全部发丝线之源
  ink-bar: "#1f1a16"        # 乌墨：页脚条底色
  tea-ink: "#5d5039"        # 茶墨：次级文字（纸面上对比度 ≥4.5:1）
  cream: "#f7ebcb"          # 米白：朱底/墨底上的文字
  masthead-cream: "#faf0d5" # 刊头米白：日期行、标语，比 cream 略亮
  footer-cream: "#e6d5b0"   # 页脚米白：乌墨条上的正文
  brush-faded: "#6f6046"    # 退墨棕：空状态楷体大字（「空」「白」）
typography:
  display:
    fontFamily: "Noto Serif SC Variable, Noto Serif SC, SimSun, serif"
    fontSize: "118px"
    fontWeight: 900
    lineHeight: 1
  figure:
    fontFamily: "Noto Serif SC Variable, Noto Serif SC, SimSun, serif"
    fontSize: "30px"
    fontWeight: 900
    fontFeature: "tnum"
  headline:
    fontFamily: "Noto Serif SC Variable, Noto Serif SC, SimSun, serif"
    fontSize: "20px"
    fontWeight: 900
    letterSpacing: "0.35em"
  title:
    fontFamily: "Noto Serif SC Variable, Noto Serif SC, SimSun, serif"
    fontSize: "16px"
    fontWeight: 900
    letterSpacing: "0.38em"
  body:
    fontFamily: "Noto Serif SC Variable, Noto Serif SC, SimSun, serif"
    fontSize: "14px"
    fontWeight: 400
    letterSpacing: "0.08em"
  label:
    fontFamily: "Noto Serif SC Variable, Noto Serif SC, SimSun, serif"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.22em"
  brush:
    fontFamily: "KaiTi, STKaiti, Noto Serif SC Variable, serif"
    fontSize: "34px"
    fontWeight: 700
rounded:
  xs: "2px"    # 印刷方角基准（--radius: 0.125rem），实际很少主动使用
  sm: "3px"    # 历页缩样
  md: "5px"    # 印章主钮
  full: "999px" # 朱点与勾选（正圆）
spacing:
  xs: "10px"   # 行内元素间距
  sm: "14px"   # 列表行上下节奏
  md: "28px"   # 刊头/页脚水平内距、统计区块距
  lg: "32px"   # 视图页边距、右栏外距
  xl: "56px"   # 历页左起大留白
components:
  masthead-tab:
    textColor: "{colors.masthead-cream}"
    typography: "{typography.label}"
    padding: "6px 14px"
  masthead-tab-active:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.cinnabar}"
  seal-button:
    backgroundColor: "{colors.cinnabar}"
    textColor: "{colors.cream}"
    rounded: "{rounded.md}"
    width: "74px"
    height: "74px"
  seal-button-break:
    backgroundColor: "{colors.azurite}"
    textColor: "{colors.cream}"
    rounded: "{rounded.md}"
    width: "74px"
    height: "74px"
  duration-choice:
    textColor: "{colors.tea-ink}"
    padding: "6px 12px"
  duration-choice-selected:
    backgroundColor: "{colors.cinnabar}"
    textColor: "{colors.cream}"
  ghost-text-button:
    textColor: "{colors.tea-ink}"
  ghost-text-button-hover:
    textColor: "{colors.cinnabar-deep}"
  yiji-chip:
    backgroundColor: "{colors.cinnabar}"
    textColor: "{colors.cream}"
    padding: "2px 8px"
  yiji-chip-break:
    backgroundColor: "{colors.azurite}"
    textColor: "{colors.cream}"
    padding: "2px 8px"
  yiji-chip-ji:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    padding: "2px 8px"
  pause-badge:
    textColor: "{colors.cinnabar-deep}"
    padding: "1px 6px"
  task-row:
    textColor: "{colors.ink}"
    padding: "14px 0"
  task-check:
    rounded: "{rounded.full}"
    width: "17px"
    height: "17px"
  task-check-done:
    backgroundColor: "{colors.cinnabar}"
  task-input:
    textColor: "{colors.ink}"
  day-tile:
    backgroundColor: "{colors.paper-raise}"
    rounded: "{rounded.sm}"
    padding: "10px 6px"
  zheng-stamp:
    textColor: "{colors.seal-red}"
    width: "46px"
    height: "46px"
---

# Design System: 坐香历

## Overview

**Creative North Star: "每日一页的民间历书（老黄历）"**

桌面常驻窗口（960×680，最小 720×560）被当作一张红头竹纸历书来排版：朱红刊头（78px）横贯顶部，刊名「坐香历」与干支农历、公历并置；乌墨页脚（66px）收底，朱笔正字记功。中间的纸面弹性伸缩，承载今日历页、日课簿与检历。去掉全部内容，剩下的仍可辨认为一张老黄历——这是本世界的硬性辨识标准。

材质与性格：竹纸底（#e8d9b8）叠一道 1px/8px 的帘纹；全部文字用思源宋体的玄墨铅字，层级只靠字重（400/700/900）与字距（0.04–0.42em）拉开，不换字体。动效性格由三件印刷道具承担：套印错位 3px 的朱红重影（倒计时）、落笔成画的朱批（正字笔画、暂停「歇」）、干脆压下的印章（主钮、功成印）。界面噪音克制：无环形进度、无百分比、无渐变光晕。

结构与口径：三页签（今日/日课/检历）+ 禁用占位（手账）。计时页左历右单——左侧巨大倒计时与宜忌，右侧 264px「今日宜」任务列；检历页把近十四日排成同尺寸历页缩样、同基线逐日可比。文案一律历书口径：中文数字（cnNum）、「已燃 X 成」十分法、「N 炷」计数、四相宜忌（起课/迁延、专注/分心、小歇/忘归、起身/恋战）。与方向契约的出入以代码为准：纸底 #e6d5b0 系落成为 #e8d9b8（#e6d5b0 仅存于页脚文字），倒计时约 124px 落成为 118px，任务列 270px 落成为 264px。

**Key Characteristics:**
- 朱红刊头 + 竹纸底 + 玄墨宋体的历书三原色，全局恒为亮暖底（color-scheme: light）
- 套印错位 3px 重影的 118px 倒计时，宋体数字逐字定宽（0.6em，冒号 0.34em）
- 宜忌铅字块承载状态语义，休息相整体换石青
- 朱批记功：五笔一「正」、功成落印、暂停朱批「歇」闪现并保持
- 平版印刷：无弥散阴影，深度靠纸色分层与玄墨发丝线（15–25% 透明度）
- 全整数 px 字号阶（10–118px）+ 大字距标签
- 中文数字与「成/炷」计数口径

## Colors

一组印刷材料色：朱红是唯一的强调色，石青只在休息相出现，纸与墨构成全部底与文。

### Primary
- **朱红（Cinnabar）**（#c23a2b）：刊头底色、宜字块、印章主钮、时长档与页签的选中态、勾选圆点、选中输入底线、::selection。永远以实色块或状态色出现，不做装饰描边。
- **深朱（Cinnabar Deep）**（#8f2618）：相次标签文字、文字钮悬停归宿、刊头底缘内嵌线。朱红系里唯一常作文字色的成员。
- **朱批红（Zhu Red）**（#d05540）：页脚「正」字笔画与功成印框——只在乌墨底上出现的朱笔迹。
- **印文红（Seal Red）**（#e0563f）：功成印章的「功成」二字，比朱批红略亮，模拟印泥反光。

### Secondary
- **石青（Azurite）**（#31606b）：休息相专用。相位切换时凡朱红处（重影、宜字、印章、栏题、朱点）整体换石青，字重字距不动。

### Tertiary
- **退墨棕（Brush Faded）**（#6f6046）：空状态楷体大字「空」「白」，退一档的墨色。

### Neutral
- **竹纸（Paper）**（#e8d9b8）：全局背景，叠 1px/8px 帘纹（rgba(120,90,40,.045)）。
- **抬升纸（Paper Raise）**（#f0e5ca）：历页缩样与今日格的底，比背景亮一档的"另一张纸"。
- **玄墨（Ink）**（#221c15）：正文、忌字块底、倒计时字色；全部边线由它的 10–25% 透明度派生。
- **乌墨（Ink Bar）**（#1f1a16）：页脚条底色，略偏冷的近黑。
- **茶墨（Tea Ink）**（#5d5039）：次级文字、状态行、占位符，纸面上对比度 ≥4.5:1 的暖灰。
- **米白（Cream）**（#f7ebcb）：朱底/墨底上的文字，以及页签选中态的底色。
- **刊头米白（Masthead Cream）**（#faf0d5）：刊头日期行与标语，朱底上更亮的一档；页脚正文则用 **页脚米白**（#e6d5b0）。

### Named Rules
**「朱不混青」律。** 朱红是唯一强调色；石青只属于休息相。同一相位内两者不并置作强调，相位切换是整体换色而非局部点缀（刊头恒朱，不参与换相）。
**「茶墨承文」律。** 正文与次级文字只用玄墨与茶墨，不用纯黑、冷灰，也不在亮底上用低对比白灰。

## Typography

**Display/Body Font:** Noto Serif SC Variable（自托管，@fontsource-variable/noto-serif-sc；fallback Noto Serif SC → SimSun → serif）
**Brush Font:** KaiTi → STKaiti → Noto Serif SC Variable（系统楷体，仅印章、朱批、空状态大字）

**Character:** 单宋体家族系统——全部 UI 共用一款宋体，层级全靠字重（400/700/900）、字号整数阶与字距；楷体是"手迹"专用字体，出现在以纸笔为隐喻的元素上（印章钮「坐/止/续」、功成印、空状态「空/白」）。标签类文字字距一律 ≥0.15em，最宽至刊头标语的 0.42em。

### Hierarchy
- **Display**（900，118px，行高 1）：倒计时专用，套印重影 3px；每位数字锁定 0.6em 宽格（冒号 0.34em）。
- **Figure**（900，30px，tabular-nums）：统计页大数（今日炷数/专注/近七日）。
- **Headline**（900，20px，字距 0.35em）：页面题名「日课簿」「检历」。
- **Title**（900，16–26px，字距 0.26–0.38em）：栏题「今日宜·N 事」、刊名「坐香历」（26px 是此类上沿）。
- **Body**（400，13–15px，字距 0.04–0.08em）：任务行、日期行、输入、页脚正文；无长文场景。
- **Label**（400–700，10–13px，字距 0.15–0.42em）：页签、状态行、统计字段名、宜忌小注、「五笔一正」。

### Named Rules
**「整数铅阶」律。** 字号只用整数像素阶（10/11/12/13/14/15/16/17/19/20/22/26/30/34/118px），不引入小数字号或新的比例阶；标签字距不小于 0.15em。
**「以格定宽」律。** 宋体数字不等宽：任何多位数要么逐字定宽格（倒计时 0.6em/0.34em），要么开 tabular-nums（统计数字）。禁止裸排会跳动的数字列。

## Layout

固定桌面窗口（960×680，最小 720×560），纵向三段：刊头 78px（shrink-0）→ 弹性纸面（overflow-hidden）→ 乌墨页脚 66px（shrink-0）。刊头与页脚水平内距 28px，全局常驻不滚动。

- **今日（计时页）**：左历右单。左列左起大留白 56px、右缝 8px、顶距 28px；右栏「今日宜」固定 264px、右距 32px、顶距 40px，只列前三条。主操作区 mt-auto 沉底（弃课—印章—截课）。
- **日课簿**：单列居中，max-width 560px，四周页边距 32px，纵向滚动。
- **检历**：单列居中，max-width 680px；字段区 grid-cols-3、间距 16px；十四日历页 grid-cols-7、间距 8px、每格最小高 96px，同基线可比。
- **列表节奏**：行上下 14px、底边线玄墨 15% 透明度整行分隔（整格重排，不悬浮卡片）。
- 滚动条定制：轨道 #e0d0aa、滑块 #b09e74（悬停 #96835a）、宽 10px。全界面无响应式断点，只在 720px 最小宽内自然压缩。

**「刊脚定界」律。** 刊头 78px 与页脚 66px 是全局常量，任何新页都活在两界之间的纸面上；内容列居中且不超过 680px。

## Elevation & Depth

平版印刷，无弥散阴影。深度由三种印刷手法构成：纸色分层（竹纸 #e8d9b8 < 抬升纸 #f0e5ca < 刊头米白系）、玄墨发丝线（10–25% 透明度的 1–1.5px 边线）、套印重影（3px 错位的朱红/石青文字残影）。唯一的真实投影属于印章——它是压在纸上的实物。

### Shadow Vocabulary
- **套印重影·专注**（`text-shadow: 3px 3px 0 rgba(194,58,43,.38)`）：倒计时进行态。
- **套印重影·闲置**（`text-shadow: 3px 3px 0 rgba(194,58,43,.18)`）：倒计时待起课，重影更淡。
- **套印重影·休息**（`text-shadow: 3px 3px 0 rgba(49,96,107,.4)`）：休息相换石青重影。
- **刊头底缘线**（`box-shadow: inset 0 -2px 0 #8f2618`）：朱红刊头压一道深朱内嵌线。
- **印章嵌环**（`box-shadow: inset 0 0 0 2.5px rgba(247,235,203,.55)`）：印章钮内侧的米白印环。
- **印章下压**（`box-shadow: 0 2px 6px rgba(34,28,21,.3)`）：与嵌环同用，全局唯一的落影。

**「平版无影」律。** 界面默认无投影；不新增弥散阴影、光晕或玻璃拟态。投影只属于"压在纸上的实物"（印章）。

## Shapes

直角为主的印刷方角。默认不加圆角；圆角只出现在四处：印章主钮（5px，配 -2° 旋转）、历页缩样（3px）、历页日期签（2px）、朱点与勾选（正圆）。全局 --radius 基准 0.125rem（2px）仅作 Tailwind 阶梯底数，界面不主动使用大圆角。边线语言：实线=存在，虚线=无课/未发生；选中与强调时玄墨边线换朱红。功成印 +3° 旋转、印章钮 -2° 旋转，一仰一俯保持手押的不正感。

## Components

### Navigation（刊头与铅字页签）
朱红横栏（78px），左刊名+干支农历/公历日期行，右侧页签。页签为方角铅字块（内距 6px 14px，字距 0.22em）：选中态米白底朱红字加粗；未选中透明底米白字、45% 透明边线，悬停边线实化；禁用项（手账）55% 透明文字。换页时视图以 8px 上浮淡入（0.4s ease-out）进入。

### Buttons
- **印章主钮（坐/止/续）**：74×74px 方钮（圆角 5px，-2° 旋转），朱红底米白楷体 34px；内嵌 2.5px 米白印环 + 2px 下压投影。悬停 scale(1.05)、按下 scale(.95)（150ms）。休息相换石青底。
- **时长三档（15/25/45 分）**：方角铅字块（内距 6px 12px，字距 0.15em）。选中=朱红底米白字加粗；未选中=玄墨 40% 边线茶墨字，悬停边线转朱红 70%、文字转玄墨。
- **文字次钮（弃课/截课）**：无边无底，13px 字距 0.3em 茶墨文字，悬停转深朱。围绕印章主钮左右布局。

### Chips（宜忌铅字块）
「宜」字块朱红底（休息相石青底）、「忌」字块玄墨底，均米白 19px 黑体字、内距 2px 8px；后接 22px 字距 0.28em 的宜忌词。四相词表：起课/迁延、专注/分心、小歇/忘归、起身/恋战。

### Inputs / Fields（底线输入）
新日课与改名共用：透明底、仅玄墨 40% 底线（padding-bottom 10px）、14px 字距 0.08em。聚焦时底线转朱红，无外框无光晕。占位符茶墨。改名输入聚焦即现朱红底线，回车提交、Esc 取消。

### Cards / Containers（历页缩样）
检历页的日格：最小高 96px、圆角 3px、内距 10px 6px。有课=抬升纸底+玄墨 25% 实线边；今日=朱红 1.5px 边+抬升纸底；无课=虚线边无底。格内：朱底米白日期签（圆角 2px）、16px 黑体 tabular 炷数、10px 时长、9px「周 X」沉底。同尺寸同基线，逐日可比。

### List Item（日课行）
整行底边线（玄墨 15%）分隔，行距 14px，整格重排不悬浮。17px 正圆勾选钮：未竟=朱红 60% 环、悬停实化；功成=朱红实底+米白勾。已完成条目茶墨+朱红 2px 删除线（勾销即朱批）。右侧累计时长 11px 茶墨；删除钮平时透明、行悬停显形、悬停转深朱。双击行内改名。今日宜侧栏行同构：9px 朱点（休息相石青）代勾选，选中加粗实点，idle 时可点选绑定本课。

### 套印倒计时（Signature）
118px/900 玄墨巨字，逐字定宽（数字 0.6em、冒号 0.34em）防宋体数字跳动；文字阴影 3px 错位重影，透明度随相位变化（闲置 .18 / 专注 .38 / 休息石青 .4）。禁止选中（user-select: none）。远距一眼可读是这个元素存在的理由。

### 页脚记功区（Signature）
乌墨条（66px）上三件套：左「今日已课 N 炷 · 计 X」文案（数字 17px 米白加粗）；中「正」字五笔笔画（30px SVG，朱批红 #d05540 描边 4px）——每功成以笔势动画添一笔（stroke-dashoffset 48→0，0.55s），五笔一正、正满再起；右 46×46px 功成印（楷体「功成」，印框朱批红 2.5px、印文印文红，+3° 旋转，落印动画 0.4s 从 1.7 倍缩压而下、不回弹）。零功时显示「尚未落笔」。暂停时相次标签旁朱框「歇」字两下轻闪后保持（0.9s，末态不透明）。

## Do's and Don'ts

### Do:
- **Do** 用历书口径写文案：中文数字（cnNum，一至九十九）、「已燃/已过 X 成」十分法、「N 炷」；数据数值（统计、秒数）可用阿拉伯数字但必须 tabular-nums。
- **Do** 相位切换整体换色：休息相凡朱红处换石青（重影、宜字、印章、栏题、朱点），字重字距保持不动。
- **Do** 状态提示用朱批手法：闪现并保持（0.9s 双闪、末态不透明）、功成添笔画（0.55s 笔势）、落印干脆压下不回弹。
- **Do** 空状态以楷体单字大相（「空」「白」，退墨棕 #6f6046，30px）配一句短文案收束（「日课尚空 · 可径自起课」）。
- **Do** 交互反馈限于 color/transform 的 150ms 级过渡；强调块一律实色填充配米白字。
- **Do** 新页面遵循刊脚定界（78/66px 常驻）与 560/680px 居中列。

### Don't:
- **Don't** 引入环形进度条、百分比或时间条——进度只以「已燃 X 成」文案与重影透明度表达（品类级拒绝，已由建成代码证实）。
- **Don't** 使用深色底或霓虹强调色；全界面恒为暖亮竹纸底（color-scheme: light），文字恒为暖墨系。
- **Don't** 让朱红与石青在同一相位并置作装饰；石青仅休息相。
- **Don't** 添加弥散阴影、渐变光晕或玻璃拟态；唯一投影是印章下压（0 2px 6px rgba(34,28,21,.3)）。
- **Don't** 用非整数 px 字号、标签字距低于 0.15em，或裸排不定宽数字。
- **Don't** 把楷体用在正文或标签上；楷体只属于印章、朱批与空相大字。
