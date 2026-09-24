import test from 'node:test';
import assert from 'node:assert/strict';

// Mirrors focusMinutesDue in war-plan/WAR_PLAN.html: whole minutes earned
// beyond what this run already banked.
function focusMinutesDue(elapsedSecs, creditedMins) {
  return Math.max(0, Math.floor(elapsedSecs / 60) - creditedMins);
}

test('accrual: banks one minute per completed 60s without double-counting', () => {
  let credited = 0;
  // 90s elapsed, nothing banked yet -> 1 minute due
  let due = focusMinutesDue(90, credited);
  assert.equal(due, 1);
  credited += due;
  // Same instant re-checked -> nothing more due
  assert.equal(focusMinutesDue(90, credited), 0);
  // 150s elapsed, 1 banked -> 1 more due (floor(150/60)=2)
  assert.equal(focusMinutesDue(150, credited), 1);
});

test('accrual: cancel mid-session flushes whole minutes, drops sub-minute remainder', () => {
  // Cancelled at 25m30s with 25 already banked live -> 0 left to flush
  assert.equal(focusMinutesDue(25 * 60 + 30, 25), 0);
  // Reset straight from pause at 5m10s with nothing banked -> 5 due
  assert.equal(focusMinutesDue(5 * 60 + 10, 0), 5);
  // Fresh clock -> nothing due, never negative
  assert.equal(focusMinutesDue(0, 0), 0);
  assert.equal(focusMinutesDue(30, 5), 0);
});
