import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DK-FITT API',
      version: '1.0.0',
      description: 'API REST de nutrición activa DK-FITT',
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
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
