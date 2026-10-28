# CentralFinanças

Plataforma de gestão financeira pessoal para controle intuitivo de entradas, saídas, reservas, lançamentos por categoria e divisão de contas com devedores.

🔗 **Demo:** (https://finance-hub-omega-green.vercel.app/)

---

## Funcionalidades

- Cadastro e login de usuários com autenticação via JWT
- Registro de entradas e saídas por categoria
- Controle de reservas financeiras
- Divisão de contas com devedores
- Dashboard com visão consolidada das finanças

## Tecnologias

### Frontend
- React + TypeScript
- Vite
- Material UI (MUI)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- JWT + bcryptjs para autenticação

### DevOps
- GitHub Actions (lint, type-check, build e testes automatizados a cada PR)


## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou uma instância no [Neon](https://neon.tech))

### 1. Clone o repositório
```bash
git clone https://github.com/EwertonG/finance-hub.git
cd finance-hub
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # configure DATABASE_URL e JWT_SECRET
npx prisma migrate dev
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env   # configure a URL da API (ex: VITE_API_URL)
npm run dev
```

## Testes

Os testes ficam em `backend/tests` e usam **Vitest** e **Supertest**:

- `tests/unit`: funções isoladas (divisão de valores, datas, validações), sem banco.
- `tests/integration`: a API completa contra um PostgreSQL de testes.

Para rodar localmente (precisa do Docker):

```bash
cd backend
npm run test:db     # sobe o banco de testes na porta 5433
npm test            # roda todos os testes uma vez
npm run test:watch  # roda de novo a cada arquivo salvo
```

Os testes apagam os dados do banco a cada caso e só aceitam rodar em um banco local (`localhost`), nunca no banco de produção. No GitHub, o CI roda os mesmos testes em todo push e pull request.

## 📄 Licença

Este projeto ainda não possui uma licença definida.
