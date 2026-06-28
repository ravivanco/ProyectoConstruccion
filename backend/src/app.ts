import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { indexRouter } from './routes/index.route.js';
import { healthRouter } from './routes/health.route.js';
import { meRouter } from './routes/me.route.js';
import { nutritionPlansRouter } from './routes/nutritionPlans.route.js';
import { setupSwagger } from './swagger/swagger.js';

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(requestLogger);

  app.use(indexRouter);
  app.use(healthRouter);
  app.use(meRouter);
  app.use(nutritionPlansRouter);

  setupSwagger(app);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });

  app.use(errorHandler);

  return app;
}
