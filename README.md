# CentralFinanças

Plataforma de gestão financeira pessoal para controle de entradas e saídas por categoria, parcelamentos, assinaturas, fatura do cartão de crédito, divisão de contas com devedores e metas de economia.

🔗 **Demo:** [finance-hub-omega-green.vercel.app](https://finance-hub-omega-green.vercel.app/)

---

## Funcionalidades

- Cadastro, login e recuperação de senha por e-mail
- Lançamentos de receitas e despesas com categoria e forma de pagamento, busca e filtros
- Compras parceladas, com as parcelas geradas automaticamente
- Assinaturas mensais, com cobrança automática, pausa, reativação e edição
- Fatura do cartão de crédito calculada pelos dias de fechamento e vencimento
- Divisão de contas com devedores e acompanhamento de quem já pagou
- Metas de economia com depósitos e resgates
- Orçamento mensal por categoria
- Dashboard com resumo do mês, evolução anual, gastos por categoria e por forma de pagamento
- Desfazer exclusões e tema claro/escuro

## Tecnologias

### Frontend
- React + TypeScript
- Vite
- Material UI (MUI)
- TanStack Query

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Zod para validação das requisições
- JWT + bcryptjs para autenticação
- Brevo para envio de e-mails

### DevOps
- GitHub Actions: lint, type-check, build e testes automatizados em todo PR
- Deploy do backend no Render, disparado pelo CI só depois que os testes passam
- Frontend publicado na Vercel

## Como rodar localmente

### Pré-requisitos
- Node.js 20.19+ (ou 22.12+)
- PostgreSQL (ou uma instância no [Neon](https://neon.tech))
- Docker (apenas para rodar os testes do backend)

### 1. Clone o repositório
```bash
git clone https://github.com/EwertonG/finance-hub.git
cd finance-hub
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # configure as variáveis (veja abaixo)
npx prisma migrate deploy
npm run dev
```

| Variável | Para que serve |
|---|---|
| `DATABASE_URL` | Conexão com o PostgreSQL. Use um banco de desenvolvimento, nunca o de produção |
| `JWT_SECRET` | Segredo dos tokens de login, com pelo menos 32 caracteres |
| `CORS_ORIGINS` | Endereços do frontend autorizados a chamar a API, separados por vírgula |
| `API_DOCS_ENABLED` | `true` para liberar a documentação Swagger em `/api-docs` |
| `BREVO_API_KEY` e `EMAIL_FROM` | Envio de e-mails. Sem elas, o e-mail aparece no terminal |

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL aponta para a API
npm run dev
```

Com tudo instalado, `npm start` na raiz do projeto sobe o backend e o frontend juntos.

## Testes

Backend (`backend/tests`), com **Vitest** e **Supertest**:

- `tests/unit`: funções isoladas (divisão de valores, datas, fatura do cartão, validações), sem banco.
- `tests/integration`: a API completa contra um PostgreSQL de testes.

```bash
cd backend
npm run test:db     # sobe o banco de testes no Docker, na porta 5433
npm test            # roda todos os testes uma vez
npm run test:watch  # roda de novo a cada arquivo salvo
```

Os testes apagam os dados do banco a cada caso e só aceitam rodar em um banco local (`localhost`), nunca no banco de produção.

Frontend, também com **Vitest**:

```bash
cd frontend
npm test
```

No GitHub, o CI roda os testes do backend e do frontend em todo push e pull request.

## 📄 Licença

Este projeto ainda não possui uma licença definida.
