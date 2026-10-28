import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createServerWakeUp, type ServerStatus } from './serverStatus';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function respondAfter(ms: number) {
  return () => new Promise((resolve) => setTimeout(resolve, ms));
}

function failAfter(ms: number) {
  return () => new Promise((_, reject) => setTimeout(() => reject(new Error('indisponível')), ms));
}

function trackStatuses(server: ReturnType<typeof createServerWakeUp>) {
  const history: ServerStatus[] = [server.getStatus()];
  server.subscribe(() => history.push(server.getStatus()));
  return history;
}

describe('acordar o servidor', () => {
  it('servidor acordado: responde rápido e o aviso nunca aparece', async () => {
    const server = createServerWakeUp(respondAfter(300));
    const history = trackStatuses(server);

    server.wakeUp();
    await vi.advanceTimersByTimeAsync(300);

    expect(history).toEqual(['checking', 'ready']);
  });

  it('servidor dormindo: mostra o aviso após 2,5s e some quando responde', async () => {
    const server = createServerWakeUp(respondAfter(40_000));
    server.wakeUp();

    await vi.advanceTimersByTimeAsync(2_499);
    expect(server.getStatus()).toBe('checking');

    await vi.advanceTimersByTimeAsync(1);
    expect(server.getStatus()).toBe('waking');

    await vi.advanceTimersByTimeAsync(37_500);
    expect(server.getStatus()).toBe('ready');
  });

  it('tenta de novo enquanto o servidor ainda está subindo', async () => {
    const ping = vi
      .fn()
      .mockImplementationOnce(failAfter(1_000))
      .mockImplementationOnce(failAfter(1_000))
      .mockImplementation(respondAfter(500));
    const server = createServerWakeUp(ping);

    server.wakeUp();
    await vi.advanceTimersByTimeAsync(20_000);

    expect(ping).toHaveBeenCalledTimes(3);
    expect(server.getStatus()).toBe('ready');
  });

  it('desiste depois do tempo máximo e avisa que está fora do ar', async () => {
    const server = createServerWakeUp(failAfter(1_000), { maxWaitMs: 30_000 });

    server.wakeUp();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(server.getStatus()).toBe('offline');
  });

  it('várias telas pedindo ao mesmo tempo geram uma única chamada', async () => {
    const ping = vi.fn(respondAfter(100));
    const server = createServerWakeUp(ping);

    server.wakeUp();
    server.wakeUp();
    server.wakeUp();
    await vi.advanceTimersByTimeAsync(100);

    expect(ping).toHaveBeenCalledTimes(1);
  });
});
