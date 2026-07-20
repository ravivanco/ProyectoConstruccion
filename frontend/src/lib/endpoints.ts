export const endpoints = {
  auth: {
    me: "/me",
  },
  patients: {
    list: "/patients", // GET /api/patients
    profile: (patientId: string) => `/patient-profile/${patientId}`, // GET /api/patient-profile/:patientId
  },
  clinicalEvaluations: {
    history: (patientId: string) => `/clinical-evaluations/patient/${patientId}`, // GET
    create: "/clinical-evaluations", // POST
  },
  nutritionPlans: {
    activate: (planId: string) => `/nutrition-plans/${planId}/activate`, // PATCH
    lockModule: (planId: string) => `/nutrition-plans/${planId}/lock-module`, // PATCH
    unlockModule: (planId: string) => `/nutrition-plans/${planId}/unlock-module`, // PATCH
  },
  mealCompliance: {
    byDate: (patientId: string, date: string) => `/patients/${patientId}/meal-compliance?date=${date}`,
    summary: (patientId: string) => `/patients/${patientId}/meal-compliance/summary`,
  },
  physicalCompliance: {
    byDate: (patientId: string, date: string) => `/adherence/patient/${patientId}/exercise-compliance?date=${date}`,
    summary: (patientId: string) => `/adherence/patient/${patientId}/exercise-compliance/summary`,
  },
  adherenceIndicators: {
    byPeriod: (patientId: string, periodDays = 7) => `/adherence/patient/${patientId}/indicators?periodDays=${periodDays}`,
  },
  planDeviation: {
    byPeriod: (patientId: string, periodDays = 7) => `/adherence/patient/${patientId}/plan-deviation?periodDays=${periodDays}`,
  },
  weightRecords: {
    list: (patientId: string, fromDate?: string, toDate?: string) => {
      let url = `/weight-logs/patient/${patientId}`;
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (params.toString()) url += `?${params.toString()}`;
      return url;
    },
    chart: (patientId: string, days = 30) => `/weight-records/patient/${patientId}/chart?days=${days}`,
  },
  additionalIntake: {
    list: (patientId: string, logDate?: string) => {
      let url = `/additional-intake/patient/${patientId}`;
      if (logDate) url += `?logDate=${logDate}`;
      return url;
    },
  },
};
