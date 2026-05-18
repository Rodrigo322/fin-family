# Controle Familiar

App web de controle financeiro familiar com Next.js App Router, TypeScript, Prisma, PostgreSQL, Tailwind CSS, shadcn/ui, React Hook Form e Zod.

## Stack

- Next.js 16 com App Router
- TypeScript
- PostgreSQL via Prisma ORM
- Adapter PostgreSQL do Prisma para Neon, Supabase ou Postgres proprio
- Tailwind CSS v4 e shadcn/ui
- React Hook Form + Zod
- Autenticacao propria com e-mail, senha bcrypt e sessoes persistentes
- Recharts para relatorios

## Rotas

- `/login`
- `/register`
- `/dashboard`
- `/expenses`
- `/expenses/new`
- `/incomes`
- `/credit-cards`
- `/invoices`
- `/bills`
- `/upcoming`
- `/categories`
- `/family`
- `/reports`
- `/settings`

## Configuracao

Crie `.env` a partir de `.env.example`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_SECRET="troque-por-um-segredo-longo"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Depois rode:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Usuários do seed:

- `rodrigo@controle.local`
- `esposa@controle.local`
- senha: `controle123`

## Deploy na Vercel

Configure `DATABASE_URL` e `AUTH_SECRET` nas variaveis de ambiente do projeto na Vercel. O banco pode ser Neon, Supabase ou PostgreSQL proprio.
