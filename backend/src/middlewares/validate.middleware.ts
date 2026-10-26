import type { Request, Response, NextFunction } from 'express';
import type { ZodType, ZodError } from 'zod';

interface RequestSchemas {
  body?: ZodType;
  query?: ZodType;
}

function formatIssues(error: ZodError) {
  const details = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  return { error: details[0]?.message ?? 'Dados inválidos.', details };
}

export function validate({ body, query }: RequestSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (body) {
      const result = body.safeParse(req.body ?? {});
      if (!result.success) {
        return res.status(400).json(formatIssues(result.error));
      }
      req.body = result.data;
    }

    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json(formatIssues(result.error));
      }
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    return next();
  };
}
