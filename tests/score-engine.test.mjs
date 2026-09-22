import test from 'node:test';
import assert from 'node:assert/strict';

const COMPONENTS = [
  { id: 'PHYS P2', planned: 19, baseline: 15 },
  { id: 'PHYS P1', planned: 38, baseline: 4 },
  { id: 'CHEM P2', planned: 19, baseline: 18 },
  { id: 'CHEM P1', planned: 38, baseline: 4 },
  { id: 'BIO', planned: 60, baseline: 11 },
  { id: 'M S1', planned: 18, baseline: 8 },
  { id: 'M P1', planned: 8, baseline: 4 }
];

function componentQuota(c) {
  return c.planned + c.baseline;
}

function missionQuotaTotal() {
  return COMPONENTS.reduce((a, c) => a + componentQuota(c), 0);
}

const BPHO_UNIQUE = [
  'BPhO 2018 S1','BPhO 2018 S2','BPhO 2019 S1','BPhO 2019 S2',
  'BPhO 2020 S1','BPhO 2020 S2','BPhO 2021 S1','BPhO 2021 S2',
  'BPhO 2022 S1','BPhO 2022 S2','BPhO 2022 IPC','BPhO 2023 SPC',
  'BPhO 2023 S1','BPhO 2023 S2','BPhO 2024 S1','BPhO 2024 S2'
];

function bphoMode(name) {
  if (BPHO_UNIQUE.includes(name)) return 'unique';
  if (name === 'BPhO selected problems') return 'selected';
  if (name === 'BPhO light daily practice') return 'light';
  if (name === 'BPhO final review / timed mixed') return 'final';
  if (name === 'BPhO warm-up') return 'warm';
  return 'selected';
}

const BPHO_PTS = { unique: 20, selected: 10, light: 6, final: 20, warm: 5 };

function scPctClass(p) {
  if (p >= 85) return 'sc-pct-good';
  if (p >= 65) return 'sc-pct-mid';
  return 'sc-pct-low';
}

function scSmoothLine(pts) {
  if (pts.length === 0) return '';
  if (pts.length === 1) {
    const p = pts[0];
    return `M${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6; let c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6; let c2y = p2[1] - (p3[1] - p1[1]) / 6;
    const loY = Math.min(p1[1], p2[1]), hiY = Math.max(p1[1], p2[1]);
    c1y = Math.min(hiY, Math.max(loY, c1y)); c2y = Math.min(hiY, Math.max(loY, c2y));
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

test('score-engine: mission quota calculates planned + baseline correctly', () => {
  assert.equal(componentQuota({ planned: 19, baseline: 15 }), 34);
  assert.equal(componentQuota({ planned: 60, baseline: 11 }), 71);
  assert.equal(missionQuotaTotal(), 264);
});

test('score-engine: BPhO mode and points resolution match syllabus rules', () => {
  assert.equal(bphoMode('BPhO 2018 S1'), 'unique');
  assert.equal(BPHO_PTS[bphoMode('BPhO 2018 S1')], 20);

  assert.equal(bphoMode('BPhO selected problems'), 'selected');
  assert.equal(BPHO_PTS[bphoMode('BPhO selected problems')], 10);

  assert.equal(bphoMode('BPhO light daily practice'), 'light');
  assert.equal(BPHO_PTS[bphoMode('BPhO light daily practice')], 6);

  assert.equal(bphoMode('BPhO final review / timed mixed'), 'final');
  assert.equal(BPHO_PTS[bphoMode('BPhO final review / timed mixed')], 20);

  assert.equal(bphoMode('BPhO warm-up'), 'warm');
  assert.equal(BPHO_PTS[bphoMode('BPhO warm-up')], 5);
});

test('score-engine: score percentage tier classification', () => {
  assert.equal(scPctClass(100), 'sc-pct-good');
  assert.equal(scPctClass(85), 'sc-pct-good');
  assert.equal(scPctClass(84.9), 'sc-pct-mid');
  assert.equal(scPctClass(65), 'sc-pct-mid');
  assert.equal(scPctClass(64.9), 'sc-pct-low');
  assert.equal(scPctClass(0), 'sc-pct-low');
});

test('score-engine: scSmoothLine generates valid SVG path without NaN or singularities', () => {
  assert.equal(scSmoothLine([]), '');
  assert.equal(scSmoothLine([[10, 20]]), 'M10.0,20.0');

  const pts = [[10, 100], [50, 60], [90, 80], [130, 20]];
  const path = scSmoothLine(pts);
  assert.ok(path.startsWith('M10.0,100.0C'));
  assert.ok(!path.includes('NaN'));
  assert.ok(!path.includes('Infinity'));
});
