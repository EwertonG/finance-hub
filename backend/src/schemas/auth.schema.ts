import { z } from 'zod';
import { requiredText } from './common.js';

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const PASSWORD_REQUIREMENTS_MESSAGE =
  'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.';

const email = z
  .string({ error: 'O e-mail é obrigatório.' })
  .trim()
  .toLowerCase()
  .min(1, 'O e-mail é obrigatório.')
  .pipe(z.email('E-mail inválido.').max(254, 'E-mail inválido.'));

const strongPassword = z
  .string({ error: 'A senha é obrigatória.' })
  .max(128, 'A senha deve ter no máximo 128 caracteres.')
  .regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE);

const anyPassword = z
  .string({ error: 'A senha é obrigatória.' })
  .min(1, 'A senha é obrigatória.')
  .max(128, 'Senha inválida.');

export const registerSchema = z.object({
  name: requiredText('O nome', 100),
  email,
  password: strongPassword,
});

export const loginSchema = z.object({
  email,
  password: anyPassword,
});

export const updateProfileSchema = z
  .object({
    name: requiredText('O nome', 100).optional(),
    email: email.optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Informe nome e/ou e-mail para atualizar.',
  });

export const changePasswordSchema = z.object({
  currentPassword: anyPassword,
  newPassword: strongPassword,
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  token: z.string({ error: 'Link inválido.' }).min(1, 'Link inválido.').max(200, 'Link inválido.'),
  password: strongPassword,
});
