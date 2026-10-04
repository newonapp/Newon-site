/* POST /api/livon/ai/chat — the role-separated path for LIVON AI chat (same handler as /api/livon/chat, which stays for existing clients). */
import { createChatHandler } from '../../../server/livon/http.mjs';
export default createChatHandler();
