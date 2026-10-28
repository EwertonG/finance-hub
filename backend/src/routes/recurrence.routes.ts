import { Router } from 'express';
import {
  createRecurrence,
  listRecurrences,
  updateRecurrence,
  deleteRecurrence,
} from '../controllers/recurrence.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createRecurrenceSchema,
  updateRecurrenceSchema,
  recurrenceFiltersQuerySchema,
} from '../schemas/recurrence.schema.js';

const recurrenceRoutes = Router();

recurrenceRoutes.use(authMiddleware);

recurrenceRoutes.post('/', validate({ body: createRecurrenceSchema }), createRecurrence);
recurrenceRoutes.get('/', validate({ query: recurrenceFiltersQuerySchema }), listRecurrences);
recurrenceRoutes.put('/:id', validate({ body: updateRecurrenceSchema }), updateRecurrence);
recurrenceRoutes.delete('/:id', deleteRecurrence);

export { recurrenceRoutes };
