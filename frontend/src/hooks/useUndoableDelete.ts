import { useCallback } from 'react';
import type { AxiosRequestConfig } from 'axios';
import { api } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

const UNDO_WINDOW_MS = 5000;
const KEEPALIVE_CONFIG: AxiosRequestConfig = { adapter: 'fetch', fetchOptions: { keepalive: true } };

const pendingDeletes = new Map<ReturnType<typeof setTimeout>, () => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    pendingDeletes.forEach((flush) => flush());
  });
}

interface UndoableDeleteOptions {
  message: string;
  errorMessage: string;
  url: string;
  restore: () => void;
  onCommitted?: () => void;
}

// Exclusão adiada: o item já saiu da tela (otimista); a chamada DELETE só
// é enviada depois da janela de desfazer, então "Desfazer" não toca o servidor.
export function useUndoableDelete() {
  const { notify } = useNotification();

  return useCallback(
    ({ message, errorMessage, url, restore, onCommitted }: UndoableDeleteOptions) => {
      const commit = async (config?: AxiosRequestConfig) => {
        pendingDeletes.delete(timer);
        try {
          await api.delete(url, config);
          onCommitted?.();
        } catch (error) {
          console.error(errorMessage, error);
          restore();
          notify(errorMessage, 'error');
        }
      };

      const timer = setTimeout(() => commit(), UNDO_WINDOW_MS);

      pendingDeletes.set(timer, () => {
        clearTimeout(timer);
        commit(KEEPALIVE_CONFIG);
      });

      notify(message, 'success', {
        actionLabel: 'Desfazer',
        duration: UNDO_WINDOW_MS,
        onAction: () => {
          clearTimeout(timer);
          pendingDeletes.delete(timer);
          restore();
        },
      });
    },
    [notify]
  );
}
