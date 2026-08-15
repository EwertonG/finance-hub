export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FinanceHub API',
    version: '1.0.0',
    description: 'Documentação e ambiente de testes interativo da API do FinanceHub',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Servidor Local de Desenvolvimento',
    },
  ],
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
        summary: 'Verifica o status da API',
        responses: { 200: { description: 'API operando normalmente' } },
      },
    },

    // Auth
    '/auth/register': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastro de novo usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Ewerton Gomes' },
                  email: { type: 'string', example: 'ewerton@teste.com' },
                  password: { type: 'string', example: 'senha123456' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Usuário cadastrado com sucesso' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autenticação de usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'ewerton@teste.com' },
                  password: { type: 'string', example: 'senha123456' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Login realizado com sucesso' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Obter dados do usuário logado',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Perfil retornado com sucesso' } },
      },
    },

    // Categorias
    '/categories': {
      post: {
        tags: ['Categorias'],
        summary: 'Criar uma nova categoria',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'type'],
                properties: {
                  name: { type: 'string', example: 'Lazer / Bar' },
                  color: { type: 'string', example: '#10B981' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Categoria criada' } },
      },
      get: {
        tags: ['Categorias'],
        summary: 'Listar categorias do usuário',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Lista de categorias' } },
      },
    },
    '/categories/{id}': {
      put: {
        tags: ['Categorias'],
        summary: 'Atualizar uma categoria',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Categoria atualizada' } },
      },
      delete: {
        tags: ['Categorias'],
        summary: 'Deletar uma categoria',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Categoria excluída' } },
      },
    },

    // Transações
    '/transactions': {
      post: {
        tags: ['Transações'],
        summary: 'Criar uma nova transação/lançamento',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['description', 'amount', 'date', 'type'],
                properties: {
                  description: { type: 'string', example: 'Mercado' },
                  amount: { type: 'number', example: 150.0 },
                  date: { type: 'string', format: 'date-time', example: '2026-08-14T12:00:00.000Z' },
                  type: { type: 'string', enum: ['INCOME', 'EXPENSE'], example: 'EXPENSE' },
                  categoryId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Transação criada' } },
      },
      get: {
        tags: ['Transações'],
        summary: 'Listar transações com filtros',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'month', in: 'query', schema: { type: 'integer' } },
          { name: 'year', in: 'query', schema: { type: 'integer' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
        ],
        responses: { 200: { description: 'Lista de transações' } },
      },
    },
    '/transactions/summary': {
      get: {
        tags: ['Transações'],
        summary: 'Resumo mensal de receitas, despesas e saldo líquido',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Resumo financeiro calculado' } },
      },
    },
    '/transactions/{id}': {
      put: {
        tags: ['Transações'],
        summary: 'Atualizar transação',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Transação atualizada' } },
      },
      delete: {
        tags: ['Transações'],
        summary: 'Deletar transação',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Transação excluída' } },
      },
    },

    // Devedores
    '/debtors': {
      post: {
        tags: ['Devedores & Divisão'],
        summary: 'Cadastrar nova cobrança ou despesa dividida',
        description: 'Calcula a divisão automática entre você e os amigos informados, gerando as cobranças e o lançamento da sua parte.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['item', 'totalAmount', 'people'],
                properties: {
                  item: { type: 'string', example: 'Cerveja no bar' },
                  totalAmount: { type: 'number', example: 20.0 },
                  people: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Fulano'],
                  },
                  mySplit: {
                    type: 'boolean',
                    default: true,
                    description: 'True se você participou do gasto (divide entre você e eles). False se for empréstimo.',
                  },
                  categoryId: { type: 'string', description: 'ID da categoria para a sua despesa pessoal' },
                  date: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Cobrança(s) e lançamento pessoal criados com sucesso' },
        },
      },
      get: {
        tags: ['Devedores & Divisão'],
        summary: 'Listar devedores e cobranças',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['PENDING', 'CHARGED', 'PAID'] },
            description: 'Filtrar por status: PENDING (Pendente), CHARGED (Cobrado) ou PAID (Pago)',
          },
        ],
        responses: { 200: { description: 'Lista de cobranças retornada' } },
      },
    },
    '/debtors/summary': {
      get: {
        tags: ['Devedores & Divisão'],
        summary: 'Resumo total a receber (Pendente + Cobrado) e total já liquidado',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Resumo de valores a receber' } },
      },
    },
    '/debtors/{id}': {
      put: {
        tags: ['Devedores & Divisão'],
        summary: 'Atualizar cobrança ou alternar status (ex: marcar como CHARGED ou PAID)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  personName: { type: 'string' },
                  item: { type: 'string' },
                  amount: { type: 'number' },
                  status: { type: 'string', enum: ['PENDING', 'CHARGED', 'PAID'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Cobrança atualizada' } },
      },
      delete: {
        tags: ['Devedores & Divisão'],
        summary: 'Deletar cobrança',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Cobrança excluída' } },
      },
    },
  },
};