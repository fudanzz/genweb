# chat-client-next

A Next.js chat client demonstrating three LLM provider backends: **Google Gemini** (default), **OpenAI GPT-3.5**, and **Azure OpenAI** (Entra ID auth).

## Architecture

```
Browser (React Client)
  └── useChatFormSubmit (hook)
        └── getAssistantResponse (fetch wrapper)
              ├── POST /api             → Gemini route      (src/app/(chat)/api/route.js)
              ├── POST /chat-openai/api → OpenAI route      (src/app/chat-openai/api/route.js)
              └── POST /chat-azure/api  → Azure OpenAI route (src/app/chat-azure/api/route.js)
                                                ↓
                                      External LLM API
```

**Request/Response flow:**
1. User submits a message in the chat UI
2. `useChatFormSubmit` appends the user message and POSTs `{ text }` to the local API route
3. The server route calls the LLM SDK and returns `{ message: { id, created, role, content } }`
4. The hook appends the assistant message; `ChatList` re-renders with the new bubble

**Three provider routes:**
- `src/app/(chat)/` — default route, uses Google Gemini (`gemini-2.5-flash`)
- `src/app/chat-openai/` — uses OpenAI (`gpt-3.5-turbo`)
- `src/app/chat-azure/` — uses Azure OpenAI with Entra ID (`DefaultAzureCredential`)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 18, Tailwind CSS, Radix UI, Lucide icons |
| LLM — Gemini | `@google/generative-ai` |
| LLM — OpenAI | `openai` SDK |
| LLM — Azure OpenAI | `openai` SDK (`AzureOpenAI`) + `@azure/identity` (`DefaultAzureCredential`) |
| Utilities | `clsx`, `tailwind-merge`, `uuid` |
| Dev | ESLint, Prettier, PostCSS, Autoprefixer |

## Project Structure

```
src/
├── app/
│   ├── (chat)/           # Default Gemini chat
│   │   ├── page.js
│   │   ├── layout.js
│   │   └── api/route.js  # Server: calls Gemini API
│   └── chat-openai/      # OpenAI chat
│       ├── page.js
│       ├── layout.js
│       └── api/route.js  # Server: calls OpenAI API
│   └── chat-azure/       # Azure OpenAI chat (Entra ID)
│       ├── page.js
│       ├── layout.js
│       └── api/route.js  # Server: calls Azure OpenAI via DefaultAzureCredential
├── components/
│   ├── chat/             # ChatList, ChatBubble, ChatBubbleLoading
│   └── ui/               # Textarea, Card (shadcn-style)
├── hooks/
│   ├── use-chat-form-submit.js   # Core message state & submit logic
│   ├── use-enter-submit.js       # Enter key to submit
│   ├── use-focus-on-slash-press.js
│   └── use-is-at-bottom.js      # Auto-scroll detection
└── lib/
    ├── getAssistantResponse.js   # fetch wrapper for API routes
    ├── generateUniqueId.js       # Local ID for user messages
    └── utils.js                  # cn() helper (clsx + twMerge)
```

## Setup

1. Copy `.env.example` and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=...
   # Azure OpenAI
   AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=<your-deployment>
   AZURE_OPENAI_API_VERSION=2024-12-01-preview
   ```

2. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

3. Open:
   - [http://localhost:3000](http://localhost:3000) — Gemini chat
   - [http://localhost:3000/chat-openai](http://localhost:3000/chat-openai) — OpenAI chat
   - [http://localhost:3000/chat-azure](http://localhost:3000/chat-azure) — Azure OpenAI chat

> **Azure auth:** `DefaultAzureCredential` tries multiple auth methods in order: environment variables, workload identity, managed identity, `az login`. For local dev, running `az login` is the easiest option. For CI/production, set `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, and `AZURE_CLIENT_SECRET` (service principal) or use managed identity.
