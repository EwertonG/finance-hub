import { Router } from 'express';
import {
  createRecurrence,
  listRecurrences,
  updateRecurrence,
  deleteRecurrence,
} from '../controllers/recurrence.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const recurrenceRoutes = Router();

recurrenceRoutes.use(authMiddleware);

recurrenceRoutes.post('/', createRecurrence);
recurrenceRoutes.get('/', listRecurrences);
recurrenceRoutes.put('/:id', updateRecurrence);
recurrenceRoutes.delete('/:id', deleteRecurrence);

export { recurrenceRoutes };
