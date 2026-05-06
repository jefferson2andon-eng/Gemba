# 🗺 Gemba — Holding · Portfólio de Negócios

> Sistema executivo para validação e gestão de negócios com Canvas, Kanban 5W2H, Matriz de Decisão e Conselheiro IA.

## Stack
- **React + Vite** — frontend
- **Tailwind CSS** — estilização
- **Supabase** — banco de dados PostgreSQL + Auth
- **Claude API (Anthropic)** — análise estratégica com IA
- **@dnd-kit** — drag & drop no Kanban
- **Vite PWA Plugin** — instalável como app nativo

---

## 🚀 Setup Completo

### 1. Supabase
1. Acesse [supabase.com](https://supabase.com) → Novo projeto
2. Vá em **SQL Editor** → Cole e execute o arquivo `supabase-schema.sql`
3. Em **Settings > API**, copie `Project URL` e `anon public key`

### 2. Variáveis de Ambiente
```bash
cp .env.example .env.local
```
Preencha `.env.local`:
```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_ANTHROPIC_KEY=sua_chave_anthropic
```

### 3. Instalar e Rodar
```bash
npm install
npm run dev
```

---

## 📤 Deploy — GitHub + Vercel

### GitHub
```bash
git init
git add .
git commit -m "feat: Gemba v1.0"
gh repo create gemba --private --push --source=.
```

### Vercel
1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório `gemba`
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_KEY`
4. Clique **Deploy** ✅

---

## 📱 PWA — Instalar como App

### iOS (Safari)
1. Abra o site no Safari
2. Toque em **Compartilhar** → **Adicionar à Tela de Início**

### Android (Chrome)
1. Abra no Chrome
2. Toque em **⋮** → **Instalar app** ou **Adicionar à tela inicial**

---

## 🗂 Estrutura de Abas

| Aba | Função |
|-----|--------|
| Canvas | Business Model Canvas conectado ao Supabase |
| Plano de Ação | Kanban 5W2H com drag & drop |
| Matriz | Gráfico Esforço × Impacto automático |
| Comparativo | Dashboard global de todos os negócios |
| Conselheiro IA | Análise SWOT + recomendação estratégica |

---

## 🔐 Autenticação
- Login com e-mail e senha via Supabase Auth
- RLS (Row Level Security) ativo — cada usuário vê só seus dados
- 3 usuários: convide via Supabase **Authentication > Users > Invite**
