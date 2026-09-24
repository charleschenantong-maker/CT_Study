const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const targetFile = path.join(ROOT, 'war-plan', 'WAR_PLAN.html');
let content = fs.readFileSync(targetFile, 'utf-8');

// 1. Replace the HTML structure of .pomodoro-immersive-wrap
const oldImmHtmlStart = '<div class="pomodoro-immersive-wrap is-idle">';
const oldImmHtmlEnd = '<!-- 底部操控台 -->';
const idxImmStart = content.indexOf(oldImmHtmlStart);
const idxImmBottom = content.indexOf(oldImmHtmlEnd, idxImmStart);
const idxImmEnd = content.indexOf('</section>', idxImmBottom);

if (idxImmStart !== -1 && idxImmBottom !== -1 && idxImmEnd !== -1) {
  const newImmHtml = `<div class="pomodoro-immersive-wrap is-idle">
  <div class="pomo-imm-top">
    <button class="btn" id="pomodoroImmBackBtn" type="button">← 返回作战纸 (Esc)</button>
    <div class="pomo-imm-status-pill">
      <span class="pomo-imm-dot"></span>
      <span id="pomodoroImmStatusText">STANDBY // 待命就绪</span>
    </div>
    <button class="btn" id="pomodoroImmExitBtn" type="button">退出沉浸 ✕</button>
  </div>

  <div class="pomo-cockpit-bay">
    <!-- 左侧: 态势感知三联卡片 (目标/戒律/架次) -->
    <div class="pomo-telemetry-wing pomo-wing-left">
      <div class="pomo-telemetry-card">
        <div class="pomo-telemetry-kicker">SORTIE TARGET // 当前挂载</div>
        <div class="pomo-telemetry-val" id="pomodoroImmTarget">PHYS P2 // 2018 SAQ</div>
        <div class="pomo-telemetry-sub" id="pomodoroImmTargetSub">锁定今日指定作战卷次</div>
      </div>
      <div class="pomo-telemetry-card">
        <div class="pomo-telemetry-kicker">DIRECTIVE // 作战戒律</div>
        <div class="pomo-telemetry-val">保持绝对专注与静默</div>
        <div class="pomo-telemetry-sub">单兵突进 · 歼灭一切杂念与干扰</div>
      </div>
      <div class="pomo-telemetry-card">
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

    <!-- 中核: 1. 战术航空雷达倒计时表盘 (倒计时/专注中展示) -->
    <div class="pomodoro-ring-wrap" id="pomodoroImmCountdownDisplay">
      <svg class="pomodoro-ring-svg" viewBox="0 0 500 500">
        <!-- 仪表底层暗光背景盘 -->
        <circle class="pomo-dial-bg" cx="250" cy="250" r="240"/>
        <!-- 瞄准十字发丝基准线 -->
        <g class="pomo-crosshairs">
          <line x1="250" y1="14" x2="250" y2="34"/>
          <line x1="250" y1="466" x2="250" y2="486"/>
          <line x1="14" y1="250" x2="34" y2="250"/>
          <line x1="466" y1="250" x2="486" y2="250"/>
        </g>
        <!-- 60 标尺精密航空微米刻度环 -->
        <g id="pomodoroDialTicks"></g>
        <!-- 导轨底圈 -->
        <circle class="pomo-track-base" cx="250" cy="250" r="210"/>
        <!-- 战术推进弧 (纯正军规琥珀色) -->
        <circle class="pomo-track-live" id="pomodoroRingFill" cx="250" cy="250" r="210"/>
        <!-- 领先氚光指示点 (以250,250为旋转中心，与推进弧绝对同步无差移动) -->
        <g id="pomodoroPipRotator" style="transform-origin: 250px 250px;">
          <circle class="pomo-leading-pip" id="pomodoroLeadingPip" cx="250" cy="40" r="5"/>
        </g>
      </svg>
      <div class="pomodoro-ring-center">
        <div class="pomodoro-digits pomo-imm-digits" id="pomodoroImmDigits">40:00</div>
        <div class="pomodoro-sublabel pomo-imm-sublabel" id="pomodoroImmModeLabel">40 MINUTE TACTICAL SPRINT</div>
        <div class="pomodoro-ring-end" id="pomodoroRingEndTime">🔔 启动后预计 00:00 完结</div>
      </div>
    </div>

    <!-- 中核: 2. 旋转滚轮设置专注时间 (仅在待命就绪/设置时展示) -->
    <div class="pomo-imm-setter-wrap" id="pomodoroImmSetterDisplay">
      <div class="pomo-imm-setter-title">TACTICAL TIME SELECTOR // 设定专注时长</div>
      <div class="pomo-imm-modes" id="pomodoroImmModes">
        <button type="button" class="btn active" data-mins="40">40m</button>
        <button type="button" class="btn" data-mins="60">60m</button>
        <button type="button" class="btn" data-mins="75">75m</button>
        <button type="button" class="btn" data-mins="90">90m</button>
        <button type="button" class="btn" data-mins="120">120m</button>
      </div>
      <div class="pomo-imm-wheel-wrap">
        <div class="cap-wheel-board pomo-wheel-board pomo-imm-wheel-board">
          <div class="cap-lens"></div>
          <div class="cap-col" data-unit="hours"><div class="cap-unit-tag">HR</div><div class="cap-wheel" id="immWheelHours"></div></div>
          <div class="cap-sep">:</div>
          <div class="cap-col" data-unit="minutes"><div class="cap-unit-tag">MIN</div><div class="cap-wheel" id="immWheelMins"></div></div>
          <div class="cap-sep">:</div>
          <div class="cap-col" data-unit="seconds"><div class="cap-unit-tag">SEC</div><div class="cap-wheel" id="immWheelSecs"></div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 底部操控台 (已剔除声学信标按键，操作居中) -->
  <div class="pomo-imm-bottom-deck">
    <div class="pomo-imm-actions">
      <button type="button" class="btn" id="pomodoroImmResetBtn" title="快捷键: R">重置时钟 (R)</button>
      <button type="button" class="btn primary" id="pomodoroImmActionBtn" title="快捷键: Space">开始专注 (Space)</button>
      <button type="button" class="btn" id="pomodoroImmCompleteBtn">提前完结本轮</button>
    </div>
  </div>
</div>
`;
  content = content.slice(0, idxImmStart) + newImmHtml + content.slice(idxImmEnd);
  console.log('Immersive HTML updated: removed acoustic feature, 3 cards on left, clean bottom deck');
} else {
  console.error('Failed to locate immersive HTML block');
  process.exit(1);
}

// 2. Inject or Update Fullscreen Adaptation and Fade CSS in <style id="r4-smooth-transitions">
const cssToInject = `
/* ===== Enhanced Immersive Fullscreen Adaptation & Module Cross-Fade ===== */

/* 1. Immersive Fullscreen (Eliminating Artificial Boundaries & Bottom Border) */
html.is-immersive,
body.is-immersive {
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  background: #080a06 !important;
  border: none !important;
}

body.is-immersive .shell {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  overflow: hidden !important;
  background: radial-gradient(circle at 50% 50%, #11160e 0%, #090c07 60%, #050704 100%) !important;
  z-index: 9999 !important;
  display: block !important;
}

body.is-immersive .main {
  position: absolute !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  clip-path: none !important;
  filter: none !important;
  display: block !important;
}

body.is-immersive #pomodoroView {
  position: absolute !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  overflow: hidden !important;
  display: block !important;
}

body.is-immersive .pomodoro-immersive-wrap {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: clamp(14px, 2.4vh, 24px) clamp(20px, 3.2vw, 44px) !important;
  box-sizing: border-box !important;
  border: none !important;
  box-shadow: none !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  align-items: stretch !important;
  overflow: hidden !important;
}

/* Immersive Top Bar: Pinned to Left and Right Corners */
.pomo-imm-top {
  width: 100% !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  flex: 0 0 auto !important;
  padding: 0 !important;
  z-index: 15 !important;
}

/* Cockpit Bay: Fullscreen Flexible Center */
.pomo-cockpit-bay {
  width: 100% !important;
  flex: 1 1 auto !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin: 0 !important;
  min-height: 0 !important;
}

/* 3 Telemetry Cards on the Left Side */
.pomo-telemetry-wing.pomo-wing-left {
  position: absolute !important;
  left: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 14px !important;
  width: clamp(200px, 20vw, 280px) !important;
  z-index: 10 !important;
}

@media (max-width: 960px) {
  .pomo-telemetry-wing.pomo-wing-left {
    display: none !important;
  }
}

/* Bigger Tactical Radar Clock & Setter */
.pomodoro-ring-wrap {
  width: clamp(420px, 58vmin, 680px) !important;
  height: clamp(420px, 58vmin, 680px) !important;
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 auto !important;
  margin: 0 auto !important;
}

.pomo-imm-setter-wrap {
  width: clamp(420px, 58vmin, 680px) !important;
  height: clamp(420px, 58vmin, 680px) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  background: radial-gradient(circle at 50% 50%, #151a11 0%, #0d120a 70%, #060805 100%) !important;
  border: 2px solid #2d3824 !important;
  border-radius: 50% !important;
  box-shadow: 0 0 32px rgba(0,0,0,.85), inset 0 0 24px rgba(0,0,0,.9) !important;
  padding: 24px !important;
  box-sizing: border-box !important;
  margin: 0 auto !important;
}

/* Digits & Hours Overflow Protection */
.pomo-imm-digits {
  font: 900 clamp(54px, 8vmin, 96px)/0.92 var(--font-mono) !important;
  color: #f5ecda !important;
  font-variant-numeric: tabular-nums slashed-zero !important;
  letter-spacing: -0.02em !important;
  margin-bottom: 8px !important;
  text-shadow: 0 0 24px rgba(194, 154, 75, 0.25) !important;
  white-space: nowrap !important;
}
.pomo-imm-digits.has-hours {
  font-size: clamp(38px, 5.8vmin, 70px) !important;
  letter-spacing: -0.04em !important;
}

.pomodoro-digits {
  font: 900 clamp(44px, 6.2vw, 76px)/1 var(--font-mono) !important;
  color: #d8bf78 !important;
  letter-spacing: .04em !important;
  text-shadow: 0 0 4px rgba(216,191,120,.9), 0 0 16px rgba(216,191,120,.45) !important;
  font-variant-numeric: tabular-nums !important;
  margin-bottom: 8px !important;
  white-space: nowrap !important;
}
.pomodoro-digits.has-hours {
  font-size: clamp(34px, 4.8vw, 56px) !important;
  letter-spacing: -0.02em !important;
}

/* 100% Lockstep Progress Arc & Pip Rotator */
.pomo-track-live {
  fill: none !important;
  stroke: #c29a4b !important;
  stroke-width: 5 !important;
  stroke-linecap: round !important;
  transform: rotate(-90deg) !important;
  transform-origin: 250px 250px !important;
  stroke-dasharray: 1319.47 !important;
  stroke-dashoffset: 0 !important;
  transition: stroke-dashoffset 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

#pomodoroPipRotator {
  transform-origin: 250px 250px !important;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
}

.pomo-leading-pip {
  fill: #ffd980 !important;
  filter: drop-shadow(0 0 6px #ffd980) !important;
}

/* Immersive Bottom Deck */
.pomo-imm-bottom-deck {
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  flex: 0 0 auto !important;
  padding: 0 0 clamp(6px, 1.2vh, 14px) !important;
  z-index: 15 !important;
}
.pomo-imm-actions {
  display: flex !important;
  gap: 16px !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 2. Regular Tactical Chrono: Space-Out Status Bar & Smooth Module Fade */
.pomodoro-status-bar {
  width: 100% !important;
  max-width: none !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 0 4px !important;
  margin-bottom: 16px !important;
  box-sizing: border-box !important;
}

.pomodoro-status-left {
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
}

.pomodoro-meta {
  font: 800 11px/1.3 var(--font-mono) !important;
  letter-spacing: .08em !important;
  color: #555b4e !important;
  text-align: right !important;
}

/* Form Cross-Fade Animation */
@keyframes pomoModuleFadeIn {
  0% {
    opacity: 0;
    transform: translateY(7px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.pomodoro-setter-face,
.pomodoro-clock-face {
  width: 100% !important;
  box-sizing: border-box !important;
}

.pomodoro-stage.is-running #pomodoroSetterDisplay,
.pomodoro-stage.show-countdown #pomodoroSetterDisplay {
  display: none !important;
}

.pomodoro-stage.is-running #pomodoroCountdownDisplay,
.pomodoro-stage.show-countdown #pomodoroCountdownDisplay {
  display: block !important;
  animation: pomoModuleFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.pomodoro-stage.is-idle:not(.show-countdown) #pomodoroCountdownDisplay {
  display: none !important;
}

.pomodoro-stage.is-idle:not(.show-countdown) #pomodoroSetterDisplay {
  display: block !important;
  animation: pomoModuleFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Immersive Module Cross-Fade */
.pomodoro-immersive-wrap.is-running #pomodoroImmSetterDisplay,
.pomodoro-immersive-wrap.show-countdown #pomodoroImmSetterDisplay {
  display: none !important;
}

.pomodoro-immersive-wrap.is-running #pomodoroImmCountdownDisplay,
.pomodoro-immersive-wrap.show-countdown #pomodoroImmCountdownDisplay {
  display: flex !important;
  animation: pomoModuleFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.pomodoro-immersive-wrap.is-idle:not(.show-countdown) #pomodoroImmCountdownDisplay {
  display: none !important;
}

.pomodoro-immersive-wrap.is-idle:not(.show-countdown) #pomodoroImmSetterDisplay {
  display: flex !important;
  animation: pomoModuleFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;

// Inject into style tag
content = content.replace('</style>\n</head>', cssToInject + '\n</style>\n</head>');
console.log('Injected immersive adaptation & fade styles');

// 3. Update updateChronoUI in JS
const oldPipLogic = `      const pip=document.getElementById('pomodoroLeadingPip');
      if(pip){
        if(remainRatio<=0.001){
          pip.style.display='none';
        }else{
          pip.style.display='';
          const alpha=(remainRatio*360)*(Math.PI/180);
          const px=(250+210*Math.sin(alpha)).toFixed(2);
          const py=(250-210*Math.cos(alpha)).toFixed(2);
          pip.setAttribute('cx',px);
          pip.setAttribute('cy',py);
        }
      }`;

const newPipLogic = `      const pipRotator=document.getElementById('pomodoroPipRotator');
      if(pipRotator){
        if(remainRatio<=0.001){
          pipRotator.style.opacity='0';
        }else{
          pipRotator.style.opacity='1';
          const angle=(remainRatio*360).toFixed(2);
          pipRotator.style.transform=\`rotate(\${angle}deg)\`;
        }
      }`;

if (content.includes(oldPipLogic)) {
  content = content.replace(oldPipLogic, newPipLogic);
  console.log('updateChronoUI: pip rotator lockstep logic updated');
}

// 4. Update digit hours formatting in updateChronoUI
const oldDigitsLogic = `      if(pDigits){
        pDigits.textContent=timeStr;
      }`;
const newDigitsLogic = `      const hasHours = (Math.floor(chronoRemainingSecs / 3600) > 0);
      if(pDigits){
        pDigits.textContent=timeStr;
        pDigits.classList.toggle('has-hours', hasHours);
      }`;

if (content.includes(oldDigitsLogic)) {
  content = content.replace(oldDigitsLogic, newDigitsLogic);
  console.log('updateChronoUI: pDigits has-hours updated');
}

const oldImmDigitsLogic = `      if(immDigits){
        immDigits.textContent=timeStr;
      }`;
const newImmDigitsLogic = `      if(immDigits){
        immDigits.textContent=timeStr;
        immDigits.classList.toggle('has-hours', hasHours);
      }`;

if (content.includes(oldImmDigitsLogic)) {
  content = content.replace(oldImmDigitsLogic, newImmDigitsLogic);
  console.log('updateChronoUI: immDigits has-hours updated');
}

// 5. Remove acoustic functions and references in JS
content = content.replace(/let chronoAcousticOn[\s\S]*?function updateAudioBtnUI\(\)\{[\s\S]*?\}\s*function openPomodoro\(\)\{/m, 'function openPomodoro(){');
content = content.replace(/updateAudioBtnUI\(\);\s*/g, '');
content = content.replace(/if\(chronoAcousticOn&&data\.soundOn&&chronoState==='running'\)\{\s*playSfx\('tick'\);\s*\}/g, '');
content = content.replace(/document\.getElementById\('pomodoroImmAudioBtn'\)\?\.addEventListener[\s\S]*?\}\);\s*/m, '');

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('All changes applied successfully to war-plan/WAR_PLAN.html!');
