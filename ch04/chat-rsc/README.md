# chat-rsc

A streaming AI chat application built with Next.js and the Vercel AI SDK, demonstrating the **React Server Components (RSC)** pattern for LLM streaming. Supports multiple LLM providers switchable at runtime.

## Architecture

The key architectural choice is using `ai/rsc` (Server Actions + streamable values) instead of a traditional REST API route:

```
Client Component (page.js)
  │
  │  calls server action directly (no fetch/API route)
  ▼
Server Action (actions.jsx)  ←── 'use server'
  │
  ├── Azure OpenAI  →  AzureOpenAI client (openai pkg) + Entra ID auth
  │                    streams via chat.completions.create({ stream: true })
  │
  └── OpenAI / Gemini  →  Vercel AI SDK streamText()
                           streams via createStreamableValue()
  │
  ▼
createStreamableValue()  →  serialized over network  →  readStreamableValue() on client
```

The client calls server functions as if they were local async functions — no REST endpoint is exposed. The stream is serialized across the server/client boundary using RSC primitives.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Runtime | React 18, Node.js |
| AI Orchestration | Vercel AI SDK v4 (`ai`, `ai/rsc`) |
| LLM — OpenAI | `@ai-sdk/openai` |
| LLM — Google Gemini | `@ai-sdk/google` |
| LLM — Azure OpenAI | `openai` SDK + `@azure/identity` (Entra ID) |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |

## Supported Providers & Models

| Provider | Model |
|---|---|
| OpenAI | `gpt-3.5-turbo`, `gpt-4` |
| Google AI | `gemini-2.5-flash` |
| Azure OpenAI | `gpt-5.4` |

Provider and model are switchable via dropdowns in the UI at runtime.

## Project Structure

```
src/
├── app/(chat)/
│   ├── actions.jsx     # Server Action — streams LLM responses (RSC core)
│   ├── page.js         # Chat UI — client component
│   ├── utils.js        # Provider/model resolution, client instantiation
│   └── layout.js
├── components/
│   ├── chat/           # ChatBubble, ChatList, loading skeleton
│   └── ui/             # shadcn primitives (button, textarea, dropdown, etc.)
└── hooks/
    ├── use-enter-submit.js         # Submit on Enter key
    ├── use-focus-on-slash-press.js # Focus input on / key
    └── use-is-at-bottom.js         # Scroll detection
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local` and fill in values:

```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Azure OpenAI (Entra ID auth — no API key needed)
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-5.4
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

### 3. Azure Entra ID authentication

Azure OpenAI uses `DefaultAzureCredential` — no API key required.

**Local development:**
```bash
az login
```

**Production:** attach a managed identity or service principal to your deployment. No code changes needed.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
