/* GET /api/livon/data/status — which public-data providers are configured (booleans only). Same as /api/livon/data?action=status. */
import { createDataHandler } from '../../../server/livon/data/http.mjs';
const handler = createDataHandler();
export default function status(req, res) {
  if (req.method === 'GET' || req.method === 'HEAD') req.url = '/api/livon/data?action=status';
  return handler(req, res);
}
