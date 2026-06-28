const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export interface StartDateValidationResult {
  valid: boolean;
  message?: string;
}

export function validateStartDate(startDate: string): StartDateValidationResult {
  if (!startDate?.trim()) {
    return { valid: false, message: 'startDate es requerido' };
  }

  if (!ISO_DATE_REGEX.test(startDate)) {
    return { valid: false, message: 'startDate debe tener formato YYYY-MM-DD' };
  }

  const parsed = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, message: 'startDate no es una fecha válida' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxFuture = new Date(today);
  maxFuture.setFullYear(maxFuture.getFullYear() + 1);

  if (parsed < today) {
    return { valid: false, message: 'startDate no puede ser anterior a hoy' };
  }

  if (parsed > maxFuture) {
    return { valid: false, message: 'startDate no puede ser más de un año en el futuro' };
  }

  return { valid: true };
}
