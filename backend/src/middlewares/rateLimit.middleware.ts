import type { Request } from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

function clientIpKey(req: Request) {
  const cloudflareIp = req.headers['cf-connecting-ip'];
  const ip = typeof cloudflareIp === 'string' && cloudflareIp ? cloudflareIp : req.ip ?? '';
  return ipKeyGenerator(ip);
}

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  message: { error: 'Muitas contas criadas a partir deste acesso. Tente novamente mais tarde.' },
});
