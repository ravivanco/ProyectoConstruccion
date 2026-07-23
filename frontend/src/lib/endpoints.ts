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
    list: "/nutrition-plans", // GET /api/nutrition-plans
    create: "/nutrition-plans", // POST /api/nutrition-plans
    detail: (planId: string) => `/nutrition-plans/${planId}`, // GET
    weeklyStructure: (planId: string) => `/nutrition-plans/${planId}/weekly-structure`, // PUT
    activate: (planId: string) => `/nutrition-plans/${planId}/activate`, // PATCH
    lockModule: (planId: string) => `/nutrition-plans/${planId}/lock-module`, // PATCH
    unlockModule: (planId: string) => `/nutrition-plans/${planId}/unlock-module`, // PATCH
  },
  alerts: {
    list: "/alerts", // GET
    resolve: (alertId: string) => `/alerts/${alertId}/resolve`, // PATCH
  },
  appointments: {
    list: "/appointments", // GET
    patient: (patientId: string) => `/appointments/patient/${patientId}`, // GET
  },
  adherence: {
    summary: (patientId: string) => `/adherence/patient/${patientId}/summary`, // GET
    log: (patientId: string) => `/adherence/patient/${patientId}/log`, // POST
    extraConsumption: (patientId: string) => `/adherence/patient/${patientId}/extra-consumption`, // POST
  }
};
