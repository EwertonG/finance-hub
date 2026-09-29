# CentralFinanças

Plataforma de gestão financeira pessoal para controle intuitivo de entradas, saídas, reservas, lançamentos por categoria e divisão de contas com devedores.

🔗 **Demo:** [finance-hub-ewerton4.vercel.app](https://finance-hub-ewerton4.vercel.app/login)

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
- GitHub Actions (lint, type-check e build automatizados a cada PR)


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

## 📄 Licença

Este projeto ainda não possui uma licença definida.
