import { Router } from 'express';
import { getAppointments, getAppointmentsByPatient, createAppointment, updateAppointmentStatus, updateAppointment, deleteAppointment, linkEvaluation } from '../repositories/appointmentRepository.js';

export const appointmentsRouter = Router();

// GET /api/appointments
appointmentsRouter.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await getAppointments();
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/appointments/patient/:patientId
appointmentsRouter.get('/api/appointments/patient/:patientId', async (req, res) => {
  try {
    const appointments = await getAppointmentsByPatient(req.params.patientId);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/appointments
appointmentsRouter.post('/api/appointments', async (req, res) => {
  try {
    const data = req.body;
    const appointment = await createAppointment({
      patientId: data.patientId,
      dateTime: data.dateTime,
      reason: data.reason,
      status: data.status || 'PROGRAMADA'
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/appointments/:id/status (HU41 - Control cumplimiento / HU42 - Estado de citas)
appointmentsRouter.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PROGRAMADA', 'ATENDIDA', 'CANCELADA', 'REPROGRAMADA'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Estado inválido. Estados permitidos: ${validStatuses.join(', ')}` });
    }
    const updated = await updateAppointmentStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/appointments/:id (editar cita)
appointmentsRouter.put('/api/appointments/:id', async (req, res) => {
  try {
    const { patientId, dateTime, reason } = req.body;
    const updated = await updateAppointment(req.params.id, { patientId, dateTime, reason });
    if (!updated) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/appointments/:id (eliminar cita)
appointmentsRouter.delete('/api/appointments/:id', async (req, res) => {
  try {
    const deleted = await deleteAppointment(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json({ message: 'Cita eliminada' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/appointments/:id/link-evaluation (HU40)
appointmentsRouter.patch('/api/appointments/:id/link-evaluation', async (req, res) => {
  try {
    const { evaluationId } = req.body;
    const updated = await linkEvaluation(req.params.id, evaluationId || null);
    if (!updated) return res.status(404).json({ error: 'Cita no encontrada' });
    res.json(updated);
  } catch (error) {
    console.error('Error linking evaluation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
