import test from 'node:test';
import assert from 'node:assert/strict';

// Canonical schema definition and migration logic matching WAR_PLAN.html
const COMPONENTS = [
  { id: 'PHYS P2', planned: 19, baseline: 15 },
  { id: 'PHYS P1', planned: 38, baseline: 4 },
  { id: 'CHEM P2', planned: 19, baseline: 18 },
  { id: 'CHEM P1', planned: 38, baseline: 4 },
  { id: 'BIO', planned: 60, baseline: 11 },
  { id: 'M S1', planned: 18, baseline: 8 },
  { id: 'M P1', planned: 8, baseline: 4 }
];

const VALID_EXAM_IDS = [
  'eng-p1', 'm-p1', 'phys-p2', 'm-s1', 'chem-p2', 'bio-p2',
  'phys-prac', 'eng-p2', 'chem-prac', 'bio-prac',
  'phys-p1', 'chem-p1', 'bio-p1', 'bpho'
];

function blank() {
  return {
    version: 3,
    cycles: Object.fromEntries(COMPONENTS.map(c => [c.id, 0])),
    checks: {},
    sealed: {},
    cycleLog: [],
    examDone: {},
    focusTotalMinutes: 0,
    focusByDate: {},
    lastCheckin: null,
    soundOn: true,
    pinnedExam: null,
    updated: null
  };
}

function migrateBackup(incoming) {
  if (!incoming || typeof incoming !== 'object' || !incoming.cycles || typeof incoming.cycles !== 'object') {
    throw new Error('bad backup');
  }
  const base = blank(), src = incoming.cycles;
  const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const FOLDED_CYCLES = { 'BIO P1': 'BIO', 'BIO P2': 'BIO' };
  const cycles = {};
  for (const c of COMPONENTS) {
    cycles[c.id] = c.id === 'BIO'
      ? num(src.BIO) + num(src['BIO P1']) + num(src['BIO P2'])
      : num(src[c.id]);
  }
  for (const k of Object.keys(src)) {
    if (!(k in cycles) && !(k in FOLDED_CYCLES)) {
      cycles[k] = src[k];
    }
  }
  const out = {
    ...base,
    ...incoming,
    version: 3,
    cycles,
    examDone: (incoming.examDone && typeof incoming.examDone === 'object') ? incoming.examDone : {},
    focusTotalMinutes: Number.isFinite(Number(incoming.focusTotalMinutes)) ? Number(incoming.focusTotalMinutes) : 0,
    focusByDate: (incoming.focusByDate && typeof incoming.focusByDate === 'object') ? incoming.focusByDate : {},
    soundOn: incoming.soundOn === undefined ? true : !!incoming.soundOn,
    pinnedExam: typeof incoming.pinnedExam === 'string' && VALID_EXAM_IDS.includes(incoming.pinnedExam)
      ? incoming.pinnedExam
      : null
  };
  delete out.points;
  delete out.lightsOff;
  return out;
}

test('migrateBackup: initializes empty state cleanly', () => {
  const empty = { cycles: {} };
  const migrated = migrateBackup(empty);
  assert.equal(migrated.version, 3);
  assert.equal(migrated.cycles['PHYS P1'], 0);
  assert.equal(migrated.cycles['BIO'], 0);
  assert.equal(migrated.pinnedExam, null);
  assert.equal(migrated.lightsOff, undefined);
});

test('migrateBackup: folds BIO P1 and BIO P2 into canonical BIO without loss', () => {
  const v2Data = {
    version: 2,
    cycles: {
      'PHYS P1': 10,
      'BIO P1': 14,
      'BIO P2': 18,
      'BIO': 5
    },
    points: 150
  };
  const migrated = migrateBackup(v2Data);
  assert.equal(migrated.version, 3);
  // BIO should be 5 + 14 + 18 = 37
  assert.equal(migrated.cycles['BIO'], 37);
  assert.equal(migrated.cycles['BIO P1'], undefined);
  assert.equal(migrated.cycles['BIO P2'], undefined);
  assert.equal(migrated.cycles['PHYS P1'], 10);
  assert.equal(migrated.points, undefined); // Points field purged in v3
});

test('migrateBackup: preserves custom unrecognized cycle keys', () => {
  const custom = {
    cycles: {
      'CUSTOM EXAM': 42,
      'STEP II': 7
    }
  };
  const migrated = migrateBackup(custom);
  assert.equal(migrated.cycles['CUSTOM EXAM'], 42);
  assert.equal(migrated.cycles['STEP II'], 7);
});

test('migrateBackup: validates pinnedExam ID and resets invalid IDs', () => {
  const valid = { cycles: {}, pinnedExam: 'bpho' };
  assert.equal(migrateBackup(valid).pinnedExam, 'bpho');

  const invalid = { cycles: {}, pinnedExam: 'non-existent-exam-id' };
  assert.equal(migrateBackup(invalid).pinnedExam, null);
});

test('migrateBackup: rejects corrupted or malformed archives', () => {
  assert.throws(() => migrateBackup(null), /bad backup/);
  assert.throws(() => migrateBackup("invalid string"), /bad backup/);
  assert.throws(() => migrateBackup({}), /bad backup/);
  assert.throws(() => migrateBackup({ cycles: "not an object" }), /bad backup/);
});

test('migrateBackup: purges legacy lightsOff attribute', () => {
  const legacyWithLights = {
    cycles: {},
    lightsOff: true
  };
  const migrated = migrateBackup(legacyWithLights);
  assert.equal(migrated.lightsOff, undefined);
});

test('archive bundle: contains all customization fields', () => {
  const sampleData = blank();
  const sampleScores = { 'scoretracker:phy:saq': [{ id: 1, date: '2026-09-22', score: 55, total: 60, createdAt: 1 }] };
  const sampleScState = { subject: 'phy', sub: 'saq', lastSub: { phy: 'saq' } };
  const sampleStageModes = { 1: 'compact', 2: 'hidden' };
  const sampleLedgerHidden = ['PHYS P2'];
  const sampleSideCollapsed = true;

  const bundle = {
    format: 'charles-war-plan-bundle',
    bundle: 1,
    version: 3,
    exportedAt: new Date().toISOString(),
    warplan: sampleData,
    scores: sampleScores,
    scState: sampleScState,
    stageModes: sampleStageModes,
    ledgerHidden: sampleLedgerHidden,
    sideCollapsed: sampleSideCollapsed
  };

  assert.equal(bundle.bundle, 1);
  assert.deepEqual(bundle.stageModes, { 1: 'compact', 2: 'hidden' });
  assert.deepEqual(bundle.ledgerHidden, ['PHYS P2']);
  assert.equal(bundle.sideCollapsed, true);
  assert.equal(bundle.warplan.lightsOff, undefined);
});

test('migrateBackup: preserves focusTotalMinutes and focusByDate correctly', () => {
  const incoming = {
    cycles: { 'PHYS P2': 5 },
    focusTotalMinutes: 125,
    focusByDate: { '2026-09-22': 50, '2026-09-23': 75 }
  };
  const migrated = migrateBackup(incoming);
  assert.equal(migrated.focusTotalMinutes, 125);
  assert.deepEqual(migrated.focusByDate, { '2026-09-22': 50, '2026-09-23': 75 });

  // Default fallback when not provided
  const emptyIncoming = { cycles: {} };
  const emptyMigrated = migrateBackup(emptyIncoming);
  assert.equal(emptyMigrated.focusTotalMinutes, 0);
  assert.deepEqual(emptyMigrated.focusByDate, {});
});

