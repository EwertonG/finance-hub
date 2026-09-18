import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const UNDO_WINDOW_MS = 5000;

interface UndoableDeleteOptions {
  message: string;
  errorMessage: string;
  remove: () => Promise<unknown>;
  restore: () => void;
  onCommitted?: () => void;
}

// Exclusão adiada: o item já saiu da tela (otimista); a chamada DELETE só
// é enviada depois da janela de desfazer, então "Desfazer" não toca o servidor.
export function useUndoableDelete() {
  const { notify } = useNotification();

  return useCallback(
    ({ message, errorMessage, remove, restore, onCommitted }: UndoableDeleteOptions) => {
      let undone = false;

      const timer = setTimeout(async () => {
        if (undone) return;
        try {
          await remove();
          onCommitted?.();
        } catch (error) {
          console.error(errorMessage, error);
          restore();
          notify(errorMessage, 'error');
        }
      }, UNDO_WINDOW_MS);

      notify(message, 'success', {
        actionLabel: 'Desfazer',
        duration: UNDO_WINDOW_MS,
        onAction: () => {
          undone = true;
          clearTimeout(timer);
          restore();
        },
      });
    },
    [notify]
  );
}
