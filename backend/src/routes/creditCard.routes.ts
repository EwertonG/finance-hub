import { Router } from 'express';
import {
  getCreditCard,
  upsertCreditCard,
  deleteCreditCard,
  getCreditCardInvoice,
} from '../controllers/creditCard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upsertCreditCardSchema, invoiceQuerySchema } from '../schemas/creditCard.schema.js';

const creditCardRoutes = Router();

creditCardRoutes.use(authMiddleware);

creditCardRoutes.get('/', getCreditCard);
creditCardRoutes.put('/', validate({ body: upsertCreditCardSchema }), upsertCreditCard);
creditCardRoutes.delete('/', deleteCreditCard);
creditCardRoutes.get('/invoice', validate({ query: invoiceQuerySchema }), getCreditCardInvoice);

export { creditCardRoutes };
