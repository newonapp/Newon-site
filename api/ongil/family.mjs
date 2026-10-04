/*
 * ONGIL Family Connection V2 — Vercel function for /api/ongil/family.
 * Answers only when ONGIL_FAMILY_REMOTE_ENABLED=true AND LIVON_DATABASE_URL AND Newon+ token verification are configured
 * (and, in production, the shared rate limiter). Otherwise every signed-in call is a fail-closed 503; ?op=status reports
 * the switches as booleans. Never constructs the in-memory store.
 */
import { createFamilyHandler } from '../../server/ongil/family/http.mjs';

export default createFamilyHandler();
