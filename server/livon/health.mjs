import { isProduction, protectionConfigured, rateCaps } from './chat.mjs';
import { applyCors, CorsError } from './cors.mjs';
import { PROVIDERS } from './data/http.mjs';
import { json } from './http.mjs';
import { userdataStatus } from './userdata/http.mjs';

/*
 * GET /api/health — deployment check. Booleans, counts and a timestamp only: never a key, token, URL or limit secret.
 *   aiConfigured / protectionConfigured are kept for the LIVON AI page (livon/ai-page.js detectApi).
 */
export function createHealthHandler({ env = process.env, now = () => Date.now() } = {}) {
  return (req, res) => {
    try {
      const cors = applyCors(req, res, env, { methods: ['GET'] });
      if (cors.preflight) { res.statusCode = 204; res.setHeader('Cache-Control', 'no-store'); return res.end(); }
    } catch (e) {
      if (e instanceof CorsError) return json(res, 403, { success: false, error: '허용되지 않은 요청입니다.', code: 'ORIGIN_NOT_ALLOWED' });
      throw e;
    }
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET, OPTIONS'); return json(res, 405, { success: false, error: '허용되지 않은 요청입니다.', code: 'METHOD_NOT_ALLOWED' }); }
    const aiConfigured = !!env.OPENAI_API_KEY?.trim();
    const protection = !isProduction(env) || protectionConfigured(env);
    let limitsValid = true; try { rateCaps(env); } catch { limitsValid = false; }
    const providers = {};
    for (const p of Object.values(PROVIDERS)) providers[p.id] = { configured: !!p.configured(env) };
    json(res, 200, {
      status: 'ok', service: 'livon-api', time: new Date(now()).toISOString(),
      aiConfigured, protectionConfigured: protection,
      ai: { configured: aiConfigured, protectionConfigured: protection, limitsValid, ready: aiConfigured && protection && limitsValid },
      data: { providers, configuredCount: Object.values(providers).filter(p => p.configured).length, total: Object.keys(providers).length },
      userdata: (u => ({ enabled: u.enabled, database: u.database, auth: u.auth, ready: u.enabled && u.database && u.auth && protection }))(userdataStatus(env))
    });
  };
}
export const health = createHealthHandler();
