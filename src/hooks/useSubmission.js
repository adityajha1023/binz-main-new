import { useEffect, useRef, useState } from 'react';

/** One operation at a time, with accessible feedback and cancellation on unmount. */
export function useSubmission() {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState({ tone: 'info', message: '' });
  const active = useRef(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; active.current?.abort(); };
  }, []);

  async function run({ operation, pendingMessage, successMessage, successTone = 'success', onSuccess }) {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    setFeedback({ tone: 'loading', message: pendingMessage });
    try {
      const result = await operation(controller.signal);
      if (!mounted.current || controller.signal.aborted) return;
      onSuccess?.(result);
      setFeedback({ tone: typeof successTone === 'function' ? successTone(result) : successTone, message: typeof successMessage === 'function' ? successMessage(result) : successMessage });
      return result;
    } catch (error) {
      if (mounted.current && !controller.signal.aborted) {
        setFeedback({ tone: 'error', message: error.message || 'Something went wrong. Please try again; your details are still here.' });
      }
    } finally {
      active.current = null;
      if (mounted.current) setPending(false);
    }
  }

  return { pending, feedback, run, setFeedback, clear: () => setFeedback({ tone: 'info', message: '' }) };
}
