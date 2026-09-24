const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const targetFile = path.join(ROOT, 'war-plan', 'WAR_PLAN.html');
let content = fs.readFileSync(targetFile, 'utf-8');

const sfxData = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'war-plan-assets', 'sfx', 'sfx-data.json'), 'utf-8'));
const sfxVolumes = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'war-plan-assets', 'sfx', 'sfx-volumes.json'), 'utf-8'));

// 1. Update SFX Module with full metallic audio catalog
const sfxModuleCode = [
  '/* Open-Source Authentic Audio Assets (100% Offline Base64 Decoded via Web Audio) */',
  '    const SFX_DATA = ' + JSON.stringify(sfxData, null, 2).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n') + ';',
  '    const SFX_VOLUMES = ' + JSON.stringify(sfxVolumes, null, 2).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n') + ';',
  '    let audioCtx = null;',
  '    const sfxBuffers = {};',
  '    let sfxPreloadStarted = false;',
  '    function getAudioContext() {',
  '      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();',
  '      if (audioCtx.state === "suspended") audioCtx.resume();',
  '      return audioCtx;',
  '    }',
  '    function base64ToBuffer(b64) {',
  '      const bin = atob(b64.split(",")[1] || b64);',
  '      const len = bin.length;',
  '      const bytes = new Uint8Array(len);',
  '      for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);',
  '      return bytes.buffer;',
  '    }',
  '    function preloadAllSfx() {',
  '      if (sfxPreloadStarted) return;',
  '      sfxPreloadStarted = true;',
  '      try {',
  '        const ctx = getAudioContext();',
  '        Object.keys(SFX_DATA).forEach(k => {',
  '          if (!sfxBuffers[k]) {',
  '            ctx.decodeAudioData(base64ToBuffer(SFX_DATA[k]), decoded => {',
  '              sfxBuffers[k] = decoded;',
  '            }, () => {});',
  '          }',
  '        });',
  '      } catch(e) {}',
  '    }',
  '    function playSfx(kind = "metalTap") {',
  '      if (!data.soundOn) return;',
  '      try { sfxFire(kind); } catch(e) {}',
  '    }',
  '    function sfxFire(kind) {',
  '      const ctx = getAudioContext();',
  '      preloadAllSfx();',
  '      // Map logical aliases',
  '      const key = (kind === "wheel") ? "wheelTick" : (kind === "click") ? "metalTap" : (kind === "chime") ? "alarm" : kind;',
  '      const buffer = sfxBuffers[key];',
  '      if (buffer) {',
  '        const src = ctx.createBufferSource();',
  '        src.buffer = buffer;',
  '        const g = ctx.createGain();',
  '        g.gain.value = SFX_VOLUMES[key] ?? 0.65;',
  '        src.connect(g);',
  '        g.connect(ctx.destination);',
  '        src.start(0);',
  '      } else if (SFX_DATA[key]) {',
  '        ctx.decodeAudioData(base64ToBuffer(SFX_DATA[key]), decoded => {',
  '          sfxBuffers[key] = decoded;',
  '          const src = ctx.createBufferSource();',
  '          src.buffer = decoded;',
  '          const g = ctx.createGain();',
  '          g.gain.value = SFX_VOLUMES[key] ?? 0.65;',
  '          src.connect(g);',
  '          g.connect(ctx.destination);',
  '          src.start(0);',
  '        }, () => {});',
  '      }',
  '    }'
].join('\n');

const sfxStart = '/* Open-Source Authentic Audio Assets (100% Offline Base64 Decoded via Web Audio) */';
const sfxEnd = 'function updateSfxToggle()';
const idxStart = content.indexOf(sfxStart);
const idxEnd = content.indexOf(sfxEnd);
if (idxStart !== -1 && idxEnd !== -1) {
  content = content.slice(0, idxStart) + sfxModuleCode.trim() + '\n    ' + content.slice(idxEnd);
  console.log('SFX module replaced with 13-sound metallic engine');
} else {
  console.error('Could not find existing SFX module indices in WAR_PLAN.html', idxStart, idxEnd);
  process.exit(1);
}

// 2. Add transition CSS styles for modals, popovers, views, and Pomodoro large-screen layout
const transitionStyles = `
<style id="r4-smooth-transitions">
/* Smooth Transitions (Modals, Popovers, Views, Sidebar, Pomodoro Cockpit) */

/* 1. Modal Fade In / Fade Out */
.stage-modal-wrap {
  opacity: 1;
  transition: opacity .18s cubic-bezier(0.16, 1, 0.3, 1);
}
.stage-modal-wrap[hidden] {
  display: none !important;
}
.stage-modal-wrap.modal-closing {
  opacity: 0 !important;
  pointer-events: none !important;
}
.stage-modal {
  transform: scale(1) translateY(0);
  opacity: 1;
  transition: transform .2s cubic-bezier(0.16, 1, 0.3, 1), opacity .18s ease;
  animation: r3Pop .22s cubic-bezier(0.16, 1, 0.3, 1);
}
.stage-modal-wrap.modal-closing .stage-modal {
  transform: scale(.96) translateY(6px) !important;
  opacity: 0 !important;
}

/* 2. Wheel Popover Menu Smooth Fade In / Out */
.chrono-menu {
  opacity: 1;
  transform: translateY(0);
  transition: opacity .16s ease, transform .16s ease;
  animation: r3Pop .18s cubic-bezier(0.16, 1, 0.3, 1);
}
.chrono-menu[hidden] {
  display: none !important;
}
.chrono-menu.menu-closing {
  opacity: 0 !important;
  transform: translateY(-6px) !important;
  pointer-events: none !important;
}

/* 3. View Switch Smooth Cross-Fade */
@keyframes r3ViewIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: none; }
}
@keyframes r3ViewOut {
  from { opacity: 1; transform: none; }
  to { opacity: 0; transform: translateY(5px); }
}
#pomodoroView.view-closing, #settingsView.view-closing {
  animation: r3ViewOut .18s ease forwards !important;
  pointer-events: none !important;
}

/* 4. Sidebar Smooth Slide & Layout Transition */
.shell {
  transition: grid-template-columns .28s cubic-bezier(0.2, 0, 0, 1);
}
.side {
  transition: width .28s cubic-bezier(0.2, 0, 0, 1), padding .28s cubic-bezier(0.2, 0, 0, 1), background-color .28s ease;
  will-change: width;
}
.side>:not(.side-toggle) {
  transition: opacity .2s ease, transform .2s ease;
}
body.side-collapsed .side>:not(.side-toggle) {
  opacity: 0;
  transform: translateX(10px);
  pointer-events: none;
}
.side-toggle {
  transition: all .2s ease;
}

/* 5. Pomodoro Focus Clock Large-Screen Space Utilization & Scroll Removal */
.main.pomodoro-open {
  min-height: calc(100vh - 40px);
}
@media (min-width: 960px) and (min-height: 640px) {
  body:not(.is-immersive) .main.pomodoro-open {
    overflow: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    padding-top: 14px !important;
    padding-bottom: 18px !important;
  }
}

.pomodoro-normal-wrap {
  width: 100%;
  max-width: min(1040px, 96vw);
  margin: 0 auto;
}

.pomodoro-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(16px, 2.2vh, 26px) clamp(18px, 2.8vw, 32px) !important;
  margin: 10px 0 6px !important;
  background: rgba(218,210,186,.78);
  border: 1px solid var(--line);
  box-shadow: 5px 6px 0 rgba(42,42,33,.18);
  clip-path: polygon(0 0, 98.5% 0, 100% 12px, 100% 100%, 14px 100%, 0 calc(100% - 12px));
  width: 100%;
  box-sizing: border-box;
}

.pomo-cockpit-grid {
  display: grid;
  grid-template-columns: minmax(360px, 1.18fr) minmax(320px, 1fr);
  gap: clamp(16px, 2.8vw, 36px);
  align-items: center;
  width: 100%;
}

.pomo-cockpit-col-left {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  width: 100%;
}

.pomo-cockpit-col-right {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  gap: 10px;
}

.pomodoro-status-bar {
  width: 100% !important;
  max-width: none !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px !important;
}

.pomodoro-clock-face {
  width: 100% !important;
  max-width: none !important;
  text-align: center;
  padding: clamp(18px, 2.6vh, 28px) 20px clamp(16px, 2.2vh, 24px) !important;
  background: #141810;
  border: 2px solid #3d4434;
  box-shadow: inset 0 2px 12px rgba(0,0,0,.7), 0 3px 0 rgba(0,0,0,.35);
  margin-bottom: 10px !important;
  box-sizing: border-box;
}

.pomodoro-digits {
  font: 900 clamp(48px, 6.5vw, 84px)/1 var(--font-mono) !important;
  color: #d8bf78;
  letter-spacing: .06em;
  text-shadow: 0 0 4px rgba(216,191,120,.9), 0 0 16px rgba(216,191,120,.45);
  font-variant-numeric: tabular-nums;
  margin-bottom: 8px !important;
}

.pomodoro-sublabel {
  font: 800 11px/1 var(--font-mono);
  letter-spacing: .14em;
  color: #8d9478;
  text-transform: uppercase;
  margin-bottom: 12px !important;
}

.pomodoro-bar {
  height: 8px !important;
  background: #20251c;
  border: 1px solid #3d4434;
  overflow: hidden;
}

.pomodoro-directive {
  max-width: none !important;
  text-align: center;
  color: #606555;
  margin: 4px 0 0 !important;
  font-size: 11px !important;
  line-height: 1.4;
}

.pomodoro-modes {
  display: flex;
  flex-wrap: wrap;
  gap: 7px !important;
  justify-content: center;
  margin-bottom: 2px !important;
}

.pomodoro-modes .btn {
  padding: 7px 14px !important;
}

.pomo-embedded-wheel-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 2px 0;
}

.pomodoro-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px !important;
  margin-bottom: 0 !important;
}

.pomodoro-actions .btn {
  padding: 10px 20px !important;
}

@media (max-width: 959px) {
  .pomo-cockpit-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .pomodoro-clock-face, .pomodoro-status-bar, .pomodoro-directive {
    max-width: 580px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
`;

if (!content.includes('id="r4-smooth-transitions"')) {
  content = content.replace('</head>', transitionStyles + '\n</head>');
  console.log('Transition styles injected');
}

// 3. Update HTML structure of .pomodoro-stage to use the two-column cockpit grid
const pomoStageStart = '<div class="pomodoro-stage">';
const idxPomoStart = content.indexOf(pomoStageStart);
const idxPomoEnd = content.indexOf('<!-- 2. 沉浸模式舞台', idxPomoStart);

if (idxPomoStart !== -1 && idxPomoEnd !== -1 && !content.includes('class="pomo-cockpit-grid"')) {
  const newPomoStageHtml = `<div class="pomodoro-stage">
    <div class="pomo-cockpit-grid">
      <div class="pomo-cockpit-col-left">
        <div class="pomodoro-status-bar">
          <span class="badge" id="pomodoroStatusBadge">STANDBY // 待命就绪</span>
          <span class="pomodoro-meta"><span id="pomodoroSessionMeta">今日已完成: 0 轮专注</span> · <span id="pomodoroNormalEndTime">🔔 启动后预计 00:00 完结</span></span>
        </div>
        <div class="pomodoro-clock-face">
          <div class="pomodoro-digits" id="pomodoroDigits">40:00</div>
          <div class="pomodoro-sublabel" id="pomodoroModeLabel">40 MINUTE TACTICAL SPRINT</div>
          <div class="pomodoro-bar"><i id="pomodoroBarFill" style="width:0%"></i></div>
        </div>
        <p class="hint pomodoro-directive">保持绝对专注与无线电静默。单兵突进，消灭一切杂念与外界干扰。</p>
      </div>
      <div class="pomo-cockpit-col-right">
        <div class="pomodoro-modes" id="pomodoroModes">
          <button type="button" class="btn active" data-mins="40">40 MIN // 标准包</button>
          <button type="button" class="btn" data-mins="60">60 MIN // 深度</button>
          <button type="button" class="btn" data-mins="75">75 MIN // 进阶</button>
          <button type="button" class="btn" data-mins="90">90 MIN // 强化</button>
          <button type="button" class="btn" data-mins="120">120 MIN // 极度</button>
        </div>
        <div class="pomo-embedded-wheel-wrap">
          <div class="cap-wheel-board pomo-wheel-board">
            <div class="cap-lens"></div>
            <div class="cap-col" data-unit="hours"><div class="cap-unit-tag">HR</div><div class="cap-wheel" id="pomoWheelHours"></div></div>
            <div class="cap-sep">:</div>
            <div class="cap-col" data-unit="minutes"><div class="cap-unit-tag">MIN</div><div class="cap-wheel" id="pomoWheelMins"></div></div>
            <div class="cap-sep">:</div>
            <div class="cap-col" data-unit="seconds"><div class="cap-unit-tag">SEC</div><div class="cap-wheel" id="pomoWheelSecs"></div></div>
          </div>
        </div>
        <div class="pomodoro-actions">
          <button type="button" class="btn primary" id="pomodoroActionBtn">开始专注</button>
          <button type="button" class="btn" id="pomodoroResetBtn">重置时钟</button>
          <button type="button" class="btn" id="pomodoroCompleteBtn">提前完结本轮</button>
        </div>
      </div>
    </div>
  </div>
</div>

`;
  content = content.slice(0, idxPomoStart) + newPomoStageHtml + content.slice(idxPomoEnd);
  console.log('Pomodoro stage HTML updated to two-column cockpit layout');
} else {
  console.warn('Could not match Pomodoro stage indices', idxPomoStart, idxPomoEnd);
}

// 4. Update JS logic for:
// - Checkbox check/uncheck sounds: metalLatch / metalRelease
// - Modal open/close smooth fade & sounds
// - View open/close smooth fade & sounds
// - Buttons / Presets sound differentiation

// Replace task checkbox event listener:
const oldTaskChangeListener = `document.querySelectorAll('[data-task]').forEach(el=>el.addEventListener('change',()=>{const completed=el.checked;data.checks[todayKey]=data.checks[todayKey]||{};data.checks[todayKey][el.dataset.task]=completed;save();renderTasks();if(completed)taskImpact(el.dataset.task)}));`;
const newTaskChangeListener = `document.querySelectorAll('[data-task]').forEach(el=>el.addEventListener('change',()=>{const completed=el.checked;playSfx(completed?'metalLatch':'metalRelease');data.checks[todayKey]=data.checks[todayKey]||{};data.checks[todayKey][el.dataset.task]=completed;save();renderTasks();if(completed)taskImpact(el.dataset.task)}));`;

if (content.includes(oldTaskChangeListener)) {
  content = content.replace(oldTaskChangeListener, newTaskChangeListener);
  console.log('Task checkbox change listener updated with metalLatch / metalRelease');
}

// Replace global pointerdown sound routing:
const oldPointerDown = `document.addEventListener("pointerdown",e=>{try{preloadAllSfx()}catch(err){};const btn=e.target.closest('button');if(!btn||btn.disabled||btn.closest('#tauri-chrome'))return;playSfx((btn.id==='scAddBtn'||btn.hasAttribute('data-exam-done')||btn.hasAttribute('data-exam-pin'))?'breech':'click')});`;
const newPointerDown = `document.addEventListener("pointerdown",e=>{try{preloadAllSfx()}catch(err){};const btn=e.target.closest('button');if(!btn||btn.disabled||btn.closest('#tauri-chrome'))return;if(btn.id==='scAddBtn'){playSfx('scoreStamp');}else if(btn.hasAttribute('data-exam-done')||btn.hasAttribute('data-exam-pin')){playSfx('examPin');}else if(btn.classList.contains('cap-preset-btn')||btn.hasAttribute('data-mins')){playSfx('presetSwitch');}else{playSfx('metalTap');}});`;

if (content.includes(oldPointerDown)) {
  content = content.replace(oldPointerDown, newPointerDown);
  console.log('Global pointerdown updated with specialized metallic sounds');
}

// Replace openSettings / closeSettings with smooth cross-fade:
const oldSettingsFns = `    function openSettings(){document.querySelector('.main').classList.add('settings-open');document.getElementById('settingsView').removeAttribute('hidden');syncSettingsLabels();scrollToPageTop()}
    function closeSettings(){document.querySelector('.main').classList.remove('settings-open');document.getElementById('settingsView').setAttribute('hidden','');document.body.classList.add('view-switch');setTimeout(()=>document.body.classList.remove('view-switch'),300);}`;

const newSettingsFns = `    function openSettings(){playSfx('modalOpen');document.querySelector('.main').classList.add('settings-open');document.getElementById('settingsView').removeAttribute('hidden');syncSettingsLabels();scrollToPageTop()}
    function closeSettings(){playSfx('modalClose');const sv=document.getElementById('settingsView');sv.classList.add('view-closing');setTimeout(()=>{sv.classList.remove('view-closing');document.querySelector('.main').classList.remove('settings-open');sv.setAttribute('hidden','');document.body.classList.add('view-switch');setTimeout(()=>document.body.classList.remove('view-switch'),160);},170);}`;

if (content.includes(oldSettingsFns)) {
  content = content.replace(oldSettingsFns, newSettingsFns);
  console.log('Settings view open/close updated with smooth fade out & sfx');
}

// Replace openPomodoro / closePomodoro with smooth cross-fade:
const oldPomoClose = `    async function closePomodoro(){
      if(typeof closeWheelMenu==='function') closeWheelMenu();
      if(document.body.classList.contains('is-immersive')){
        await togglePomodoroImmersive(false);
      }
      document.querySelector('.main').classList.remove('pomodoro-open');
      document.getElementById('pomodoroView').setAttribute('hidden','');
      document.body.classList.add('view-switch');
      setTimeout(()=>{
        document.body.classList.remove('view-switch');
        if(typeof window.checkCollision==='function'){
          window.checkCollision();
        }
      }, 50);
    }`;

const newPomoClose = `    async function closePomodoro(){
      if(typeof closeWheelMenu==='function') closeWheelMenu();
      if(document.body.classList.contains('is-immersive')){
        await togglePomodoroImmersive(false);
      }
      playSfx('modalClose');
      const pv=document.getElementById('pomodoroView');
      pv.classList.add('view-closing');
      setTimeout(()=>{
        pv.classList.remove('view-closing');
        document.querySelector('.main').classList.remove('pomodoro-open');
        pv.setAttribute('hidden','');
        document.body.classList.add('view-switch');
        setTimeout(()=>{
          document.body.classList.remove('view-switch');
          if(typeof window.checkCollision==='function'){
            window.checkCollision();
          }
        }, 150);
      }, 170);
    }`;

if (content.includes(oldPomoClose)) {
  content = content.replace(oldPomoClose, newPomoClose);
  console.log('Pomodoro close updated with smooth fade out');
}

// Add playSfx('modalOpen') to openPomodoro:
content = content.replace('function openPomodoro(){\n      document.querySelector(\'.main\').classList.add(\'pomodoro-open\');', 'function openPomodoro(){\n      playSfx(\'modalOpen\');\n      document.querySelector(\'.main\').classList.add(\'pomodoro-open\');');

// Update modal open/close functions with smooth fade:
const oldModalFns = `    function openStageModal(){renderStageModal();document.getElementById('stageModalWrap').removeAttribute('hidden')}
    function closeStageModal(){document.getElementById('stageModalWrap').setAttribute('hidden','')}
    function openLedgerModal(){renderLedgerModal();document.getElementById('ledgerModalWrap').removeAttribute('hidden')}
    function closeLedgerModal(){document.getElementById('ledgerModalWrap').setAttribute('hidden','')}`;

const newModalFns = `    function openStageModal(){renderStageModal();playSfx('modalOpen');document.getElementById('stageModalWrap').removeAttribute('hidden')}
    function closeStageModal(){const wrap=document.getElementById('stageModalWrap');if(!wrap||wrap.hasAttribute('hidden'))return;playSfx('modalClose');wrap.classList.add('modal-closing');setTimeout(()=>{wrap.setAttribute('hidden','');wrap.classList.remove('modal-closing');},180)}
    function openLedgerModal(){renderLedgerModal();playSfx('modalOpen');document.getElementById('ledgerModalWrap').removeAttribute('hidden')}
    function closeLedgerModal(){const wrap=document.getElementById('ledgerModalWrap');if(!wrap||wrap.hasAttribute('hidden'))return;playSfx('modalClose');wrap.classList.add('modal-closing');setTimeout(()=>{wrap.setAttribute('hidden','');wrap.classList.remove('modal-closing');},180)}`;

if (content.includes(oldModalFns)) {
  content = content.replace(oldModalFns, newModalFns);
  console.log('Stage and Ledger modals updated with smooth fade and modal sounds');
}

// Update closeWheelMenu with smooth closing animation:
const oldCloseWheelMenu = `    function closeWheelMenu(){
      if(!chronoMenu) return;
      chronoMenu.setAttribute('hidden','');
      chronoTimeBtn?.setAttribute('aria-expanded','false');
    }`;

const newCloseWheelMenu = `    function closeWheelMenu(){
      if(!chronoMenu||chronoMenu.hasAttribute('hidden')) return;
      playSfx('modalClose');
      chronoMenu.classList.add('menu-closing');
      chronoTimeBtn?.setAttribute('aria-expanded','false');
      setTimeout(()=>{
        chronoMenu.setAttribute('hidden','');
        chronoMenu.classList.remove('menu-closing');
      },160);
    }`;

if (content.includes(oldCloseWheelMenu)) {
  content = content.replace(oldCloseWheelMenu, newCloseWheelMenu);
  console.log('Wheel popover close updated with smooth fade');
}

// Update chronoTimeBtn open:
const oldChronoTimeBtnClick = `        if(isHidden){
          chronoMenu.removeAttribute('hidden');
          chronoTimeBtn.setAttribute('aria-expanded','true');
          syncAppleWheels(chronoTotalSecs, false);
        }else{
          closeWheelMenu();
        }`;

const newChronoTimeBtnClick = `        if(isHidden){
          playSfx('modalOpen');
          chronoMenu.removeAttribute('hidden');
          chronoMenu.classList.remove('menu-closing');
          chronoTimeBtn.setAttribute('aria-expanded','true');
          syncAppleWheels(chronoTotalSecs, false);
        }else{
          closeWheelMenu();
        }`;

if (content.includes(oldChronoTimeBtnClick)) {
  content = content.replace(oldChronoTimeBtnClick, newChronoTimeBtnClick);
  console.log('ChronoTimeBtn click updated with modalOpen sound');
}

// Sidebar toggle sound:
const oldSetSidebar = `function setSidebarCollapsed(collapsed,persist=true){`;
const newSetSidebar = `function setSidebarCollapsed(collapsed,persist=true){if(persist)playSfx(collapsed?'modalClose':'modalOpen');`;
if (content.includes(oldSetSidebar)) {
  content = content.replace(oldSetSidebar, newSetSidebar);
  console.log('Sidebar collapse/expand sound hooked');
}

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('Successfully updated', targetFile);
