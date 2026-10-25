export const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function getFrontendUrl() {
  return (process.env.FRONTEND_URL ?? allowedOrigins[0]).replace(/\/+$/, '');
}
