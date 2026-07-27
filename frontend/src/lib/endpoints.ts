export const endpoints = {
  auth: {
    me: "/me",
  },
  dashboard: {
    nutritionist: "/dashboard/nutritionist",
  },
  patients: {
    list: "/patients", // GET /api/patients
    profile: (patientId: string) => `/patient-profile/${patientId}`, // GET /api/patient-profile/:patientId
  },
  clinicalEvaluations: {
    history: (patientId: string) => `/clinical-evaluations/patient/${patientId}`, // GET
    create: "/clinical-evaluations", // POST
    compare: (patientId: string, baseId: string, targetId: string) => 
      `/clinical-evaluations/patient/${patientId}/compare?baseId=${baseId}&targetId=${targetId}`, // GET
    trends: (patientId: string) => `/clinical-evaluations/patient/${patientId}/trends`, // GET
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
    weightTrend: (patientId: string) => `/adherence/patient/${patientId}/weight-trend`, // GET
  },
  calorieControl: {
    today: (patientId: string) => `/calorie-control/patient/${patientId}/today`, // GET
  }
};
