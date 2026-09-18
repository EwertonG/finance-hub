import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';

type Severity = 'success' | 'error';

interface NotifyOptions {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface NotificationContextData {
  notify: (message: string, severity: Severity, options?: NotifyOptions) => void;
}

const NotificationContext = createContext<NotificationContextData | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'success' as Severity,
    options: undefined as NotifyOptions | undefined,
  });

  const notify = useCallback((message: string, severity: Severity, options?: NotifyOptions) => {
    setState({ open: true, message, severity, options });
  }, []);

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <Snackbar
        open={state.open}
        autoHideDuration={state.options?.duration ?? 4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{ width: '100%', color: '#fff' }}
          action={
            state.options?.actionLabel ? (
              <Button
                color="inherit"
                size="small"
                sx={{ fontWeight: 700 }}
                onClick={() => {
                  state.options?.onAction?.();
                  handleClose();
                }}
              >
                {state.options.actionLabel}
              </Button>
            ) : undefined
          }
        >
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de um NotificationProvider.');
  }
  return context;
}