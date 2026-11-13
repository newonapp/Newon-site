/*
 * 스토어 상품 자료 (Phase 7). There is NO product provider in this repository: no commerce API, no affiliate API,
 * no catalog. createProductSource() therefore answers "unavailable / NOT_CONNECTED" and the screen says
 * "아직 연결된 상품이 없어요." — ONGIL never shows an invented product.
 *
 * A future source keeps this shape:
 *   { id, label, connected, load() → Promise<{ state: 'ready' | 'empty' | 'unavailable', reason?, items: raw[] }> }
 * and maps its own payload to the Product contract fields (store-contracts.js normalizeProduct does the rest).
 */
import { createUnconnectedSource } from './data-source.js';

export const PRODUCT_SOURCE_ID = 'products';
export function createProductSource() {
  return createUnconnectedSource(PRODUCT_SOURCE_ID, '상품 정보');
}
