import { useSyncExternalStore } from 'react';
import { serverWakeUp } from '../services/serverStatus';

export function useServerStatus() {
  return useSyncExternalStore(serverWakeUp.subscribe, serverWakeUp.getStatus);
}
