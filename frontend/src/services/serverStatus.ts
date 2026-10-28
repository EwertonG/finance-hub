import { api } from './api';

export type ServerStatus = 'checking' | 'waking' | 'ready' | 'offline';

interface WakeUpOptions {
  slowResponseMs?: number;
  retryDelayMs?: number;
  maxWaitMs?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createServerWakeUp(ping: () => Promise<unknown>, options: WakeUpOptions = {}) {
  const { slowResponseMs = 2500, retryDelayMs = 5000, maxWaitMs = 120_000 } = options;

  let status: ServerStatus = 'checking';
  let pending: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  function setStatus(next: ServerStatus) {
    if (status === next) return;
    status = next;
    listeners.forEach((listener) => listener());
  }

  async function run() {
    const startedAt = Date.now();
    const slowTimer = setTimeout(() => setStatus('waking'), slowResponseMs);

    try {
      while (true) {
        try {
          await ping();
          setStatus('ready');
          return;
        } catch {
          if (Date.now() - startedAt >= maxWaitMs) {
            setStatus('offline');
            return;
          }
          await sleep(retryDelayMs);
        }
      }
    } finally {
      clearTimeout(slowTimer);
    }
  }

  return {
    getStatus: () => status,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    wakeUp() {
      pending ??= run();
      return pending;
    },
  };
}

export const serverWakeUp = createServerWakeUp(() => api.get('/health', { timeout: 30_000 }));
