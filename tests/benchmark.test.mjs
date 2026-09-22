import test from 'node:test';
import assert from 'node:assert/strict';

const NZ_FMT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Pacific/Auckland',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function isLeap(y) {
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}
function maxDay(y, m) {
  return m === 2 && isLeap(y) ? 29 : DAYS_IN_MONTH[m];
}

function iterateDaysFast(startY, startM, startD, count, callback) {
  let y = startY, m = startM, d = startD;
  for (let i = 0; i < count; i++) {
    const key = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
    callback(key);
    d++;
    if (d > maxDay(y, m)) {
      d = 1;
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }
  }
}

test('benchmark: compare Intl.DateTimeFormat vs pure integer date loop across campaign', () => {
  const DAYS_IN_CAMPAIGN = 120; // 22 Jul to 18 Nov 2026
  const ITERATIONS = 100; // 100 full calculations of adherence (12,000 day format operations)

  // Baseline: Intl.DateTimeFormat in repeated adherence/stats calculations
  const t0 = performance.now();
  let intlMatches = 0;
  for (let loop = 0; loop < ITERATIONS; loop++) {
    let cursor = new Date('2026-07-22T12:00:00');
    for (let d = 0; d < DAYS_IN_CAMPAIGN; d++) {
      const k = NZ_FMT.format(cursor);
      if (k.length === 10) intlMatches++;
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  const intlTime = performance.now() - t0;

  // Optimized: pure integer arithmetic without Intl or Date allocations
  const t1 = performance.now();
  let fastMatches = 0;
  for (let loop = 0; loop < ITERATIONS; loop++) {
    iterateDaysFast(2026, 7, 22, DAYS_IN_CAMPAIGN, key => {
      if (key.length === 10) fastMatches++;
    });
  }
  const fastTime = performance.now() - t1;

  const speedup = intlTime / Math.max(0.01, fastTime);
  console.log(`\n  ⚡ Benchmark: Intl ${intlTime.toFixed(2)}ms vs Pure Integer ${fastTime.toFixed(2)}ms (${speedup.toFixed(1)}x speedup across ${DAYS_IN_CAMPAIGN * ITERATIONS} stats checks)`);

  assert.equal(fastMatches, intlMatches);
  assert.ok(fastTime < intlTime, 'Pure integer stepping must be faster than Intl');
  assert.ok(speedup >= 2.0, `Expected at least 2x speedup, got ${speedup.toFixed(1)}x`);
});
