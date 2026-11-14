# Pharma Marketplace

Marketplace web que conecta clientes a farmácias locais, com busca de produtos e chat assistidos por IA (Google Gemini).

**Stack:** React · TypeScript · Vite · Google Gemini API · Vercel Functions

## Como a chave do Gemini fica protegida

O navegador nunca recebe a chave. O front-end chama duas rotas do próprio projeto, que rodam no servidor e falam com o Gemini usando a variável `GEMINI_API_KEY`:

| Rota | Uso |
| --- | --- |
| `POST /api/recommendations` | Recomenda produtos do catálogo com base nos sintomas digitados |
| `POST /api/pharmacist` | Respostas do chat "FarmaBot" |

```
navegador ──► /api/* (servidor, tem a chave) ──► Google Gemini
```

Se a chave não estiver configurada, as rotas respondem `503` e o app mostra respostas de exemplo.

## Executar localmente

**Pré-requisitos:** Node.js 18+

1. Instale as dependências:
   `npm install`
2. Copie `.env.example` para `.env.local` e preencha `GEMINI_API_KEY` com a sua chave do Google AI Studio. O `.env.local` é ignorado pelo Git.
3. Execute:
   `npm run dev`

O servidor de desenvolvimento do Vite atende as rotas `/api/*` com a mesma lógica usada em produção.

## Publicar na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new). O framework é detectado como **Vite**.
2. Em **Settings → Environment Variables**, crie `GEMINI_API_KEY` com a sua chave.
3. Faça o deploy. As funções em `api/` são publicadas automaticamente.

> Nunca coloque a chave no código, no README ou em commits.

## Estrutura

- `api/` – Vercel Functions (rotas `/api/*`)
- `server/` – lógica do Gemini e utilitários HTTP, usados só no servidor
- `services/geminiService.ts` – chamadas do front-end para as rotas `/api/*`
- `components/`, `context/`, `hooks/` – interface em React
