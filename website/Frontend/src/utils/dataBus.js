/**
 * Lightweight data-refresh bus.
 *
 * Every mutation in src/services notifies this bus after the backend confirms
 * the change, and the long-lived shells (AdminDashboard, DashboardPage) listen
 * for it and re-read the affected datasets from the server. This keeps every
 * open list, table and ledger in sync without the user having to reload the
 * browser tab manually.
 *
 * It follows the same window-event pattern the app already uses for
 * `nispl_permissions_changed` and `nispl_new_notification`.
 */

export const DATA_CHANGED_EVENT = 'nispl_data_changed';

/**
 * Resource keys understood by the listening shells:
 * 'customers' | 'contracts' | 'payments' | 'products' | 'portal' | '*'
 * Pass nothing (or '*') to signal "everything may be stale".
 * @param {string|string[]} [resources]
 */
export function notifyDataChanged(resources = '*') {
  if (typeof window === 'undefined') return;
  const detail = Array.isArray(resources) ? resources : [resources];
  window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT, { detail }));
}

/**
 * Subscribe to data-change notifications.
 * @param {(event: CustomEvent) => void} handler
 * @returns {() => void} unsubscribe function
 */
export function onDataChanged(handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(DATA_CHANGED_EVENT, handler);
  return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
}
