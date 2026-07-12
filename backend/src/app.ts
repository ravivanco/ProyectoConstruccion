import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { indexRouter } from './routes/index.route.js';
import { healthRouter } from './routes/health.route.js';
import { meRouter } from './routes/me.route.js';
import { clinicalEvaluationsRouter } from './routes/clinicalEvaluations.route.js';
import { nutritionPlansRouter } from './routes/nutritionPlans.route.js';
import { calorieControlRouter } from './routes/calorieControl.route.js';
import { patientsRouter } from './routes/patients.route.js';
import { patientProfileRouter } from './routes/patientProfile.route.js';
import { macroRouter } from './routes/macro.route.js';
import { foodsRouter } from './routes/foods.route.js';
import { planWeeksRouter } from './routes/planWeeks.route.js';
import { dishesRouter } from './routes/dishes.route.js';
import { menuGenerationRouter } from './routes/menuGeneration.route.js';
import { mediaRouter } from './routes/media.route.js';
import { mealLogsRouter } from './routes/mealLogs.route.js';
import { exerciseLogsRouter } from './routes/exerciseLogs.route.js';
import { weightLogsRouter } from './routes/weightLogs.route.js';
import { additionalIntakeRouter } from './routes/additionalIntake.route.js';
import { trackingVisionRouter } from './routes/trackingVision.route.js';
import { setupSwagger } from './swagger/swagger.js';

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(requestLogger);

  app.use(indexRouter);
  app.use(healthRouter);
  app.use(meRouter);
  app.use(clinicalEvaluationsRouter);
  app.use(nutritionPlansRouter);
  app.use(calorieControlRouter);
  app.use(patientsRouter);
  app.use(patientProfileRouter);
  app.use(macroRouter);
  app.use(foodsRouter);
  app.use(planWeeksRouter);
  app.use(dishesRouter);
  app.use(menuGenerationRouter);
  app.use(mediaRouter);
  app.use(mealLogsRouter);
  app.use(exerciseLogsRouter);
  app.use(weightLogsRouter);
  app.use(additionalIntakeRouter);
  app.use(trackingVisionRouter);

  setupSwagger(app);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });

  app.use(errorHandler);

  return app;
}
