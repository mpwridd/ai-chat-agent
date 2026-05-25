# AI Chat Agent 🤖

Full-featured AI chat application powered by **Mimo v2.5 Pro** (Xiaomi).

## Features

- 💬 **Real-time Streaming** — SSE streaming responses, word-by-word
- 🎭 **4 Chat Modes** — General, Coding, Writing, Analysis
- 📝 **Markdown Rendering** — Full markdown with syntax highlighting
- 💻 **Code Highlighting** — One-click copy code blocks
- 💾 **Chat History** — Local state management with Zustand
- 🏷️ **Auto Title** — AI-generated chat titles
- 📱 **Responsive** — Beautiful on desktop and mobile
- 🎨 **Dark Theme** — Sleek dark UI with Tailwind CSS

## Tech Stack

- **Next.js 14** (App Router, API Routes)
- **TypeScript** + **Tailwind CSS**
- **Zustand** (state management)
- **React Markdown** + **Remark GFM** + **Rehype Highlight**
- **Lucide React** (icons)
- **Mimo v2.5 Pro** (AI model via Xiaomi API)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
MIMO_API_KEY=your-api-key
MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1
MIMO_MODEL=mimo-v2-omni
```

## Architecture

```
src/
├── app/
│   ├── api/chat/route.ts     # Streaming chat API (SSE)
│   ├── api/title/route.ts    # Auto-generate chat title
│   ├── page.tsx              # Main page
│   └── globals.css           # Global styles
├── components/
│   ├── ChatApp.tsx           # Main app container
│   ├── ChatMessages.tsx      # Message list + markdown
│   ├── ChatInput.tsx         # Input with auto-resize
│   └── Sidebar.tsx           # Chat history + mode selector
└── lib/
    ├── store.ts              # Zustand store
    └── utils.ts              # Formatting helpers
```

## License

MIT
