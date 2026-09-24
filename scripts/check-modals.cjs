const fs = require('fs');
const html = fs.readFileSync('war-plan/WAR_PLAN.html', 'utf8');
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('stageModal') || line.includes('ledgerModal')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
