# Deploy — Vercel (frontend) + Railway (backend) + Neon (banco)

O banco (Neon) já está configurado — a `DATABASE_URL` que está no `backend/.env` local
é a que você vai usar em produção também (a menos que prefira criar um projeto Neon
separado para produção, o que é uma boa prática mas opcional).

## 1. Backend na Railway

1. Crie uma conta em [railway.app](https://railway.app) (dá pra entrar com GitHub).
2. **New Project → Deploy from GitHub repo** → selecione `finance-hub`.
3. Nas configurações do serviço criado (**Settings**):
   - **Root Directory**: `backend`
   - **Build Command**: deixe em branco (o `railway.json` já define o `startCommand`;
     o build (`npm run build`) é detectado automaticamente pelo Nixpacks a partir do
     `package.json`).
4. Em **Variables**, adicione:
   - `DATABASE_URL` — a mesma URL do Neon que está no `backend/.env`
   - `JWT_SECRET` — gere um valor novo e forte pra produção (não reaproveite o de dev).
     Ex: `openssl rand -base64 32`
   - (não precisa setar `PORT` — a Railway injeta essa variável sozinha e o servidor já lê `process.env.PORT`)
5. Clique em **Deploy**. Acompanhe os logs — o `npm run start` roda `prisma migrate
   deploy` automaticamente antes de subir o servidor, então as migrations pendentes
   são aplicadas nesse momento.
6. Depois do deploy, a Railway gera uma URL pública (em **Settings → Networking →
   Generate Domain**, se não gerar automaticamente). Copie essa URL — você vai
   precisar dela no passo da Vercel.
7. Teste: `curl https://<sua-url-railway>/health` deve responder
   `{"status":"ok","message":"API está rodando!"}`.

## 2. Frontend na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) (dá pra entrar com GitHub).
2. **Add New → Project** → importe o repositório `finance-hub`.
3. Na tela de configuração do projeto:
   - **Root Directory**: `frontend` (clique em "Edit" ao lado do campo)
   - Framework preset: Vite (a Vercel deve detectar sozinha)
4. Em **Environment Variables**, adicione:
   - `VITE_API_URL` — a URL da Railway que você copiou no passo anterior (sem barra
     no final, ex: `https://finance-hub-production.up.railway.app`)
5. Clique em **Deploy**.
6. O `frontend/vercel.json` já está configurado para redirecionar todas as rotas
   pro `index.html` (necessário porque o app usa React Router do lado do cliente —
   sem isso, acessar `/transactions` direto pela URL daria 404).

## 3. Depois do primeiro deploy

- Teste o fluxo completo: acesse a URL da Vercel, cadastre uma conta, faça login,
  crie um lançamento.
- Todo push pra `main` (ou pra branch que você conectar em cada plataforma) dispara
  um novo deploy automático em ambas — não precisa fazer nada manual depois da
  configuração inicial.
- O workflow `.github/workflows/ci.yml` roda type-check, lint e build em todo PR/push
  pro `develop`/`main`, independente do deploy — é só uma checagem, não publica nada.

## Variáveis de ambiente — resumo

| Variável | Onde | Valor |
|---|---|---|
| `DATABASE_URL` | Railway | URL do Neon (mesma do `backend/.env`) |
| `JWT_SECRET` | Railway | Gere um novo, não reaproveite o de dev |
| `VITE_API_URL` | Vercel | URL pública gerada pela Railway |

## Observações

- O CORS do backend está aberto (`app.use(cors())`, sem restrição de origem). Funciona,
  mas se quiser travar pra só aceitar requisições do domínio da Vercel, isso é um
  ajuste rápido em `backend/src/server.ts` — me avise se quiser que eu faça.
- Se quiser conectar `main` (produção) e `develop` (staging) a ambientes separados
  na Railway/Vercel, ambas suportam múltiplos ambientes por branch — mas isso é uma
  configuração adicional na própria plataforma, não precisa de mudança no código.
