import React from 'react';
import { Alert, CircularProgress } from '@mui/material';
import { useServerStatus } from '../hooks/useServerStatus';

export const ServerWakeUpNotice: React.FC = () => {
  const status = useServerStatus();

  if (status === 'waking') {
    return (
      <Alert severity="info" icon={<CircularProgress size={18} />} sx={{ mb: 2, borderRadius: 2 }}>
        <strong>Acordando o servidor…</strong> Ele entra em modo de espera quando fica sem uso e pode levar até
        1 minuto para responder.
      </Alert>
    );
  }

  if (status === 'offline') {
    return (
      <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
        Não foi possível conectar ao servidor. Verifique sua internet ou tente novamente em instantes.
      </Alert>
    );
  }

  return null;
};
