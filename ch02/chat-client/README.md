# Chat Client

A multi-provider LLM chat application built with React and Express, supporting Google Gemini, OpenAI, and Azure OpenAI backends.

## Architecture

```
┌─────────────────────────────┐
│        React Frontend        │
│  (Vite dev server :5173)    │
│                              │
│  ChatPage → useChatForm     │
│           → getAssistant    │
│             Response()      │
└──────────────┬──────────────┘
               │ POST http://localhost:3000
               ▼
┌─────────────────────────────┐
│      Express API Server      │
│          (:3000)             │
│                              │
│  server.js         (Gemini)  │
│  server.openai.js  (OpenAI)  │
│  server.azure.js   (Azure)   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         LLM Provider         │
│  Google Gemini / OpenAI /   │
│  Azure OpenAI (Entra ID)    │
└─────────────────────────────┘
```

### Frontend (`src/`)

| Path | Purpose |
|------|---------|
| `pages/ChatPage.jsx` | Main chat page, composes all chat components |
| `components/chat/` | ChatList, ChatMessage, ChatBubbleLoading |
| `components/AutoScroll.jsx` | Auto-scrolls to latest message |
| `components/Navbar.jsx` | Top navigation bar |
| `hooks/use-chat-form-submit.js` | Manages messages state, loading, and submit |
| `hooks/use-enter-submit.js` | Submits form on Enter key |
| `hooks/use-focus-on-slash-press.js` | Focuses input on `/` key press |
| `lib/getAssistantResponse.js` | HTTP client — POSTs to Express server |
| `lib/generateUniqueId.js` | Generates IDs for user messages |
| `layout/AppLayout.jsx` | Wraps app in navbar + content area |

### Backend

Each provider is a self-contained Express server that accepts `POST /` with `{ text }` and returns `{ message: { id, created, role, content } }`.

| File | Provider | Auth |
|------|----------|------|
| `server.js` | Google Gemini (`gemini-1.5-flash`) | `GEMINI_API_KEY` |
| `server.openai.js` | OpenAI (`gpt-3.5-turbo`) | `OPENAI_API_KEY` |
| `server.azure.js` | Azure OpenAI | Entra ID (`DefaultAzureCredential`) |

## Tech Stack

**Frontend**
- [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Lucide React](https://lucide.dev/) for icons

**Backend**
- [Express](https://expressjs.com/) — HTTP server
- [Winston](https://github.com/winstonjs/winston) — structured logging
- [`@google/generative-ai`](https://www.npmjs.com/package/@google/generative-ai) — Gemini SDK
- [`openai`](https://www.npmjs.com/package/openai) v5 — OpenAI and Azure OpenAI SDK
- [`@azure/identity`](https://www.npmjs.com/package/@azure/identity) — Entra ID authentication

**Testing**
- [Vitest](https://vitest.dev/) — unit and e2e tests
- [Testing Library](https://testing-library.com/) — React component testing

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the required vars into `.env`:

```env
# OpenAI
OPENAI_API_KEY=your-key

# Azure OpenAI (Entra ID — no API key needed)
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
AZURE_OPENAI_API_VERSION=2024-12-01-preview

# Google Gemini
GEMINI_API_KEY=your-key
```

For Azure, the identity used must have the **Cognitive Services OpenAI User** role on the Azure OpenAI resource. `DefaultAzureCredential` will automatically use `az login`, managed identity, or service principal env vars.

### 3. Run

```bash
npm run dev            # Google Gemini
npm run dev:openai     # OpenAI
npm run start:azure    # Azure OpenAI
```

Frontend: http://localhost:5173
API server: http://localhost:3000

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with Gemini backend |
| `npm run dev:openai` | Start with OpenAI backend |
| `npm run start:azure` | Start with Azure OpenAI backend |
| `npm run build` | Build frontend for production |
| `npm run test:unit` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run format` | Format code with Prettier |
