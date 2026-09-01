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

const goalRoutes = Router();

goalRoutes.use(authMiddleware);

goalRoutes.post('/', createGoal);
goalRoutes.get('/', listGoals);
goalRoutes.put('/:id', updateGoal);
goalRoutes.delete('/:id', deleteGoal);

goalRoutes.post('/:id/contributions', createContribution);
goalRoutes.get('/:id/contributions', listContributions);
goalRoutes.delete('/:id/contributions/:contributionId', deleteContribution);

export { goalRoutes };
