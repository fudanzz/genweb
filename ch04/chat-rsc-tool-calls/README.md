# chat-rsc-tool-calls

A Next.js chat application demonstrating **AI SDK RSC (React Server Components)** with **tool calls** (function calling). The app acts as a weather assistant: when a user asks about the weather in a city, the AI invokes a `getWeather` tool and streams a rich React component back to the client.

This is chapter 4 of the *GenAI Web* book series.

---

## Architecture

```
src/
├── app/
│   ├── layout.js                  # Root layout
│   └── (chat)/
│       ├── layout.js              # Chat route layout
│       ├── page.js                # Client component — chat UI, provider/model selector
│       ├── actions.jsx            # Server Actions — AI state machine (createAI, streamUI)
│       └── utils.js               # Provider factory (OpenAI / Gemini)
├── components/
│   ├── Weather.jsx                # WeatherCard UI + mock fetchWeatherData + LoadingSpinner
│   ├── Navbar.jsx / Footer.jsx
│   ├── chat/
│   │   ├── ChatBubble.jsx         # Single message bubble (user or assistant)
│   │   ├── ChatBubbleLoading.jsx  # Animated loading indicator
│   │   └── ChatList.jsx           # Renders conversation history
│   └── ui/                        # Shadcn-style primitives (button, card, textarea, etc.)
├── hooks/
│   ├── use-enter-submit.js        # Submit on Enter key
│   ├── use-focus-on-slash-press.js
│   └── use-is-at-bottom.js
└── lib/utils.js                   # clsx/tailwind-merge helper
```

### Key data flow

1. **User** types a message and submits the form (`page.js`).
2. `continueConversation` Server Action is called (`actions.jsx`).
3. `streamUI` (Vercel AI SDK RSC) streams back either:
   - Plain text → rendered as a `<ChatBubble>` component, or
   - A **tool call** to `getWeather` → yields `<LoadingSpinner>`, then resolves to `<WeatherCard>`.
4. The returned `display` value (a React node) is stored in **UI state** via `useUIState` and rendered directly in `<ChatList>`.

The AI state (message history) lives server-side via `getMutableAIState` / `createAI`; the UI state (React nodes) lives client-side.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI orchestration | Vercel AI SDK 4 — `ai/rsc` (`streamUI`, `createAI`) |
| LLM providers | OpenAI (`@ai-sdk/openai`) · Google Gemini (`@ai-sdk/google`) · Azure OpenAI (`@ai-sdk/azure` + `@azure/identity`) |
| Tool/function calling | Zod schema validation via `z.object()` |
| UI | React 18, Tailwind CSS 3, Radix UI primitives |
| Icons | Lucide React |
| Formatting | Prettier |

---

## Supported Models

| Provider | Models |
|---|---|
| OpenAI | `gpt-3.5-turbo`, `gpt-4` |
| Google | `models/gemini-2.5-flash` |
| Azure OpenAI | `gpt-5.4` |

The provider and model are selectable at runtime via dropdown menus in the chat UI.

---

## Environment Variables

Create a `.env` file in this directory:

```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Azure OpenAI (uses Entra ID — no API key needed)
AZURE_RESOURCE_NAME=<your-resource-name>           # e.g. "my-openai" (not the full URL)
AZURE_OPENAI_API_VERSION=2024-12-01-preview        # optional, has default
```

For Azure, authenticate with `az login` (local dev). `DefaultAzureCredential` picks it up automatically.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and ask something like:
> "What's the weather in Tokyo?"

The assistant will invoke the `getWeather` tool and render a weather card inline in the conversation.

> **Note:** Weather data is mocked — `fetchWeatherData` returns random temperature (5–35°C) and condition values.
