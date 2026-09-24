const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const targetFile = path.join(ROOT, 'war-plan', 'WAR_PLAN.html');
let content = fs.readFileSync(targetFile, 'utf-8');

const sfxData = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'war-plan-assets', 'sfx', 'sfx-data.json'), 'utf-8'));
const sfxVolumes = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'war-plan-assets', 'sfx', 'sfx-volumes.json'), 'utf-8'));

// 1. Replace SFX Module with Compressor-Limiter & Musical Pitch Engine
const sfxModuleCode = [
  '/* Open-Source Authentic Audio Assets (100% Offline Base64 Decoded via Web Audio) */',
  '    const SFX_DATA = ' + JSON.stringify(sfxData, null, 2).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n') + ';',
  '    const SFX_VOLUMES = ' + JSON.stringify(sfxVolumes, null, 2).split('\n').map((l, i) => i === 0 ? l : '    ' + l).join('\n') + ';',
  '    let audioCtx = null;',
  '    let masterCompressor = null;',
  '    const sfxBuffers = {};',
  '    let sfxPreloadStarted = false;',
  '    function getAudioContext() {',
  '      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();',
  '      if (!masterCompressor && audioCtx) {',
  '        masterCompressor = audioCtx.createDynamicsCompressor();',
  '        masterCompressor.threshold.value = -6;',
  '        masterCompressor.knee.value = 6;',
  '        masterCompressor.ratio.value = 12;',
  '        masterCompressor.attack.value = 0.003;',
  '        masterCompressor.release.value = 0.15;',
  '        masterCompressor.connect(audioCtx.destination);',
  '      }',
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
  '    function playSfx(kind = "metalTap", options = {}) {',
  '      if (!data.soundOn) return;',
  '      try { sfxFire(kind, options); } catch(e) {}',
  '    }',
  '    function sfxFire(kind, options = {}) {',
  '      const ctx = getAudioContext();',
  '      preloadAllSfx();',
  '      // Map logical aliases',
  '      const aliasMap = {',
  '        wheel: "wheelTick",',
  '        click: "metalTap",',
  '        chime: "alarm",',
  '        metalLatch: "taskComplete",',
  '        metalRelease: "taskUncheck"',
  '      };',
  '      const key = aliasMap[kind] || kind;',
  '      const buffer = sfxBuffers[key];',
  '      const vol = (SFX_VOLUMES[key] ?? 0.5) * (options.volume ?? 1);',
  '      const rate = options.playbackRate ?? 1.0;',
  '      function triggerBuffer(buf) {',
  '        const src = ctx.createBufferSource();',
  '        src.buffer = buf;',
  '        if (rate !== 1.0) src.playbackRate.value = rate;',
  '        const g = ctx.createGain();',
  '        g.gain.value = vol;',
  '        src.connect(g);',
  '        g.connect(masterCompressor || ctx.destination);',
  '        src.start(0);',
  '      }',
  '      if (buffer) {',
  '        triggerBuffer(buffer);',
  '      } else if (SFX_DATA[key]) {',
  '        ctx.decodeAudioData(base64ToBuffer(SFX_DATA[key]), decoded => {',
  '          sfxBuffers[key] = decoded;',
  '          triggerBuffer(decoded);',
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
  console.log('SFX module replaced successfully');
} else {
  console.error('Could not find existing SFX module indices');
  process.exit(1);
}

// 2. Fix round2-fit: sidebars touch screen top (top: 0px when not tauri-chrome)
const oldRound2 = `<style id="round2-fit">
/* T1a: 顶栏 sticky 34px；左右 rail 锁定视口（rail 自身不滚，只让右侧事件列表内部滚） */
.left-side{top:34px!important;height:calc(100vh - 34px)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
.left-side .stats.left-six-stats .stat{min-height:0!important;padding:7px 8px!important}
.left-side .stat b{font-size:19px!important}
.left-side .stage{padding:6px 8px!important;min-height:0!important}
.left-note{position:static!important;margin:auto 14px 0!important}
.side{top:34px!important;height:calc(100vh - 34px)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
.side .event-list{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important}
.side .archive{flex:0 0 auto!important}
.day-context{font:800 10px/1.5 var(--font-mono);color:#5f6357;border-left:4px solid var(--amber);padding:6px 10px;margin-bottom:12px;background:rgba(132,57,44,.07)}
/* 桌面一致性：收起态 shell 不再自绘背景，与展开态一样透出 body 木质桌面 */
body.side-collapsed .shell{background-color:transparent!important;background-image:none!important}
</style>`;

const newRound2 = `<style id="round2-fit">
/* T1a: 顶栏自适应；左右 rail 紧贴屏幕顶部锁定视口（无 tauri-chrome 时 top: 0，有 tauri-chrome 时 top: 34px） */
:root{--chrome-top:0px}
body:has(#tauri-chrome:not([hidden])){--chrome-top:34px}
.left-side{top:var(--chrome-top,0px)!important;height:calc(100vh - var(--chrome-top,0px))!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
.left-side .stats.left-six-stats .stat{min-height:0!important;padding:7px 8px!important}
.left-side .stat b{font-size:19px!important}
.left-side .stage{padding:6px 8px!important;min-height:0!important}
.left-note{position:static!important;margin:auto 14px 0!important}
.side{top:var(--chrome-top,0px)!important;height:calc(100vh - var(--chrome-top,0px))!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
.side .event-list{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important}
.side .archive{flex:0 0 auto!important}
.day-context{font:800 10px/1.5 var(--font-mono);color:#5f6357;border-left:4px solid var(--amber);padding:6px 10px;margin-bottom:12px;background:rgba(132,57,44,.07)}
/* 桌面一致性：收起态 shell 不再自绘背景，与展开态一样透出 body 木质桌面 */
body.side-collapsed .shell{background-color:transparent!important;background-image:none!important}
</style>`;

if (content.includes(oldRound2)) {
  content = content.replace(oldRound2, newRound2);
  console.log('round2-fit updated for top: 0 sidebar alignment');
} else {
  console.warn('Could not find old round2-fit block exactly, performing regex replacement');
  content = content.replace(/<style id="round2-fit">[\s\S]*?<\/style>/, newRound2);
}

// 3. Fix Paper Container Sizing & Mutual Exclusivity Styles
const oldPomoStyles = `/* 5. Pomodoro Focus Clock: Content-Adaptive Sizing & Zero Scrolling */
@media (min-height: 500px) {
  body.pomodoro-open:not(.is-immersive) {
    overflow-y: hidden !important;
  }
}

.pomodoro-normal-wrap {
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
}`;

const newPomoStyles = `/* 5. Pomodoro Focus Clock: Content-Adaptive Sizing & Zero Scrolling */
body.pomodoro-open:not(.is-immersive) {
  overflow-y: hidden !important;
}

.main.pomodoro-open {
  max-width: 620px !important;
  margin: 0 auto !important;
  padding: clamp(14px, 2vh, 22px) clamp(16px, 2.5vw, 28px) clamp(20px, 2.5vh, 32px) !important;
  min-height: auto !important;
}

.main.settings-open {
  max-width: 720px !important;
  margin: 0 auto !important;
  padding: 24px 28px 36px !important;
  min-height: auto !important;
}

.pomodoro-normal-wrap {
  width: 100%;
  max-width: 580px;
  margin: 0 auto;
}`;

if (content.includes(oldPomoStyles)) {
  content = content.replace(oldPomoStyles, newPomoStyles);
  console.log('Pomodoro paper size styles updated');
}

// 4. Fix setSidebarCollapsed (Single invocation of sidebarCollapse/sidebarExpand, no triple calls!)
const oldSetSidebar = `function setSidebarCollapsed(collapsed,persist=true){if(persist)playSfx(collapsed?'modalClose':'modalOpen');if(persist)playSfx(collapsed?'modalClose':'modalOpen');if(persist)playSfx(collapsed?'modalClose':'modalOpen');`;
const newSetSidebar = `function setSidebarCollapsed(collapsed,persist=true){if(persist)playSfx(collapsed?'sidebarCollapse':'sidebarExpand');`;

if (content.includes(oldSetSidebar)) {
  content = content.replace(oldSetSidebar, newSetSidebar);
  console.log('setSidebarCollapsed updated: eliminated triple sound firing');
} else {
  content = content.replace(/function setSidebarCollapsed\(collapsed,persist=true\)\{[^}]+side-collapsed/, `function setSidebarCollapsed(collapsed,persist=true){\n      if(persist)playSfx(collapsed?'sidebarCollapse':'sidebarExpand');\n      document.body.classList.toggle('side-collapsed'`);
}

// 5. Fix scrollToPageTop: Remove activeView.scrollIntoView to eliminate sidebar displacement
const oldScrollToTop = `function scrollToPageTop(){
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      requestAnimationFrame(()=>{
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        const activeView = document.querySelector('.main.pomodoro-open #pomodoroView, .main.settings-open #settingsView');
        if(activeView) activeView.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
      setTimeout(()=>{
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 50);
    }`;

const newScrollToTop = `function scrollToPageTop(){
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }`;

if (content.includes(oldScrollToTop)) {
  content = content.replace(oldScrollToTop, newScrollToTop);
  console.log('scrollToPageTop updated: removed scrollIntoView');
}

// 6. Fix pointerdown & change event listeners: prevent double clicks, add musical preset pitch
const oldPointerDown = `document.addEventListener("pointerdown",e=>{try{preloadAllSfx()}catch(err){};const btn=e.target.closest('button');if(!btn||btn.disabled||btn.closest('#tauri-chrome'))return;if(btn.id==='scAddBtn'){playSfx('scoreStamp');}else if(btn.hasAttribute('data-exam-done')||btn.hasAttribute('data-exam-pin')){playSfx('examPin');}else if(btn.classList.contains('cap-preset-btn')||btn.hasAttribute('data-mins')){playSfx('presetSwitch');}else{playSfx('metalTap');}});`;
const newPointerDown = `document.addEventListener("pointerdown",e=>{
      try{preloadAllSfx()}catch(err){};
      const btn=e.target.closest('button');
      if(!btn||btn.disabled||btn.closest('#tauri-chrome'))return;
      if(btn.id==='sideCollapseBtn'||btn.id==='settingsSidebar'||btn.id==='settingsBtn'||btn.id==='sideSettingsBtn'||btn.id==='settingsBack'||btn.id==='pomodoroBack'||btn.id==='pomodoroImmBackBtn'||btn.id==='pomodoroImmExitBtn'||btn.id==='stageManageBtn'||btn.id==='compactStageManageBtn'||btn.id==='stageModalClose'||btn.id==='ledgerManageBtn'||btn.id==='ledgerModalClose'||btn.id==='chronoToggleBtn'||btn.id==='pomodoroActionBtn'||btn.id==='pomodoroImmActionBtn'||btn.id==='pomodoroResetBtn'||btn.id==='pomodoroCompleteBtn'||btn.id==='sfxToggle'||btn.id==='settingsSfx'||btn.id==='pomoToggleViewBtn'){
        return;
      }
      if(btn.id==='scAddBtn'){
        playSfx('scoreStamp');
      }else if(btn.hasAttribute('data-exam-done')||btn.hasAttribute('data-exam-pin')){
        playSfx('examPin');
      }else if(btn.classList.contains('cap-preset-btn')||btn.hasAttribute('data-mins')){
        const mins=Number(btn.dataset.mins||btn.textContent.replace(/\\D/g,'')||40);
        const pitchMap={15:0.85,25:0.92,40:1.0,60:1.08,75:1.16,90:1.24,120:1.33};
        const rate=pitchMap[mins]||1.0;
        playSfx('presetSwitch',{playbackRate:rate});
      }else{
        playSfx('metalTap');
      }
    });`;

if (content.includes(oldPointerDown)) {
  content = content.replace(oldPointerDown, newPointerDown);
  console.log('pointerdown listener updated with musical presets and deduping');
}

const oldChangeListener = `document.addEventListener('change',e=>{if(e.target.matches('input[type="checkbox"],select'))playSfx('click')});`;
const newChangeListener = `document.addEventListener('change',e=>{if(e.target.matches('input[type="checkbox"],select')){if(!e.target.hasAttribute('data-task'))playSfx('metalTap')}});`;

if (content.includes(oldChangeListener)) {
  content = content.replace(oldChangeListener, newChangeListener);
  console.log('change listener updated: prevented double click on tasks');
}

// 7. Update updateChronoUI: toggle .is-running and .is-idle on .pomodoro-stage and .pomodoro-immersive-wrap
const targetInChronoUI = `document.querySelectorAll('#pomodoroModes .btn[data-mins]').forEach(btn=>{
        btn.classList.toggle('active',isStandardPreset && Number(btn.dataset.mins)===totalM);
      });`;

const stageClassToggles = `document.querySelectorAll('#pomodoroModes .btn[data-mins]').forEach(btn=>{
        btn.classList.toggle('active',isStandardPreset && Number(btn.dataset.mins)===totalM);
      });
      const isRunningOrPaused = (chronoState !== 'idle');
      const pStage = document.querySelector('.pomodoro-stage');
      if (pStage) {
        pStage.classList.toggle('is-running', isRunningOrPaused);
        pStage.classList.toggle('is-idle', !isRunningOrPaused);
      }
      const pImm = document.querySelector('.pomodoro-immersive-wrap');
      if (pImm) {
        pImm.classList.toggle('is-running', isRunningOrPaused);
        pImm.classList.toggle('is-idle', !isRunningOrPaused);
      }`;

if (content.includes(targetInChronoUI) && !content.includes('pStage.classList.toggle(\'is-running\'')) {
  content = content.replace(targetInChronoUI, stageClassToggles);
  console.log('updateChronoUI updated with stage class toggles');
}

// 8. Wire pomoToggleViewBtn and isolate wheel scroll on pomodoroView
const initPomoViewListeners = `
    // Pomodoro View Interactions & Wheel Isolation
    document.getElementById('pomoToggleViewBtn')?.addEventListener('click', () => {
      playSfx('modalOpen');
      const stage = document.querySelector('.pomodoro-stage');
      if (!stage) return;
      const isShowingCountdown = stage.classList.toggle('show-countdown');
      const txt = document.getElementById('pomoToggleViewText');
      if (txt) txt.textContent = isShowingCountdown ? '⚙ 返回时间滚轮' : '⏱ 预览倒计时';
    });
    document.getElementById('pomodoroView')?.addEventListener('wheel', e => {
      if (!e.target.closest('.cap-wheel')) e.preventDefault();
    }, { passive: false });
`;

if (!content.includes('pomoToggleViewBtn')?.addEventListener) {
  content = content.replace('function selectChronoMode(mins){', initPomoViewListeners + '\n    function selectChronoMode(mins){');
  console.log('pomoToggleViewBtn and wheel isolation attached');
}

// 9. When clock resets or mode selected, clear show-countdown if idle
const resetTarget = `chronoRemainingSecs=chronoTotalSecs;playSfx('click');updateChronoUI();`;
const newReset = `chronoRemainingSecs=chronoTotalSecs;playSfx('metalTap');const _ps=document.querySelector('.pomodoro-stage');if(_ps)_ps.classList.remove('show-countdown');const _pt=document.getElementById('pomoToggleViewText');if(_pt)_pt.textContent='⏱ 预览倒计时';updateChronoUI();`;

if (content.includes(resetTarget)) {
  content = content.replace(resetTarget, newReset);
  console.log('reset listener cleared show-countdown');
}

fs.writeFileSync(targetFile, content, 'utf-8');
console.log('Successfully applied all fixes to war-plan/WAR_PLAN.html!');
