import { Router } from 'express';
import { getActiveAlerts, resolveAlert, createAlert } from '../repositories/alertsRepository.js';

export const alertsRouter = Router();

// GET /api/alerts
alertsRouter.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await getActiveAlerts();
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/alerts/:id/resolve
alertsRouter.patch('/api/alerts/:id/resolve', async (req, res) => {
  try {
    const updated = await resolveAlert(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Alert not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/alerts/generate
alertsRouter.post('/api/alerts/generate', async (req, res) => {
  try {
    const { patientId, type, severity, message } = req.body;
    if (!patientId || !type || !severity || !message) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const alert = await createAlert({ patientId, type, severity, message });
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error generating alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
