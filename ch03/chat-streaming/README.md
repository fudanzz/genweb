# Chat Streaming (ch03)

A real-time AI chat application demonstrating streaming responses with multi-provider LLM support.

## Architecture

```
src/
├── app/
│   ├── (chat)/
│   │   ├── page.js          # Chat UI — provider/model selector, message input
│   │   ├── layout.js        # Chat route layout
│   │   └── api/
│   │       ├── route.js     # POST /api — streams LLM response via Vercel AI SDK
│   │       └── utils.js     # Provider factory (OpenAI / Gemini / Azure OpenAI)
│   └── layout.js            # Root layout
├── components/
│   ├── chat/
│   │   ├── ChatList.jsx     # Renders message history
│   │   ├── ChatBubble.jsx   # Individual message bubble
│   │   └── ChatBubbleLoading.jsx  # Streaming indicator
│   ├── ui/                  # shadcn/ui primitives (button, card, textarea, etc.)
│   ├── AutoScroll.jsx
│   ├── Navbar.jsx
│   └── Footer.jsx
├── hooks/
│   ├── use-enter-submit.js       # Submit on Enter key
│   ├── use-focus-on-slash-press.js
│   └── use-is-at-bottom.js
└── lib/
    ├── getAssistantResponse.js   # Fetch helper (legacy, unused in current flow)
    ├── generateUniqueId.js
    └── utils.js                  # cn() class merge helper
```

**Data flow:**
1. User types a message → `useChat` hook (Vercel AI SDK) POSTs to `/api`
2. API route calls the selected LLM via `streamText`, returns a streaming `Response`
3. `useChat` consumes the stream and appends tokens to the `messages` array in real time
4. `ChatList` renders the growing message list as tokens arrive

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript (JSX) |
| AI SDK | [Vercel AI SDK](https://sdk.vercel.ai) (`ai` v4) |
| LLM Providers | Google Gemini (`@ai-sdk/google`), OpenAI (`@ai-sdk/openai`), Azure OpenAI (`openai` SDK) |
| Azure Auth | Entra ID via `DefaultAzureCredential` (`@azure/identity`) — no API key required |
| Default Model | `gemini-2.5-flash` |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env.local`:
   ```bash
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key

   # Azure OpenAI (Entra ID — no API key needed)
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   AZURE_OPENAI_API_VERSION=2024-12-01-preview
   ```

3. For Azure OpenAI, authenticate via Entra ID:
   ```bash
   # Local dev
   az login

   # Production: use managed identity or service principal (picked up automatically)
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Supported Providers & Models

| Provider | Models |
|---|---|
| Google AI | `gemini-2.5-flash` |
| OpenAI | `gpt-3.5-turbo`, `gpt-4` |
| Azure OpenAI | `gpt-5.4` (Entra ID auth, no API key) |

The provider and model can be switched at runtime via the dropdowns in the chat UI.
