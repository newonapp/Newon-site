#!/usr/bin/env node
/**
 * Serves _publish/ on http://127.0.0.1:<port>/ (default 8899).
 * If the port is busy, tries 8900, 8901, … up to 15 times.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(path.join(__dirname, "..", "_publish"));
const START = Number(process.env.PORT) || 8899;

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  const map = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",
    ".txt": "text/plain; charset=utf-8",
  };
  return map[ext] || "application/octet-stream";
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] || "/");
  let rel = decoded.replace(/^\/+/, "");
  if (!rel || rel.endsWith("/")) rel = path.join(rel, "index.html");
  const abs = path.resolve(ROOT, rel);
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (abs !== ROOT && !abs.startsWith(rootWithSep)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  if (!fs.existsSync(ROOT)) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("_publish 폴더가 없습니다. 먼저: npm run publish\n");
    return;
  }
  const file = safePath(req.url || "/");
  if (!file) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found\n");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType(file) });
    res.end(data);
  });
});

function listen(port, tries) {
  server.once("error", (e) => {
    if (/** @type {NodeJS.ErrnoException} */ (e).code === "EADDRINUSE" && tries < 15) {
      listen(port + 1, tries + 1);
    } else {
      console.error(e);
      process.exit(1);
    }
  });
  server.listen(port, "127.0.0.1", () => {
    /* quick-preview.mjs 등이 실제 바인딩 포트를 알 수 있도록(8765 점유 시 8766으로 올라감) */
    console.log(`__NEWON_SERVE_PORT__ ${port}`);
    console.log(`\n  미리보기: http://127.0.0.1:${port}/\n  한국어: http://127.0.0.1:${port}/ko/\n  종료: Ctrl+C\n`);
  });
}

listen(START, 0);
