import { Router } from 'express';
import { upsertAdherenceLog, getAdherenceLogs, addExtraConsumption, getExtraConsumptions } from '../repositories/adherenceRepository.js';

export const adherenceRouter = Router();

// GET /api/adherence/patient/:patientId/summary
adherenceRouter.get('/api/adherence/patient/:patientId/summary', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const logs = await getAdherenceLogs(patientId, 7);
    const extra = await getExtraConsumptions(patientId, 10);
    res.json({ logs, extraConsumptions: extra });
  } catch (error) {
    console.error('Error fetching adherence summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/adherence/patient/:patientId/weight-trend
adherenceRouter.get('/api/adherence/patient/:patientId/weight-trend', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const logs = await getAdherenceLogs(patientId, 30);
    // Filtrar solo los que tienen peso y ordenarlos cronológicamente ascendente (para gráficas)
    const trend = logs
      .filter(l => l.dailyWeightKg !== null && l.dailyWeightKg !== undefined)
      .map(l => ({ date: l.logDate, weight: l.dailyWeightKg }))
      .reverse(); 
    res.json(trend);
  } catch (error) {
    console.error('Error fetching weight trend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/adherence/patient/:patientId/log
adherenceRouter.post('/api/adherence/patient/:patientId/log', async (req, res) => {
  try {
    const data = req.body;
    const log = await upsertAdherenceLog({
      patientId: req.params.patientId,
      logDate: data.logDate || new Date().toISOString().slice(0, 10),
      mealAdherencePercent: data.mealAdherencePercent || 0,
      physicalAdherencePercent: data.physicalAdherencePercent || 0,
      dailyWeightKg: data.dailyWeightKg,
      extraCaloriesConsumed: data.extraCaloriesConsumed || 0,
      adherenceLevel: data.adherenceLevel || 'MEDIA',
    });
    res.json(log);
  } catch (error) {
    console.error('Error logging adherence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/adherence/patient/:patientId/extra-consumption
adherenceRouter.post('/api/adherence/patient/:patientId/extra-consumption', async (req, res) => {
  try {
    const data = req.body;
    const extra = await addExtraConsumption({
      patientId: req.params.patientId,
      logDate: data.logDate || new Date().toISOString().slice(0, 10),
      foodDescription: data.foodDescription,
      calories: data.calories,
      imageUrl: data.imageUrl,
    });
    res.status(201).json(extra);
  } catch (error) {
    console.error('Error logging extra consumption:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
