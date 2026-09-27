import { ChatError, LIMITS, normalizeInput, checkRateLimit, generateReply, isProduction, protectionConfigured } from './chat.mjs';

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
}
async function readBody(req) {
  if (Number(req.headers['content-length']) > LIMITS.bodyBytes) throw new ChatError(413, 'BODY_TOO_LARGE');
  let body = req.body;
  if (body === undefined) {
    const chunks = []; let bytes = 0;
    for await (const chunk of req) {
      bytes += Buffer.byteLength(chunk);
      if (bytes > LIMITS.bodyBytes) throw new ChatError(413, 'BODY_TOO_LARGE');
      chunks.push(Buffer.from(chunk));
    }
    body = Buffer.concat(chunks).toString('utf8');
  }
  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  if (Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body)) > LIMITS.bodyBytes) throw new ChatError(413, 'BODY_TOO_LARGE');
  try { return typeof body === 'string' ? JSON.parse(body) : body; }
  catch { throw new ChatError(400, 'INVALID_JSON'); }
}
export function createChatHandler({ env = process.env, fetcher = fetch, limiter = checkRateLimit } = {}) {
  return async (req, res) => {
    const controller = new AbortController();
    const cancel = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', cancel);
    try {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); throw new ChatError(405, 'METHOD_NOT_ALLOWED'); }
      if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new ChatError(415, 'UNSUPPORTED_MEDIA_TYPE');
      const origin = req.headers.origin;
      if (req.headers['sec-fetch-site'] === 'cross-site') throw new ChatError(403, 'ORIGIN_NOT_ALLOWED');
      if (origin) {
        let originHost; try { originHost = new URL(origin).host; } catch { throw new ChatError(403, 'ORIGIN_NOT_ALLOWED'); }
        if (originHost !== req.headers.host) throw new ChatError(403, 'ORIGIN_NOT_ALLOWED');
      }
      const input = normalizeInput(await readBody(req));
      if (!env.OPENAI_API_KEY?.trim()) throw new ChatError(503, 'AI_NOT_CONFIGURED');
      // Only trust Vercel's overwritten IP header on Vercel. Never trust a client userId or generic X-Forwarded-For.
      const ip = env.VERCEL ? String(req.headers['x-vercel-forwarded-for'] || '').split(',')[0].trim() : req.socket?.remoteAddress;
      if (!ip) throw new ChatError(503, 'CLIENT_ID_UNAVAILABLE');
      await limiter(ip, env, fetcher);
      if (controller.signal.aborted) return;
      const reply = await generateReply(input, { env, fetcher, signal: controller.signal });
      if (!res.destroyed) json(res, 200, reply);
    } catch (error) {
      const safe = error instanceof ChatError ? error : new ChatError(500, 'SERVER_ERROR');
      if (safe.retryAfter) res.setHeader('Retry-After', String(safe.retryAfter));
      // Only fixed codes/status are logged in development; never body, IP, key or upstream detail.
      if (!isProduction(env)) console.warn('[LIVON AI]', safe.code, safe.status);
      if (!res.destroyed) json(res, safe.status, { success: false, error: safe.message, code: safe.code, ...(safe.retryAfter ? { retryAfter: safe.retryAfter } : {}) });
    } finally { res.removeListener('close', cancel); }
  };
}
export function health(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return json(res, 405, { success: false, error: '허용되지 않은 요청입니다.', code: 'METHOD_NOT_ALLOWED' }); }
  json(res, 200, { status: 'ok', aiConfigured: !!process.env.OPENAI_API_KEY?.trim(), protectionConfigured: !isProduction(process.env) || protectionConfigured(process.env) });
}
