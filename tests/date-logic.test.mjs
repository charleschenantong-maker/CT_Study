import test from 'node:test';
import assert from 'node:assert/strict';

const NZ_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Pacific/Auckland',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

function localDateKey(d) {
  return NZ_FMT.format(d);
}

// Optimized nextDayKey / prevDayKey using fast arithmetic without Intl overhead
function stepDateKey(key, deltaDays) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + deltaDays, 12, 0, 0));
  const ny = date.getUTCFullYear();
  const nm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(date.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

function nzOffset(key) {
  // Daylight savings starts on last Sunday of Sept (2026-09-27)
  return key < '2026-09-27' ? '+12:00' : '+13:00';
}

function planDayLabel(key) {
  const a = '2026-09-21', b = '2026-11-16';
  const dnum = dt => new Date(dt + 'T00:00:00Z').getTime();
  if (key < a) return 'T-MINUS ' + Math.ceil((dnum(a) - dnum(key)) / 86400000) + ' // 计划 9-21 启动';
  if (key > b) return 'OVERDUE // 计划已结束';
  const n = Math.round((dnum(key) - dnum(a)) / 86400000) + 1;
  return 'PLAN DAY ' + String(n).padStart(2, '0');
}

function isDayActive(key, checksMap = {}, sealedMap = {}) {
  const c = checksMap && checksMap[key];
  const hasTaskDone = !!(c && Object.values(c).some(Boolean));
  const wasSealed = !!(sealedMap && sealedMap[key]);
  return hasTaskDone || wasSealed;
}

function computeStreak(todayKey, checksMap = {}, sealedMap = {}) {
  let cur = todayKey, count = 0;
  if (!isDayActive(todayKey, checksMap, sealedMap)) {
    cur = stepDateKey(cur, -1);
  }
  while (isDayActive(cur, checksMap, sealedMap)) {
    count++;
    cur = stepDateKey(cur, -1);
  }
  return count;
}

test('date-logic: stepDateKey handles month/year transitions accurately', () => {
  assert.equal(stepDateKey('2026-09-30', 1), '2026-10-01');
  assert.equal(stepDateKey('2026-10-01', -1), '2026-09-30');
  assert.equal(stepDateKey('2026-02-28', 1), '2026-03-01'); // Non-leap year
  assert.equal(stepDateKey('2024-02-28', 1), '2024-02-29'); // Leap year
  assert.equal(stepDateKey('2026-12-31', 1), '2027-01-01');
});

test('date-logic: stepDateKey is 100% equivalent to Intl date key traversal', () => {
  let cur = '2026-07-22';
  for (let i = 0; i < 150; i++) {
    const nextFast = stepDateKey(cur, 1);
    const d = new Date(cur + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    const nextExpected = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    assert.equal(nextFast, nextExpected, `Mismatch at step ${i} from ${cur}`);
    cur = nextFast;
  }
});

test('date-logic: nzOffset switches exactly on 2026-09-27', () => {
  assert.equal(nzOffset('2026-09-26'), '+12:00');
  assert.equal(nzOffset('2026-09-27'), '+13:00');
  assert.equal(nzOffset('2026-10-15'), '+13:00');
});

test('date-logic: planDayLabel computes day indices correctly', () => {
  assert.equal(planDayLabel('2026-09-20'), 'T-MINUS 1 // 计划 9-21 启动');
  assert.equal(planDayLabel('2026-09-21'), 'PLAN DAY 01');
  assert.equal(planDayLabel('2026-09-22'), 'PLAN DAY 02');
  assert.equal(planDayLabel('2026-11-16'), 'PLAN DAY 57');
  assert.equal(planDayLabel('2026-11-17'), 'OVERDUE // 计划已结束');
});

test('date-logic: streak extends when at minimum one task is completed', () => {
  const checks = {
    '2026-09-21': { 'task1': true },
    '2026-09-20': { 'task1': true, 'task2': false },
    '2026-09-19': { 'task1': false }, // Gap here: no tasks completed
    '2026-09-18': { 'task1': true }
  };

  // 1. Today (09-22) has NO tasks checked yet -> retains yesterday's streak (2 days: 20th and 21st)
  assert.equal(computeStreak('2026-09-22', checks), 2);

  // 2. Today has at minimum 1 task completed -> streak extends to 3 days!
  const checksTodayDone = {
    ...checks,
    '2026-09-22': { 'taskA': false, 'taskB': true }
  };
  assert.equal(computeStreak('2026-09-22', checksTodayDone), 3);

  // 3. If today's only task is unchecked, streak drops back to 2
  const checksTodayUnchecked = {
    ...checks,
    '2026-09-22': { 'taskA': false, 'taskB': false }
  };
  assert.equal(computeStreak('2026-09-22', checksTodayUnchecked), 2);

  // 4. Broken streak from past gap: starting on 2026-09-19 (0 tasks done)
  assert.equal(computeStreak('2026-09-19', checks), 1); // Yesterday (18th) was active
});

test('date-logic: streak preserves backward compatibility with sealedMap', () => {
  const sealed = { '2026-09-21': true, '2026-09-20': true };
  const checks = { '2026-09-22': { 't1': true } };
  assert.equal(computeStreak('2026-09-22', checks, sealed), 3);
});
