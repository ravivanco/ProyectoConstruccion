import { Router } from 'express';
import { getAppointments, getAppointmentsByPatient, createAppointment, updateAppointmentStatus } from '../repositories/appointmentRepository.js';

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

// PATCH /api/appointments/:id/status
appointmentsRouter.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await updateAppointmentStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
