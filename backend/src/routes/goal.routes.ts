import { Router } from 'express';
import {
  createGoal,
  listGoals,
  updateGoal,
  deleteGoal,
  createContribution,
  listContributions,
  deleteContribution,
} from '../controllers/goal.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGoalSchema, updateGoalSchema, createContributionSchema } from '../schemas/goal.schema.js';

const goalRoutes = Router();

goalRoutes.use(authMiddleware);

goalRoutes.post('/', validate({ body: createGoalSchema }), createGoal);
goalRoutes.get('/', listGoals);
goalRoutes.put('/:id', validate({ body: updateGoalSchema }), updateGoal);
goalRoutes.delete('/:id', deleteGoal);

goalRoutes.post('/:id/contributions', validate({ body: createContributionSchema }), createContribution);
goalRoutes.get('/:id/contributions', listContributions);
goalRoutes.delete('/:id/contributions/:contributionId', deleteContribution);

export { goalRoutes };
