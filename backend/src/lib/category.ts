import { prisma } from './prisma.js';

export const CATEGORY_NOT_OWNED_ERROR = 'Categoria informada não existe ou não pertence a este usuário.';

export async function userOwnsCategory(userId: string, categoryId: unknown) {
  const category = await prisma.category.findFirst({
    where: { id: String(categoryId), userId },
    select: { id: true },
  });
  return category !== null;
}
