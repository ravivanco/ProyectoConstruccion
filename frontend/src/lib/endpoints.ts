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
  }
};
