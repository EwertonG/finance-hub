import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';
import { authRoutes } from './routes/auth.routes.js';
import { categoryRoutes } from './routes/category.routes.js';
import { transactionRoutes } from './routes/transaction.routes.js';
import { debtorRoutes } from './routes/debtor.routes.js';
import { recurrenceRoutes } from './routes/recurrence.routes.js';
import { goalRoutes } from './routes/goal.routes.js';
import { allowedOrigins } from './config/origins.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

app.use(cors({ origin: allowedOrigins }));
app.use(compression());
app.use(express.json());

const apiDocsEnabled = process.env.API_DOCS_ENABLED === 'true';

if (apiDocsEnabled) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.get('/health', (req, res) => {
  return res.json({ status: 'ok', message: 'API está rodando!' });
});

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/debtors', debtorRoutes);
app.use('/recurrences', recurrenceRoutes);
app.use('/goals', goalRoutes);

export { app, apiDocsEnabled };
