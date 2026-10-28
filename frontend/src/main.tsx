import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App';
import { serverWakeUp } from './services/serverStatus';

serverWakeUp.wakeUp();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
