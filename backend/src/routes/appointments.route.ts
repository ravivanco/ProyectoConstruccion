import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import {
  assertPatientBelongsToNutritionist,
  createAppointment,
  deleteAppointment,
  findAppointmentById,
  listAppointments,
  updateAppointment,
} from '../repositories/appointmentRepository.js';
import { APPOINTMENT_STATUSES } from '../types/appointment.js';

export const appointmentsRouter = Router();

appointmentsRouter.post('/appointments', authenticate, requireRole('nutricionista'), async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const patientId = typeof body.patientId === 'string' ? body.patientId.trim() : '';
    const scheduledAt = typeof body.scheduledAt === 'string' ? body.scheduledAt : '';

    if (!patientId || !scheduledAt) {
      return res.status(400).json({ message: 'patientId y scheduledAt son requeridos' });
    }

    const belongs = await assertPatientBelongsToNutritionist(patientId, req.user!.id);
    if (!belongs) return res.status(404).json({ message: 'Paciente no encontrado' });

    const appointment = await createAppointment(req.user!.id, {
      patientId,
      scheduledAt,
      durationMinutes: body.durationMinutes !== undefined ? Number(body.durationMinutes) : undefined,
      status: typeof body.status === 'string' ? body.status as typeof APPOINTMENT_STATUSES[number] : undefined,
      notes: typeof body.notes === 'string' ? body.notes : undefined,
      location: typeof body.location === 'string' ? body.location : undefined,
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.get('/appointments', authenticate, async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' &&
      APPOINTMENT_STATUSES.includes(req.query.status as typeof APPOINTMENT_STATUSES[number])
      ? (req.query.status as typeof APPOINTMENT_STATUSES[number])
      : undefined;

    if (req.user?.role === 'paciente') {
      const appointments = await listAppointments({ patientId: req.user.id, status });
      return res.json(appointments);
    }

    const patientId = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
    const appointments = await listAppointments({
      nutritionistId: req.user?.id,
      patientId,
      status,
      from: typeof req.query.from === 'string' ? req.query.from : undefined,
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
    });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.get('/appointments/:id', authenticate, async (req, res, next) => {
  try {
    const appointment = await findAppointmentById(String(req.params.id));
    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });

    if (req.user?.role === 'paciente' && appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.user?.role === 'nutricionista' && appointment.nutritionistId !== req.user.id) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.patch('/appointments/:id', authenticate, requireRole('nutricionista'), async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = await updateAppointment(String(req.params.id), req.user!.id, {
      scheduledAt: typeof body.scheduledAt === 'string' ? body.scheduledAt : undefined,
      durationMinutes: body.durationMinutes !== undefined ? Number(body.durationMinutes) : undefined,
      status: typeof body.status === 'string' ? body.status as typeof APPOINTMENT_STATUSES[number] : undefined,
      notes: typeof body.notes === 'string' ? body.notes : undefined,
      location: typeof body.location === 'string' ? body.location : undefined,
    });

    if (!updated) return res.status(404).json({ message: 'Cita no encontrada' });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

appointmentsRouter.delete('/appointments/:id', authenticate, requireRole('nutricionista'), async (req, res, next) => {
  try {
    const deleted = await deleteAppointment(String(req.params.id), req.user!.id);
    if (!deleted) return res.status(404).json({ message: 'Cita no encontrada' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
