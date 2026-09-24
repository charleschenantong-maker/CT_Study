const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('war-plan/WAR_PLAN.html');
let content = fs.readFileSync(targetPath, 'utf8');

console.log('Original content length:', content.length);

// 1. UPDATE CSS FOR IMMERSIVE HUD (Lines ~1617 to 1696)
const oldCssStart = '/* 2. Tactical Minimalist Cockpit HUD (Edge-to-Edge Fullscreen, Zero Taskbar Leak) */';
const oldCssEnd = '</style>\n<style id="module1-left-rail-type">';

const idxOldCssStart = content.indexOf(oldCssStart);
const idxOldCssEnd = content.indexOf(oldCssEnd);

if (idxOldCssStart === -1 || idxOldCssEnd === -1) {
  console.error('Could not locate old CSS block!');
  process.exit(1);
}

const newCss = `/* 2. Tactical Minimalist Cockpit HUD (Edge-to-Edge Fullscreen, Zero Taskbar Leak) */
html.is-immersive,
body.is-immersive {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  outline: none !important;
  overflow: hidden !important;
  background: #080a06 !important;
}
body.is-immersive #desk-bg,
body.is-immersive .left-side,
body.is-immersive .side,
body.is-immersive #tauri-chrome,
body.is-immersive .main:before,
body.is-immersive .main:after {
  display: none !important;
}
body.is-immersive,
body.is-immersive * {
  scrollbar-width: none !important;
}
body.is-immersive *::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

body.is-immersive .shell {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  overflow: hidden !important;
  background: radial-gradient(circle at 50% 50%, #11160e 0%, #090c07 60%, #050704 100%) !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
body.is-immersive .main {
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: fixed !important;
  inset: 0 !important;
}

/* Cockpit HUD Main Container: Edge-to-Edge Fullscreen, Zero 1440px artificial box */
body.is-immersive #pomodoroView {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  max-height: 100vh !important;
  position: fixed !important;
  inset: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

/* Immersive Top Bar: Pinned across top with true corner buttons */
.pomo-imm-top {
  width: 100vw !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  flex: 0 0 auto !important;
  padding: 20px 28px !important;
  box-sizing: border-box !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 10002 !important;
  pointer-events: none !important;
}
.pomo-imm-top > * {
  pointer-events: auto !important;
}
.pomo-imm-top .btn {
  background: rgba(20,26,17,.8) !important;
  border: 1px solid #333f2b !important;
  color: #c29a4b !important;
  font: 800 clamp(10px,1.2vmin,12px)/1 var(--font-mono) !important;
  letter-spacing: .1em !important;
  padding: 9px 18px !important;
  border-radius: 4px !important;
  transition: all .18s ease !important;
  clip-path: none !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.5) !important;
}
.pomo-imm-top .btn:hover {
  background: #c29a4b !important;
  color: #0b0e08 !important;
  border-color: #c29a4b !important;
}
.pomo-imm-badge,
.pomo-imm-status-pill {
  display: inline-flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 6px 16px !important;
  background: rgba(194,154,75,.08) !important;
  border: 1px solid rgba(194,154,75,.28) !important;
  border-radius: 20px !important;
  font: 800 clamp(10px,1.2vmin,12px)/1 var(--font-mono) !important;
  letter-spacing: .12em !important;
  color: #d8bf78 !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.5) !important;
}
.pomo-imm-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #667357;
  transition: all .3s ease;
}
.main.chrono-running .pomo-imm-dot,
body.is-immersive .main.chrono-running .pomo-imm-dot {
  background: #4ade80;
  box-shadow: 0 0 10px #4ade80;
  animation: pomoPulse 1.8s infinite;
}
@keyframes pomoPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .45; transform: scale(.85); }
}

/* Cockpit Bay: Fullscreen Center Bay */
.pomo-cockpit-bay {
  width: 100vw !important;
  height: 100vh !important;
  position: fixed !important;
  inset: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  pointer-events: none !important;
}

/* Left Wings: Aligned to Left Edge of Display */
.pomo-telemetry-wing.pomo-wing-left {
  position: fixed !important;
  left: 28px !important;
  top: 72px !important;
  bottom: 82px !important;
  width: clamp(300px, 23vw, 370px) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
  z-index: 10001 !important;
  pointer-events: auto !important;
  box-sizing: border-box !important;
  justify-content: flex-start !important;
}
.pomo-telemetry-card {
  padding: 13px 16px;
  background: rgba(18,24,15,.78);
  border: 1px solid #283321;
  border-left: 3px solid #c29a4b;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(0,0,0,.6);
  border-radius: 3px;
}
.pomo-telemetry-kicker {
  font: 800 9px/1.2 var(--font-mono);
  letter-spacing: .14em;
  color: #7e8870;
  text-transform: uppercase;
}
.pomo-telemetry-val {
  font: 900 13px/1.3 var(--font-mono);
  color: #ecdcb4;
  margin: 5px 0 3px;
  letter-spacing: .03em;
}
.pomo-telemetry-sub {
  font: 800 10px/1.3 var(--font-mono);
  color: #6b755e;
}
.pomo-sortie-grid {
  display: flex;
  gap: 7px;
  margin: 8px 0 4px;
}
.pomo-sortie-pip {
  width: 14px;
  height: 14px;
  border: 1px solid #3d4a32;
  background: #151b12;
  border-radius: 2px;
  transition: all .3s ease;
}
.pomo-sortie-pip.filled {
  background: #c29a4b;
  border-color: #ffd980;
  box-shadow: 0 0 8px rgba(194,154,75,.6);
}

/* SORTIE TARGETS Interactive Checklist inside Telemetry Card */
.pomo-imm-target-card {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  min-height: 180px !important;
  max-height: clamp(240px, 48vh, 460px) !important;
  overflow: hidden !important;
}
.pomo-imm-target-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(61,74,50,.45);
}
.pomo-imm-task-summary {
  font: 800 9px/1.2 var(--font-mono);
  color: #a4b094;
  letter-spacing: .06em;
}
.pomo-imm-task-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  flex: 1 1 auto;
  min-height: 0;
  scrollbar-width: thin !important;
  scrollbar-color: #3d4a32 transparent !important;
}
.pomo-imm-task-list::-webkit-scrollbar {
  display: block !important;
  width: 4px !important;
}
.pomo-imm-task-list::-webkit-scrollbar-thumb {
  background: #3d4a32 !important;
  border-radius: 2px !important;
}
.pomo-imm-task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(22, 28, 19, 0.75);
  border: 1px solid #283321;
  border-radius: 3px;
  transition: all 0.18s ease;
  user-select: none;
}
.pomo-imm-task-item:hover {
  background: rgba(34, 44, 30, 0.9);
  border-color: #455638;
}
.pomo-imm-task-item.is-focus {
  border-color: #c29a4b !important;
  background: rgba(194, 154, 75, 0.14) !important;
  box-shadow: 0 0 10px rgba(194, 154, 75, 0.25) !important;
}
.pomo-imm-task-item.is-done {
  opacity: 0.52;
  background: rgba(15, 19, 13, 0.5);
}
.pomo-imm-task-check {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  background: #11160e;
  border: 1px solid #4a593e;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffd980;
  font: 900 11px/1 var(--font-mono);
  padding: 0;
  transition: all 0.15s ease;
}
.pomo-imm-task-check:hover {
  border-color: #c29a4b;
  background: #1c2417;
}
.pomo-imm-task-check.checked {
  background: #c29a4b;
  border-color: #ffd980;
  color: #0b0e08;
  box-shadow: 0 0 6px rgba(194, 154, 75, 0.6);
}
.pomo-imm-task-content {
  flex: 1 1 auto;
  min-width: 0;
  cursor: pointer;
}
.pomo-imm-task-title {
  font: 800 11px/1.3 var(--font-mono);
  color: #ded1b6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pomo-imm-task-item.is-done .pomo-imm-task-title {
  text-decoration: line-through;
  color: #68735d;
}
.pomo-imm-task-pts {
  font: 800 9px/1 var(--font-mono);
  color: #8d977e;
  margin-top: 2px;
}
.pomo-imm-task-item.is-focus .pomo-imm-task-pts {
  color: #c29a4b;
}
.pomo-focus-icon {
  display: inline-block;
  color: #ffd980;
}
.pomo-imm-focus-btn {
  flex: 0 0 auto;
  padding: 3px 6px;
  font: 800 9px/1 var(--font-mono);
  border: 1px solid #3d4a32;
  border-radius: 2px;
  background: rgba(20, 26, 17, 0.6);
  color: #8d977e;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.pomo-imm-focus-btn:hover {
  background: #c29a4b;
  color: #0b0e08;
  border-color: #c29a4b;
}
.pomo-imm-focus-btn.active {
  background: #c29a4b;
  color: #0b0e08;
  border-color: #ffd980;
  box-shadow: 0 0 6px rgba(194, 154, 75, 0.4);
}

/* Center Display: Radar Dial and Setter Wheel Centered & Cross-Fading */
.pomodoro-ring-wrap,
.pomo-imm-setter-wrap {
  position: absolute !important;
  left: 50% !important;
  top: 48% !important;
  transform: translate(-50%, -50%) !important;
  pointer-events: auto !important;
  margin: 0 !important;
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.35s ease !important;
}

/* Center Radar Chronometer Dial */
.pomodoro-ring-wrap {
  width: clamp(380px, 48vmin, 620px);
  height: clamp(380px, 48vmin, 620px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.pomodoro-ring-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.pomo-dial-bg {
  fill: #0e130b;
  stroke: #21291b;
  stroke-width: 1.5;
}
.pomo-crosshairs line {
  stroke: #2c3724;
  stroke-width: 1;
  stroke-dasharray: 3 4;
}
.pomo-dial-tick {
  stroke: #38442e;
  stroke-width: 1;
}
.pomo-dial-tick.major {
  stroke: #788468;
  stroke-width: 2;
}
.pomo-track-base {
  fill: none;
  stroke: #192015;
  stroke-width: 4.5;
}
.pomo-track-live {
  fill: none;
  stroke: #c29a4b;
  stroke-width: 4.5;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 250px 250px;
  stroke-dasharray: 1319.47;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset .4s cubic-bezier(.16,1,.3,1);
}
.main.chrono-running .pomo-track-live {
  filter: drop-shadow(0 0 8px rgba(194,154,75,.45));
}
.pomo-leading-pip {
  fill: #ffd980;
  filter: drop-shadow(0 0 6px #ffd980);
}

/* Central Text & Telemetry */
.pomodoro-ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
  padding: 16px;
}
.pomo-imm-digits {
  font: 900 clamp(66px, 9.2vmin, 116px)/0.92 var(--font-mono);
  color: #f5ecda;
  font-variant-numeric: tabular-nums slashed-zero;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
  text-shadow: 0 0 24px rgba(194,154,75,.25);
}
.pomo-imm-digits.has-hours {
  font-size: clamp(38px, 5.8vmin, 70px) !important;
  letter-spacing: -0.01em !important;
}
.pomo-imm-sublabel {
  font: 800 clamp(10px, 1.2vmin, 12px)/1 var(--font-mono);
  letter-spacing: .16em;
  color: #859076;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.pomodoro-ring-end {
  font: 800 clamp(10px, 1.1vmin, 12px)/1 var(--font-mono);
  letter-spacing: .08em;
  color: #d1b168;
  background: rgba(18,24,15,.88);
  padding: 6px 14px;
  border-radius: 18px;
  border: 1px solid #3a4730;
}

/* Setter Wheel Container */
.pomo-imm-setter-wrap {
  width: clamp(360px, 46vmin, 540px);
  height: clamp(360px, 46vmin, 540px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 50%, #151a11 0%, #0d120a 70%, #060805 100%);
  border: 2px solid #2d3824;
  border-radius: 50%;
  box-shadow: 0 0 32px rgba(0,0,0,.85), inset 0 0 24px rgba(0,0,0,.9);
  padding: 20px;
  box-sizing: border-box;
  gap: 16px;
}
.pomo-imm-setter-title {
  font: 800 clamp(10px, 1.2vmin, 12px)/1 var(--font-mono);
  letter-spacing: .16em;
  color: #8d977e;
  text-transform: uppercase;
}

/* Cross-fade States between Countdown Ring and Setter Wheels */
.pomodoro-immersive-wrap.is-running #pomodoroImmCountdownDisplay,
.pomodoro-immersive-wrap.show-countdown #pomodoroImmCountdownDisplay {
  opacity: 1 !important;
  pointer-events: auto !important;
  visibility: visible !important;
  transform: translate(-50%, -50%) scale(1) !important;
}
.pomodoro-immersive-wrap.is-running #pomodoroImmSetterDisplay,
.pomodoro-immersive-wrap.show-countdown #pomodoroImmSetterDisplay {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
  transform: translate(-50%, -50%) scale(0.96) !important;
}
.pomodoro-immersive-wrap.is-idle:not(.show-countdown) #pomodoroImmCountdownDisplay {
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
  transform: translate(-50%, -50%) scale(0.96) !important;
}
.pomodoro-immersive-wrap.is-idle:not(.show-countdown) #pomodoroImmSetterDisplay {
  opacity: 1 !important;
  pointer-events: auto !important;
  visibility: visible !important;
  transform: translate(-50%, -50%) scale(1) !important;
}

/* Bottom Cockpit Deck: Fixed at Bottom Center */
.pomo-imm-bottom-deck {
  position: fixed !important;
  bottom: 24px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 12px !important;
  z-index: 10001 !important;
  pointer-events: auto !important;
}
.pomo-imm-modes {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.pomo-imm-modes .btn {
  padding: 7px 18px;
  font-size: 11px;
  border-radius: 3px;
  background: rgba(20,26,17,.8);
  color: #8d977e;
  border: 1px solid #2b3624;
  clip-path: none;
  transition: all .18s ease;
}
.pomo-imm-modes .btn:hover {
  background: rgba(38,48,32,1);
  color: #eddcb4;
  border-color: #506043;
}
.pomo-imm-modes .btn.active {
  background: #c29a4b;
  color: #0d1109;
  border-color: #c29a4b;
  font-weight: 900;
}
.pomo-imm-actions {
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: center;
}
.pomo-imm-actions .btn {
  padding: 12px 26px;
  font-size: 12px;
  border-radius: 4px;
  background: rgba(22,28,19,.9);
  color: #d9cfb8;
  border: 1px solid #3a4731;
  clip-path: none;
  transition: all .18s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,.6);
}
.pomo-imm-actions .btn:hover {
  background: rgba(42,54,36,1);
  color: #fff;
  border-color: #5c6e4d;
}
.pomo-imm-actions .btn.primary {
  background: #c29a4b;
  color: #0c1008;
  font-weight: 900;
  border-color: #c29a4b;
}
.pomo-imm-actions .btn.primary:hover {
  background: #dfb45e;
  border-color: #dfb45e;
  box-shadow: 0 0 16px rgba(194,154,75,.45);
}
`;

content = content.slice(0, idxOldCssStart) + newCss + content.slice(idxOldCssEnd);
console.log('Replaced CSS block.');

// 2. REMOVE REDUNDANT IMMERSIVE STYLE BLOCK IN LINES 2348-2378
const oldSecondCssStart = '/* Immersive HUD Exclusivity */';
const oldSecondCssEnd = '</style>\n\n</head>';
const idxSecStart = content.indexOf(oldSecondCssStart);
const idxSecEnd = content.indexOf(oldSecondCssEnd);
if (idxSecStart !== -1 && idxSecEnd !== -1) {
  content = content.slice(0, idxSecStart) + '/* Consolidated into main cockpit stylesheet */\n' + content.slice(idxSecEnd);
  console.log('Cleaned redundant secondary immersive CSS block.');
}

// 3. UPDATE HTML FOR TELEMETRY CARDS (Directive on top, Sortie Targets in middle, Sortie Matrix at bottom)
const oldTelemetryStart = '<!-- 左侧: 态势感知三联卡片 (目标/戒律/架次) -->';
const oldTelemetryEnd = '<!-- 中核: 1. 战术航空雷达倒计时表盘';

const idxTelemStart = content.indexOf(oldTelemetryStart);
const idxTelemEnd = content.indexOf(oldTelemetryEnd);

if (idxTelemStart === -1 || idxTelemEnd === -1) {
  console.error('Could not locate old telemetry cards in HTML!');
  process.exit(1);
}

const newTelemetryHtml = `<!-- 左侧: 态势感知三联卡片 (戒律置顶，战术突击任务在中间，今日架次在最下) -->
    <div class="pomo-telemetry-wing pomo-wing-left">
      <!-- 1. DIRECTIVE // 作战戒律 (置于最顶端) -->
      <div class="pomo-telemetry-card pomo-imm-directive-card">
        <div class="pomo-telemetry-kicker">DIRECTIVE // 作战戒律</div>
        <div class="pomo-telemetry-val">保持绝对专注与静默</div>
        <div class="pomo-telemetry-sub">单兵突进 · 歼灭一切杂念与外界干扰</div>
      </div>

      <!-- 2. SORTIE TARGETS // 战术突击任务 (每日行动简报任务列表 + 设定Focus目标 + 直接勾选) -->
      <div class="pomo-telemetry-card pomo-imm-target-card">
        <div class="pomo-imm-target-header">
          <div class="pomo-telemetry-kicker">SORTIE TARGETS // 战术突击任务</div>
          <div class="pomo-imm-task-summary" id="pomodoroImmTaskSummary">待清 0 项</div>
        </div>
        <div class="pomo-imm-task-list" id="pomodoroImmTaskList">
          <!-- 动态渲染今日任务项 -->
        </div>
      </div>

      <!-- 3. SORTIE MATRIX // 今日架次 -->
      <div class="pomo-telemetry-card pomo-imm-sortie-card">
        <div class="pomo-telemetry-kicker">SORTIE MATRIX // 今日架次</div>
        <div class="pomo-sortie-grid" id="pomodoroSortieGrid">
          <div class="pomo-sortie-pip"></div>
          <div class="pomo-sortie-pip"></div>
          <div class="pomo-sortie-pip"></div>
          <div class="pomo-sortie-pip"></div>
          <div class="pomo-sortie-pip"></div>
        </div>
        <div class="pomo-telemetry-sub" id="pomodoroSortieMeta">今日已完成: 0 轮专注</div>
      </div>
    </div>

    `;

content = content.slice(0, idxTelemStart) + newTelemetryHtml + content.slice(idxTelemEnd);
console.log('Replaced telemetry HTML block.');

// 4. UPDATE setAppFullscreen TO CALL HTML5 REQUESTFULLSCREEN UNCONDITIONALLY
const oldSetFullscreen = `    async function setAppFullscreen(enable){
      if(typeof window.__setFullscreen==='function'){
        await window.__setFullscreen(enable);
      }else if(enable){
        if(!document.fullscreenElement&&document.documentElement.requestFullscreen){
          await document.documentElement.requestFullscreen().catch(()=>{});
        }
      }else{
        if(document.fullscreenElement&&document.exitFullscreen){
          await document.exitFullscreen().catch(()=>{});
        }
      }
    }`;

const newSetFullscreen = `    async function setAppFullscreen(enable){
      try{
        if(enable){
          if(!document.fullscreenElement && document.documentElement.requestFullscreen){
            await document.documentElement.requestFullscreen();
          }
        }else{
          if(document.fullscreenElement && document.exitFullscreen){
            await document.exitFullscreen();
          }
        }
      }catch(err){
        console.warn('[fullscreen] HTML requestFullscreen error:', err);
      }
      if(typeof window.__setFullscreen==='function'){
        await window.__setFullscreen(enable);
      }
    }`;

if (content.includes(oldSetFullscreen)) {
  content = content.replace(oldSetFullscreen, newSetFullscreen);
  console.log('Updated setAppFullscreen.');
} else {
  console.warn('Could not exact-match oldSetFullscreen, searching loosely...');
}

// 5. ADD currentFocusTaskId & renderImmTasks()
const immTaskJs = `
    /* Immersive Mode Interactive Tasks & Focus Target System */
    let currentFocusTaskId = (() => {
      try { return localStorage.getItem('pomo_focus_task_id') || ''; } catch(e) { return ''; }
    })();

    function renderImmTasks(){
      const listEl = document.getElementById('pomodoroImmTaskList');
      const summaryEl = document.getElementById('pomodoroImmTaskSummary');
      if(!listEl) return;
      todayKey = localDateKey(new Date());
      const list = taskDefs(todayKey);
      const checks = data.checks[todayKey] || {};
      const remaining = list.filter(t => !checks[t.id]).length;

      if(summaryEl){
        summaryEl.textContent = \`待清 \${remaining} 项 · 共 \${list.length} 项\`;
      }

      if(!currentFocusTaskId || !list.some(t => t.id === currentFocusTaskId)){
        const firstUnchecked = list.find(t => !checks[t.id]) || list[0];
        if(firstUnchecked) currentFocusTaskId = firstUnchecked.id;
      }

      listEl.innerHTML = list.map(t => {
        const isDone = !!checks[t.id];
        const isFocus = (t.id === currentFocusTaskId);
        return \`
          <div class="pomo-imm-task-item \${isDone?'is-done':''} \${isFocus?'is-focus':''}" data-task-id="\${t.id}">
            <button type="button" class="pomo-imm-task-check \${isDone?'checked':''}" data-action="toggle" title="\${isDone?'标为未完成':'标为完成'}">
              \${isDone?'✓':''}
            </button>
            <div class="pomo-imm-task-content" data-action="focus" title="设为当前攻坚目标">
              <div class="pomo-imm-task-title">\${isFocus?'<span class="pomo-focus-icon">🎯</span> ':''}\${t.title}</div>
              <div class="pomo-imm-task-pts">+\${t.pts} PT</div>
            </div>
            <button type="button" class="pomo-imm-focus-btn \${isFocus?'active':''}" data-action="focus" title="\${isFocus?'当前锁定攻坚目标':'设为本轮攻坚目标'}">
              \${isFocus?'🎯 锁定':'攻坚'}
            </button>
          </div>
        \`;
      }).join('');

      listEl.querySelectorAll('.pomo-imm-task-item').forEach(item => {
        const taskId = item.dataset.taskId;
        const checkBtn = item.querySelector('[data-action="toggle"]');
        const focusElements = item.querySelectorAll('[data-action="focus"]');

        if(checkBtn){
          checkBtn.addEventListener('click', e => {
            e.stopPropagation();
            const wasDone = !!(data.checks[todayKey] && data.checks[todayKey][taskId]);
            const newDone = !wasDone;
            data.checks[todayKey] = data.checks[todayKey] || {};
            data.checks[todayKey][taskId] = newDone;
            playSfx(newDone ? 'metalLatch' : 'metalRelease');
            save();
            renderTasks();
            renderLeftNote();
            renderStats();
            renderImmTasks();
            updateChronoUI();
            if(newDone && typeof taskImpact === 'function') taskImpact(taskId);
          });
        }

        focusElements.forEach(el => {
          el.addEventListener('click', e => {
            e.stopPropagation();
            currentFocusTaskId = taskId;
            try { localStorage.setItem('pomo_focus_task_id', taskId); } catch(err) {}
            playSfx('metalClick');
            renderImmTasks();
            updateChronoUI();
          });
        });
      });
    }
`;

// Insert immTaskJs right before updateChronoUI
const updateChronoTarget = 'function updateChronoUI(){';
if (content.includes(updateChronoTarget)) {
  content = content.replace(updateChronoTarget, immTaskJs + '\n    ' + updateChronoTarget);
  console.log('Inserted renderImmTasks and currentFocusTaskId.');
} else {
  console.error('Could not find updateChronoUI!');
}

// 6. UPDATE updateChronoUI TO REFLECT ACTIVE FOCUS TARGET ON RADAR LABEL
const oldLabelSnippet = `      if(immLabel) immLabel.textContent=\`\${chronoMode} MINUTE TACTICAL SPRINT\`;`;
const newLabelSnippet = `      let activeFocusTitle = '';
      try {
        const todayTasks = taskDefs(todayKey);
        const checks = data.checks[todayKey] || {};
        let focusTask = null;
        if(currentFocusTaskId){
          focusTask = todayTasks.find(t => t.id === currentFocusTaskId);
        }
        if(!focusTask){
          focusTask = todayTasks.find(t => !checks[t.id]) || todayTasks[0];
          if(focusTask) currentFocusTaskId = focusTask.id;
        }
        if(focusTask) activeFocusTitle = focusTask.title;
      } catch(e) {}
      if(immLabel) {
        immLabel.textContent = activeFocusTitle ? \`🎯 攻坚: \${activeFocusTitle}\` : \`\${chronoMode} MINUTE TACTICAL SPRINT\`;
      }`;

if (content.includes(oldLabelSnippet)) {
  content = content.replace(oldLabelSnippet, newLabelSnippet);
  console.log('Updated immLabel in updateChronoUI to show active focus target.');
}

// 7. IN renderTasks(), CALL renderImmTasks()
const oldRenderTasksEnd = `document.getElementById('dayMessage').innerHTML=all?'<div class="alert success">全线目标已经肃清，今日战线大获全胜！</div>':hasAny?'<div class="alert success">战火已点燃，连续坚守战绩已延续。</div>':'<div class="alert">警报：行动板仍有未肃清目标。</div>'}`;
const newRenderTasksEnd = `document.getElementById('dayMessage').innerHTML=all?'<div class="alert success">全线目标已经肃清，今日战线大获全胜！</div>':hasAny?'<div class="alert success">战火已点燃，连续坚守战绩已延续。</div>':'<div class="alert">警报：行动板仍有未肃清目标。</div>';if(typeof renderImmTasks==='function')renderImmTasks()`;

if (content.includes(oldRenderTasksEnd)) {
  content = content.replace(oldRenderTasksEnd, newRenderTasksEnd);
  console.log('Connected renderTasks to renderImmTasks.');
}

// 8. IN togglePomodoroImmersive(), CALL renderImmTasks()
const oldImmEnableSnippet = `        initCockpitDialTicks();
        updateChronoUI();`;
const newImmEnableSnippet = `        initCockpitDialTicks();
        if(typeof renderImmTasks==='function') renderImmTasks();
        updateChronoUI();`;

if (content.includes(oldImmEnableSnippet)) {
  content = content.replace(oldImmEnableSnippet, newImmEnableSnippet);
  console.log('Added renderImmTasks call to togglePomodoroImmersive.');
}

// 9. UPDATE ESCAPE KEY HANDLER TO CALL closePomodoro() WHEN IN IMMERSIVE
const oldEscSnippet = `        if(document.body.classList.contains('is-immersive')){
          e.preventDefault();
          togglePomodoroImmersive(false);
        }else if(isPomoOpen){`;

const newEscSnippet = `        if(document.body.classList.contains('is-immersive')){
          e.preventDefault();
          closePomodoro();
        }else if(isPomoOpen){`;

if (content.includes(oldEscSnippet)) {
  content = content.replace(oldEscSnippet, newEscSnippet);
  console.log('Updated Esc key handler to call closePomodoro().');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully wrote updated WAR_PLAN.html. New size:', content.length);
