# CentralFinanças

Plataforma de gestão financeira pessoal desenvolvida para controle intuitivo de entradas, saídas, reservas e lançamentos por categoria.

## Tecnologias

### Frontend

- **React** com **TypeScript**
- **Vite**
- **Material UI (MUI)**

### Backend

- **Node.js**
- **PostgreSQL**

## Testes

Os testes ficam em `backend/tests` e usam **Vitest** e **Supertest**:

- `tests/unit`: funções isoladas (divisão de valores, datas, validações), sem banco.
- `tests/integration`: a API completa contra um PostgreSQL de testes.

Para rodar localmente (precisa do Docker):

```bash
cd backend
npm run test:db   # sobe o banco de testes na porta 5433
npm test          # roda todos os testes uma vez
npm run test:watch  # roda de novo a cada arquivo salvo
```

Os testes apagam os dados do banco a cada caso e só aceitam rodar em um banco local (`localhost`), nunca no banco de produção. No GitHub, o CI roda os mesmos testes em todo push e pull request.

