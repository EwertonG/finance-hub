export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FinanceHub API',
    version: '1.0.0',
    description: 'Documentação e ambiente de testes interativo da API do FinanceHub',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT gerado no login para autenticar as requisições.',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health Check'],
        responses: {
          200: { description: 'API operando normalmente' },
        },
      },
    },
    // Auth
    '/auth/register': {
      post: {
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string'},
                  email: { type: 'string'},
                  password: { type: 'string'},
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário cadastrado com sucesso' },
          400: { description: 'Campos inválidos ou e-mail já cadastrado' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string'},
                  password: { type: 'string'},
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login realizado com sucesso' },
          400: { description: 'Credenciais inválidas' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Perfil retornado com sucesso' },
          401: { description: 'Token ausente ou inválido' },
        },
      },
    },

    // Categorias
    '/categories': {
      post: {
        tags: ['Categorias'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                  name: { type: 'string', example: 'Alimentação' },
                  color: { type: 'string', example: '#10B981' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Categoria criada com sucesso' },
          400: { description: 'Dados inválidos' },
        },
      },
      get: {
        tags: ['Categorias'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            description: 'Filtrar por tipo (INCOME ou EXPENSE)',
          },
        ],
        responses: {
          200: { description: 'Lista de categorias retornada com sucesso' },
        },
      },
    },
    '/categories/{id}': {
      put: {
        tags: ['Categorias'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID da categoria',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Supermercado' },
                  color: { type: 'string', example: '#059669' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Categoria atualizada' },
          404: { description: 'Categoria não encontrada' },
        },
      },
      delete: {
        tags: ['Categorias'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ID da categoria',
          },
        ],
        responses: {
          204: { description: 'Categoria excluída com sucesso' },
          404: { description: 'Categoria não encontrada' },
        },
      },
    },

    // Transações
    '/transactions': {
      post: {
        tags: ['Transações'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['description', 'amount', 'date', 'type'],
                properties: {
                  description: { type: 'string', example: 'Mercado do mês' },
                  amount: { type: 'number', example: 450.75 },
                  date: { type: 'string', format: 'date-time', example: '2026-08-14T10:00:00.000Z' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' },
                  categoryId: { type: 'string', example: 'id-da-categoria-uuid' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Transação criada com sucesso' },
          400: { description: 'Campos obrigatórios ausentes ou inválidos' },
        },
      },
      get: {
        tags: ['Transações'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'integer' }, description: 'Mês (1 a 12)' },
          { name: 'year', in: 'query', schema: { type: 'integer' }, description: 'Ano (ex: 2026)' },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Lista de transações retornada' },
        },
      },
    },
    '/transactions/summary': {
      get: {
        tags: ['Transações'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'integer' }, description: 'Mês (padrão é o atual)' },
          { name: 'year', in: 'query', schema: { type: 'integer' }, description: 'Ano (padrão é o atual)' },
        ],
        responses: {
          200: { description: 'Resumo financeiro calculado com sucesso' },
        },
      },
    },
    '/transactions/{id}': {
      put: {
        tags: ['Transações'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  description: { type: 'string' },
                  amount: { type: 'number' },
                  date: { type: 'string', format: 'date-time' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
                  categoryId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Transação atualizada' },
          404: { description: 'Transação não encontrada' },
        },
      },
      delete: {
        tags: ['Transações'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          204: { description: 'Transação excluída com sucesso' },
          404: { description: 'Transação não encontrada' },
        },
      },
    },
  },
};