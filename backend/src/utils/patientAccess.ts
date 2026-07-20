import { Request } from 'express';

type AccessResult =
  | { ok: true; patientId: string }
  | { ok: false; status: number; message: string };

export function resolvePatientAccess(
  req: Request,
  requestedPatientId?: string,
): AccessResult {
  const patientId = (requestedPatientId ?? req.user?.id ?? '').trim();

  if (!patientId) {
    return { ok: false, status: 400, message: 'patientId requerido' };
  }

  if (req.user?.role === 'paciente' && patientId !== req.user.id) {
    return { ok: false, status: 403, message: 'No autorizado para consultar otro paciente' };
  }

  return { ok: true, patientId };
}
