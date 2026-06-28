import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DK-FITT API',
      version: '2.0.0',
      description: 'API REST de nutrición activa DK-FITT — Sprint 2: evaluaciones, planes y control calórico',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Desarrollo local' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Role: {
          type: 'string',
          enum: ['paciente', 'nutricionista'],
        },
        ApiInfo: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'DK-FITT API' },
            version: { type: 'string', example: '1.0.0' },
            status: { type: 'string', example: 'running' },
            docs: { type: 'string', example: '/api-docs' },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            uptime: { type: 'number', example: 120 },
            database: { type: 'string', enum: ['connected', 'disconnected'] },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { $ref: '#/components/schemas/Role' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        ClinicalEvaluation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string' },
            nutritionistId: { type: 'string' },
            weightKg: { type: 'number' },
            heightCm: { type: 'number' },
            bmi: { type: 'number' },
            bodyFatPercentage: { type: 'number' },
            waistCm: { type: 'number' },
            notes: { type: 'string' },
            evaluationDate: { type: 'string', format: 'date' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateClinicalEvaluationRequest: {
          type: 'object',
          required: ['patientId', 'weightKg', 'heightCm'],
          properties: {
            patientId: { type: 'string' },
            weightKg: { type: 'number', example: 75.5 },
            heightCm: { type: 'number', example: 175 },
            bodyFatPercentage: { type: 'number', example: 22 },
            waistCm: { type: 'number', example: 85 },
            notes: { type: 'string' },
            evaluationDate: { type: 'string', format: 'date' },
          },
        },
        NutritionPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string' },
            nutritionistId: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'active', 'inactive'] },
            moduleLocked: { type: 'boolean' },
            startDate: { type: 'string', format: 'date' },
            dailyCalories: { type: 'integer' },
            proteinG: { type: 'integer' },
            carbsG: { type: 'integer' },
            fatG: { type: 'integer' },
            activatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ActivatePlanRequest: {
          type: 'object',
          properties: {
            startDate: { type: 'string', format: 'date' },
          },
        },
        LockModuleRequest: {
          type: 'object',
          required: ['locked'],
          properties: {
            locked: { type: 'boolean' },
          },
        },
        CalorieDashboard: {
          type: 'object',
          properties: {
            patientId: { type: 'string' },
            plannedCalories: { type: 'integer' },
            consumedToday: { type: 'integer' },
            remainingToday: { type: 'integer' },
            weeklyAverageConsumed: { type: 'integer' },
            adherencePercentage: { type: 'integer' },
            macros: {
              type: 'object',
              properties: {
                proteinG: { type: 'integer' },
                carbsG: { type: 'integer' },
                fatG: { type: 'integer' },
              },
            },
            activePlanId: { type: 'string', format: 'uuid' },
            moduleLocked: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/': {
        get: {
          summary: 'Información general de la API',
          tags: ['Infraestructura'],
          responses: {
            200: {
              description: 'Información de la API',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiInfo' },
                },
              },
            },
          },
        },
      },
      '/health': {
        get: {
          summary: 'Estado del servidor y base de datos',
          tags: ['Infraestructura'],
          responses: {
            200: {
              description: 'Servidor y base de datos operativos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthResponse' },
                },
              },
            },
            503: {
              description: 'Base de datos no disponible',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthResponse' },
                },
              },
            },
          },
        },
      },
      '/api/me': {
        get: {
          summary: 'Perfil del usuario autenticado (placeholder)',
          tags: ['Autenticación'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Perfil del usuario',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserProfile' },
                },
              },
            },
            401: {
              description: 'No autenticado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/clinical-evaluations': {
        post: {
          summary: 'Registrar evaluación clínica',
          tags: ['Evaluaciones clínicas'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateClinicalEvaluationRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Evaluación creada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ClinicalEvaluation' },
                },
              },
            },
            400: { description: 'Datos inválidos' },
            401: { description: 'No autenticado' },
            403: { description: 'Solo nutricionista' },
          },
        },
      },
      '/clinical-evaluations/patient/{id}': {
        get: {
          summary: 'Listar evaluaciones clínicas de un paciente',
          tags: ['Evaluaciones clínicas'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Historial de evaluaciones',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      patientId: { type: 'string' },
                      evaluations: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ClinicalEvaluation' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'No autenticado' },
            403: { description: 'Solo nutricionista' },
          },
        },
      },
      '/nutrition-plans/{id}/activate': {
        patch: {
          summary: 'Activar plan nutricional',
          tags: ['Planes nutricionales'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActivatePlanRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Plan activado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NutritionPlan' },
                },
              },
            },
            404: { description: 'Plan no encontrado' },
          },
        },
      },
      '/nutrition-plans/{id}/lock-module': {
        patch: {
          summary: 'Bloquear o desbloquear módulo Mi Plan',
          tags: ['Planes nutricionales'],
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LockModuleRequest' },
              },
            },
          },
          responses: {
            200: {
              description: 'Estado de bloqueo actualizado',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/NutritionPlan' },
                },
              },
            },
            404: { description: 'Plan no encontrado' },
          },
        },
      },
      '/calorie-control/dashboard': {
        get: {
          summary: 'Dashboard de control calórico',
          tags: ['Control calórico'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'patientId',
              in: 'query',
              schema: { type: 'string' },
              description: 'Opcional para nutricionista; paciente usa su propio id',
            },
          ],
          responses: {
            200: {
              description: 'Resumen calórico',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CalorieDashboard' },
                },
              },
            },
            401: { description: 'No autenticado' },
            403: { description: 'No autorizado' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
