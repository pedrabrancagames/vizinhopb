# Vizinho PB 🏘️

Plataforma de empréstimo de objetos entre vizinhos.

## Setup do Projeto

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zqouxpgzpgzjycidgiqi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxb3V4cGd6cGd6anljaWRnaXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTEyODAsImV4cCI6MjA4MTEyNzI4MH0.DhZ59PIWAGhcxfS3EiXLh_npbMYjAa_0aq-JkTB-hGc
```

### 2. Banco de Dados

Execute o script SQL no Supabase:
1. Acesse o [Dashboard do Supabase](https://zqouxpgzpgzjycidgiqi.supabase.co)
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `supabase/schema.sql`
4. Execute o script

### 3. Executar

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## Estrutura do Projeto

```
src/
├── app/
│   ├── (main)/          # Páginas principais
│   │   └── page.tsx     # Home
│   ├── globals.css      # CSS global
│   └── layout.tsx       # Layout raiz
├── components/
│   ├── layout/          # Header, Menu, Tabs
│   ├── map/             # Mapa de vizinhos
│   └── requests/        # Cards de pedidos
├── lib/
│   ├── supabase/        # Cliente Supabase
│   ├── constants.ts     # Constantes
│   └── utils.ts         # Utilitários
└── types/
    └── database.ts      # Tipos do banco
```

## Tech Stack

- **Next.js 14+** - Framework React
- **Tailwind CSS** - Styling
- **Supabase** - Backend (Auth, Database, Storage)
- **Leaflet** - Mapas
- **Zustand** - Estado
- **React Query** - Data fetching
