import { apiUrl } from '../api';

export function accountFrom(result) {
  const account = result?.User || result;
  if (typeof account?.email !== 'string' || !account.email || typeof account?.firstName !== 'string' || !Number.isFinite(account?.coins)) {
    throw new Error('Your account details could not be read. Please try signing in again.');
  }
  return account;
}

/** Existing API contracts, with bounded waits and readable network/format errors. */
export async function requestJson(path, options = {}) {
  const { signal, ...requestOptions } = options;
  const controller = new AbortController();
  const cancel = () => controller.abort();
  let timedOut = false;
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = window.setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
  try {
    let url;
    try { url = apiUrl(path); } catch { throw new Error('This service is unavailable right now. Please try again later.'); }
    const response = await fetch(url, { ...requestOptions, signal: controller.signal });
    const body = await response.text();
    let result;
    try { result = JSON.parse(body); } catch { throw new Error('The service returned an unreadable response. Please try again; your details are still here.'); }
    if (!response.ok) throw new Error(result?.message || 'The request could not be completed. Please try again.');
    if (!result || typeof result !== 'object') throw new Error('The service returned an incomplete response. Please try again.');
    return result;
  } catch (error) {
    if (timedOut) throw new Error('This is taking too long. Please try again; your details are still here.');
    if (error instanceof TypeError) throw new Error('Could not connect. Check your connection and try again; your details are still here.');
    throw error;
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
