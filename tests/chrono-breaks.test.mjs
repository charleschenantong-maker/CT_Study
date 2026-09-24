import test from "node:test";
import assert from "node:assert/strict";

function formatChronoTime(secs) {
  const safeSecs = Math.max(0, secs);
  const h = Math.floor(safeSecs / 3600);
  const m = Math.floor((safeSecs % 3600) / 60);
  const s = safeSecs % 60;
  if (h > 0) {
    return (
      String(h).padStart(2, "0") +
      ":" +
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0")
    );
  }
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function getChronoRemainingBreakSecs(chronoTotalSecs, chronoRemainingSecs, chronoState, breakRemainingSecs = 0) {
  if (chronoTotalSecs <= 0) return 0;
  const BREAK_DUR = 600; // 10 minutes
  const elapsedFocus = Math.max(0, chronoTotalSecs - chronoRemainingSecs);
  if (chronoState === "break") {
    const currentK = Math.max(1, Math.floor(elapsedFocus / 3600));
    let subsequentCount = 0;
    for (let k = currentK + 1; k * 3600 < chronoTotalSecs; k++) {
      subsequentCount++;
    }
    return Math.max(0, breakRemainingSecs) + subsequentCount * BREAK_DUR;
  } else {
    let futureCount = 0;
    for (let k = 1; k * 3600 < chronoTotalSecs; k++) {
      if (k * 3600 > elapsedFocus) {
        futureCount++;
      }
    }
    return futureCount * BREAK_DUR;
  }
}

function getProjectedEndTime(nowMs, chronoTotalSecs, chronoRemainingSecs, chronoState, breakRemainingSecs = 0) {
  const remFocus = chronoState === "idle" ? chronoTotalSecs : Math.max(0, chronoRemainingSecs);
  const remBreak = getChronoRemainingBreakSecs(chronoTotalSecs, chronoRemainingSecs, chronoState, breakRemainingSecs);
  return new Date(nowMs + (remFocus + remBreak) * 1000);
}

test("formatChronoTime: formats mm:ss and hh:mm:ss accurately", () => {
  assert.equal(formatChronoTime(40 * 60), "40:00");
  assert.equal(formatChronoTime(59), "00:59");
  assert.equal(formatChronoTime(60 * 60), "01:00:00");
  assert.equal(formatChronoTime(120 * 60), "02:00:00");
  assert.equal(formatChronoTime(125 * 60 + 35), "02:05:35");
});

test("chrono-breaks: calculate remaining break seconds for sessions", () => {
  // 40m session: no breaks
  assert.equal(getChronoRemainingBreakSecs(40 * 60, 40 * 60, "idle"), 0);
  assert.equal(getChronoRemainingBreakSecs(40 * 60, 20 * 60, "running"), 0);

  // 60m session: exactly 1h, finishes at 1h, no subsequent break needed
  assert.equal(getChronoRemainingBreakSecs(60 * 60, 60 * 60, "idle"), 0);

  // 75m session: 1 break of 10m (600s) at 60m mark
  assert.equal(getChronoRemainingBreakSecs(75 * 60, 75 * 60, "idle"), 600);
  // After 60m focus elapsed (15m remaining), when in focus before break:
  assert.equal(getChronoRemainingBreakSecs(75 * 60, 20 * 60, "running"), 600);

  // 120m (2h) session: 1 break of 10m (600s)
  assert.equal(getChronoRemainingBreakSecs(120 * 60, 120 * 60, "idle"), 600);

  // 180m (3h) session: 2 breaks of 10m (1200s total) at 1h and 2h marks
  assert.equal(getChronoRemainingBreakSecs(180 * 60, 180 * 60, "idle"), 1200);
  // After 1h10m (70m elapsed, remaining 110m): 1 break left at 2h mark
  assert.equal(getChronoRemainingBreakSecs(180 * 60, 110 * 60, "running"), 600);
});

test("chrono-breaks: in break state counts remaining break + subsequent breaks", () => {
  // 120m session at 1h mark, in break with 300s remaining:
  assert.equal(getChronoRemainingBreakSecs(120 * 60, 60 * 60, "break", 300), 300);

  // 180m session at 1h mark, in break with 600s remaining: 1 subsequent break at 2h mark (600s) -> 1200s total
  assert.equal(getChronoRemainingBreakSecs(180 * 60, 120 * 60, "break", 600), 1200);
});

test("chrono-breaks: projected finish time includes breaks and rolls dynamically when paused", () => {
  // User example: 2h task + 10m break = 2h10m (7800s total)
  // Paused at 13:45 (e.g. timestamp T0)
  const T0 = new Date("2026-09-24T13:45:00").getTime();
  const projectedAtT0 = getProjectedEndTime(T0, 120 * 60, 120 * 60, "paused");

  assert.equal(projectedAtT0.getHours(), 15);
  assert.equal(projectedAtT0.getMinutes(), 55); // 13:45 + 2h10m = 15:55

  // User pauses until 14:00 (15 minutes of real time passage)
  const T1 = new Date("2026-09-24T14:00:00").getTime();
  const projectedAtT1 = getProjectedEndTime(T1, 120 * 60, 120 * 60, "paused");

  assert.equal(projectedAtT1.getHours(), 16);
  assert.equal(projectedAtT1.getMinutes(), 10); // 14:00 + 2h10m = 16:10
});
