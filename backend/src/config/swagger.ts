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
        description: 'Insira o token JWT retornado no login/registro para autenticar as rotas protegidas.',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health Check'],
        summary: 'Verifica o status da API',
        responses: {
          200: {
            description: 'API operando normalmente',
          },
        },
      },
    },
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
                  name: { type: 'string', example: '' },
                  email: { type: 'string', example: '' },
                  password: { type: 'string', example: '' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário cadastrado com sucesso e token gerado' },
          400: { description: 'Campos inválidos ou e-mail já existente' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autenticação e login de usuário',
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
        responses: {
          200: { description: 'Login bem-sucedido com retorno do token JWT' },
          400: { description: 'Credenciais inválidas' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Autenticação'],
        summary: 'Obter dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dados do perfil retornado com sucesso' },
          401: { description: 'Não autorizado / Token inválido' },
        },
      },
    },
  },
};