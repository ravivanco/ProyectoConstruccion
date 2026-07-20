import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  createAlert,
  findAlertById,
  generateAutomaticAlerts,
  listAlerts,
  updateAlertStatus,
} from '../repositories/alertRepository.js';
import { assertPatientBelongsToNutritionist } from '../repositories/appointmentRepository.js';
import { ALERT_STATUSES, ALERT_TYPES } from '../types/alert.js';
import { ALERT_RULES } from '../utils/alertRules.js';

export const alertsRouter = Router();

alertsRouter.get('/alerts/rules', authenticate, (_req, res) => {
  res.json({ rules: ALERT_RULES });
});

alertsRouter.get('/alerts/types', authenticate, (_req, res) => {
  res.json({
    types: ALERT_TYPES.map((type) => ({
      type,
      rule: ALERT_RULES.find((rule) => rule.alertType === type),
    })),
  });
});

alertsRouter.post('/alerts/generate', authenticate, async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const patientId = typeof body.patientId === 'string' ? body.patientId.trim() : '';

    if (!patientId) {
      return res.status(400).json({ message: 'patientId requerido' });
    }

    if (req.user?.role === 'paciente' && patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user?.role === 'nutricionista') {
      const belongs = await assertPatientBelongsToNutritionist(patientId, req.user.id);
      if (!belongs) return res.status(404).json({ message: 'Paciente no encontrado' });
    }

    const alerts = await generateAutomaticAlerts(
      patientId,
      req.user?.role === 'nutricionista' ? req.user.id : undefined,
    );
    res.status(201).json({ generated: alerts.length, alerts });
  } catch (error) {
    next(error);
  }
});

alertsRouter.get('/alerts', authenticate, async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' &&
      ALERT_STATUSES.includes(req.query.status as typeof ALERT_STATUSES[number])
      ? (req.query.status as typeof ALERT_STATUSES[number])
      : undefined;

    if (req.user?.role === 'paciente') {
      const alerts = await listAlerts({ patientId: req.user.id, status });
      return res.json(alerts);
    }

    const patientId = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
    const alerts = await listAlerts({
      patientId,
      nutritionistId: req.user?.id,
      status,
    });
    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

alertsRouter.get('/alerts/:id', authenticate, async (req, res, next) => {
  try {
    const alert = await findAlertById(String(req.params.id));
    if (!alert) return res.status(404).json({ message: 'Alerta no encontrada' });

    if (req.user?.role === 'paciente' && alert.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json({
      ...alert,
      classificationDetails: {
        classification: alert.classification,
        severity: alert.severity,
        alertType: alert.alertType,
      },
    });
  } catch (error) {
    next(error);
  }
});

alertsRouter.patch('/alerts/:id/review', authenticate, requireRole('nutricionista'), async (req, res, next) => {
  try {
    const updated = await updateAlertStatus(String(req.params.id), 'reviewed');
    if (!updated) return res.status(404).json({ message: 'Alerta no encontrada' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

alertsRouter.patch('/alerts/:id/status', authenticate, requireRole('nutricionista'), async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const status = typeof body.status === 'string' ? body.status : '';

    if (!ALERT_STATUSES.includes(status as typeof ALERT_STATUSES[number])) {
      return res.status(400).json({ message: `status debe ser uno de: ${ALERT_STATUSES.join(', ')}` });
    }

    const updated = await updateAlertStatus(String(req.params.id), status as typeof ALERT_STATUSES[number]);
    if (!updated) return res.status(404).json({ message: 'Alerta no encontrada' });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

alertsRouter.post('/alerts', authenticate, requireRole('nutricionista'), async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const patientId = typeof body.patientId === 'string' ? body.patientId.trim() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const alertType = typeof body.alertType === 'string' ? body.alertType : 'plan_deviation';

    if (!patientId || !title || !message) {
      return res.status(400).json({ message: 'patientId, title y message son requeridos' });
    }

    const belongs = await assertPatientBelongsToNutritionist(patientId, req.user!.id);
    if (!belongs) return res.status(404).json({ message: 'Paciente no encontrado' });

    const alert = await createAlert({
      patientId,
      nutritionistId: req.user!.id,
      alertType: alertType as Parameters<typeof createAlert>[0]['alertType'],
      title,
      message,
      severity: typeof body.severity === 'string' ? body.severity as Parameters<typeof createAlert>[0]['severity'] : undefined,
      classification: typeof body.classification === 'string' ? body.classification as Parameters<typeof createAlert>[0]['classification'] : undefined,
    });

    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
});
