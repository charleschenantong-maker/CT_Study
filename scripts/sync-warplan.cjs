// 单一源头同步：war-plan/WAR_PLAN.html 是页面唯一可编辑的源文件。
// 本脚本将其同步为应用入口 index.html（注入防误改标记 + main.tsx 桥接），
// dev/build 前自动执行（见 package.json 的 predev/prebuild）。
// 用法：npm run sync:warplan
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "war-plan", "WAR_PLAN.html");
const DST = path.join(ROOT, "index.html");
const TAG = '<script type="module" src="/src/main.tsx"></script>';
const MARKER =
  "<!-- SYNCED FROM war-plan/WAR_PLAN.html — DO NOT EDIT DIRECTLY, run npm run sync:warplan -->";

function fail(msg) {
  console.error("sync-warplan: " + msg);
  process.exit(1);
}

if (!fs.existsSync(SRC)) fail("source missing: " + SRC);
const raw = fs.readFileSync(SRC);
if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf)
  fail("source has BOM, expected plain UTF-8");
const html = raw.toString("utf8");
const count = (s, sub) => s.split(sub).length - 1;
if (count(html, "</body>") !== 1) fail("expected exactly one </body>");
if (count(html, "<head>") !== 1) fail("expected exactly one <head>");
if (html.includes(TAG)) fail("source already contains main.tsx tag");
if (html.includes("SYNCED FROM war-plan")) fail("source looks generated, abort");

const out = html
  .replace("<head>", "<head>\n" + MARKER)
  .replace("</body>", TAG + "\n</body>");
// 原子写入：先写临时文件再改名，避免崩溃留下半个 index.html
const tmp = DST + ".tmp";
fs.writeFileSync(tmp, out);
fs.renameSync(tmp, DST);
console.log("sync-warplan: index.html regenerated from war-plan/WAR_PLAN.html");
