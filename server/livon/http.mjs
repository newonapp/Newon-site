import { randomUUID } from 'node:crypto';
import { ChatError, LIMITS, normalizeInput, checkRateLimit, generateReply, isProduction, emergencyCheck, EMERGENCY_REPLY, modelFor } from './chat.mjs';
import { applyCors, CorsError } from './cors.mjs';
import { groundingRefs } from './ai/tools.mjs';

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
/*
 * Server-side grounding (LIVON Data Platform): fills the free "LIVON 참고 항목" slots with real LIVON items for the question.
 * Read-only, in-memory, never stored. A slow or failing lookup never blocks the answer (≤ 1.5 s, then client refs only).
 * LIVON_AI_SERVER_REFS=0 turns it off.
 */
export async function withServerRefs(input, env, grounder = groundingRefs) {
  if (!grounder || env.LIVON_AI_SERVER_REFS === '0') return input;
  try {
    const refs = await Promise.race([grounder(input), new Promise(res => setTimeout(() => res(null), 1500).unref?.())]);
    return Array.isArray(refs) ? { ...input, refs: refs.slice(0, LIMITS.refs) } : input;
  } catch { return input; }
}
/*
 * Operational log — one line per request, metadata only: request id, latency, model, tool names, rounds, status code.
 * Never the question, the answer, saved/My Life data, an IP, a key or an upstream body.
 */
export function logMeta(meta, log = console.info) {
  try { log('[LIVON AI] ' + JSON.stringify({ rid: meta.rid, ms: Date.now() - meta.t0, model: meta.model || null, rounds: meta.rounds || 0, tools: meta.tools || [], code: meta.code || 'OK' })); } catch {}
}
export function createChatHandler({ env = process.env, fetcher = fetch, limiter = checkRateLimit, grounder = groundingRefs, log = console.info, dataCall } = {}) {
  return async (req, res) => {
    const meta = { rid: randomUUID().slice(0, 8), t0: Date.now(), tools: [], rounds: 0 };
    const controller = new AbortController();
    const cancel = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', cancel);
    try {
      /* CORS first: only same-origin or an allowlisted frontend origin (server/livon/cors.mjs) may call the AI */
      let cors;
      try { cors = applyCors(req, res, env, { methods: ['POST'] }); } catch (e) { if (e instanceof CorsError) throw new ChatError(403, 'ORIGIN_NOT_ALLOWED'); throw e; }
      if (cors.preflight) { res.statusCode = 204; res.setHeader('Cache-Control', 'no-store'); return res.end(); }
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST, OPTIONS'); throw new ChatError(405, 'METHOD_NOT_ALLOWED'); }
      if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new ChatError(415, 'UNSUPPORTED_MEDIA_TYPE');
      const input = normalizeInput(await readBody(req));
      /* emergency first: fixed safety guidance, no model call, also when the AI is not configured */
      if (emergencyCheck(input.message)) { meta.code = 'SAFETY_EMERGENCY'; return json(res, 200, { success: true, safety: 'emergency', message: EMERGENCY_REPLY, sources: [], actions: [], toolStatus: [] }); }
      if (!env.OPENAI_API_KEY?.trim()) throw new ChatError(503, 'AI_NOT_CONFIGURED');
      meta.model = modelFor(env);
      // Only trust Vercel's overwritten IP header on Vercel. Never trust a client userId or generic X-Forwarded-For.
      const ip = env.VERCEL ? String(req.headers['x-vercel-forwarded-for'] || '').split(',')[0].trim() : req.socket?.remoteAddress;
      if (!ip) throw new ChatError(503, 'CLIENT_ID_UNAVAILABLE');
      await limiter(ip, env, fetcher);
      if (controller.signal.aborted) return;
      const grounded = await withServerRefs(input, env, grounder);
      if (controller.signal.aborted) return;
      const reply = await generateReply(grounded, { env, fetcher, signal: controller.signal, ip, meta, dataCall });
      if (!res.destroyed) json(res, 200, reply);
    } catch (error) {
      const safe = error instanceof ChatError ? error : new ChatError(500, 'SERVER_ERROR');
      meta.code = safe.code;
      if (safe.retryAfter) res.setHeader('Retry-After', String(safe.retryAfter));
      // Only fixed codes/status are logged in development; never body, IP, key or upstream detail.
      if (!isProduction(env)) console.warn('[LIVON AI]', safe.code, safe.status);
      if (!res.destroyed) json(res, safe.status, { success: false, error: safe.message, code: safe.code, ...(safe.retryAfter ? { retryAfter: safe.retryAfter } : {}) });
    } finally { res.removeListener('close', cancel); if (isProduction(env)) logMeta(meta, log); }
  };
}
