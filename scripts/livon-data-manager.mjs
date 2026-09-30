#!/usr/bin/env node
/**
 * LIVON Data Manager — local server (read-only static files, bound to 127.0.0.1 only).
 *
 *   node scripts/livon-data-manager.mjs            → http://127.0.0.1:8790/livon/admin/data/
 *   node scripts/livon-data-manager.mjs --port 0   → any free port
 *
 * Serves the repository root so the tool reads the same curated files the site uses. GET/HEAD only; no write endpoint.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
/* never served, even locally */
const DENY = /(^|\/)(\.env[^/]*|\.git|node_modules|\.vercel)(\/|$)/;

export function startServer({ port = 8790, host = '127.0.0.1', root = ROOT } = {}) {
  const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
    let rel;
    try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end(); }
    if (DENY.test(rel)) { res.writeHead(404); return res.end('Not found'); }
    let file = path.join(root, rel);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch { res.writeHead(404); return res.end('Not found'); }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
      res.end(req.method === 'HEAD' ? undefined : buf);
    });
  });
  return new Promise(resolve => server.listen(port, host, () => resolve(server)));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--port');
  const port = i > 0 ? Number(process.argv[i + 1]) : 8790;
  startServer({ port }).then(s => console.log(`LIVON Data Manager (local, read-only): http://127.0.0.1:${s.address().port}/livon/admin/data/`));
}
