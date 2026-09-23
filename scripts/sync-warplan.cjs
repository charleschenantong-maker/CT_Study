// 单一源头同步：war-plan/WAR_PLAN.html 是页面唯一可编辑的源文件。
// 本脚本将其同步为应用入口 index.html（注入防误改标记 + main.ts 桥接），
// dev/build 前自动执行（见 package.json 的 predev/prebuild）。
// 用法：npm run sync:warplan
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "war-plan", "WAR_PLAN.html");
const DST = path.join(ROOT, "index.html");
const TAG = '<script type="module" src="/src/main.ts"></script>';
const MARKER =
  "<!-- SYNCED FROM war-plan/WAR_PLAN.html — DO NOT EDIT DIRECTLY, run npm run sync:warplan -->";
// 木纹 turbulence 砖：源文件内联 data-uri（单文件预览自包含）；应用入口改走 public/ 下的
// 预渲染 PNG（像素级一致，已验证），避免每帧重跑 SVG 滤镜。PNG 由仓库文件提供，不在这里生成。
const TILE_RE = /url\("data:image\/svg\+xml,%3Csvg[\s\S]*?%3C\/svg%3E"\)/g;
const TILE_FILE = 'url("/war-plan-assets/wood-tile.png")';

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
if (html.includes(TAG)) fail("source already contains main.ts tag");
if (html.includes("SYNCED FROM war-plan")) fail("source looks generated, abort");
const tileHits = html.match(TILE_RE) || [];
if (tileHits.length !== 1) fail("expected exactly one svg tile uri, found " + tileHits.length);
const tileFile = path.join(ROOT, "public", "war-plan-assets", "wood-tile.png");
if (!fs.existsSync(tileFile)) fail("tile png missing: " + tileFile);

const out = html
  .replace("<head>", "<head>\n" + MARKER)
  .replace(TILE_RE, TILE_FILE)
  .replace("</body>", TAG + "\n</body>");
// 原子写入：先写临时文件再改名，避免崩溃留下半个 index.html
const tmp = DST + ".tmp";
fs.writeFileSync(tmp, out);
fs.renameSync(tmp, DST);
console.log("sync-warplan: index.html regenerated from war-plan/WAR_PLAN.html");
