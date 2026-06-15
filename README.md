# [Link to website](https://campus-intelligence-dashboard-front.vercel.app/)

# CampusIQ — Unified Campus Intelligence Dashboard



## The Problem
College campuses have data scattered everywhere: library portal, cafeteria PDFs, Google Calendars for events, and 200-page academic handbooks. Students waste time digging through 5 different systems.

## The Solution
**CampusIQ** is a unified dashboard with an embedded AI assistant backed by **independent MCP (Model Context Protocol) servers** — one per campus system. The AI dynamically queries whichever server(s) it needs to answer your question in real time.

---

## Features
- **AI Chat (Gemini-powered, FREE)** — Natural-language queries routed to the right campus server(s) automatically
- **Library** — Search books, live availability, copy counts, shelf location, weekly hours
- **Cafeteria** — Full menu by meal, live open/closed status, crowd level + wait time
- **Events** — Upcoming events with category filters, featured fests, registration links
- **Academics** — Exam countdown, academic calendar, course syllabi, policy lookups
- **MCP Architecture** — 4 independent Express servers; AI routes queries intelligently
- **Tool Transparency** — Chat shows exactly which MCP tools fired to answer each query
- **Server Health Panel** — Live status + latency for all 4 MCP servers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| AI | **Gemini** via GEMINI API (free tier, OpenAI-compatible) |
| MCP Servers | Node.js + Express + TypeScript (4 servers) |
| Icons | Lucide React |
| Hosting | Vercel (frontend) + Render (MCP servers) |

---

## Project Structure

```
campus-intelligence-dashboard/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                  # Dashboard shell
│   │   │   ├── layout.tsx                # Root layout + Google fonts
│   │   │   ├── globals.css               # Tailwind + custom classes
│   │   │   └── api/
│   │   │       ├── chat/route.ts         # Gemini agentic loop + MCP routing
│   │   │       └── servers/status/       # MCP health check endpoint
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── DashboardHome.tsx
│   │   │   │   ├── LibraryPanel.tsx
│   │   │   │   ├── CafeteriaPanel.tsx
│   │   │   │   ├── EventsPanel.tsx
│   │   │   │   └── AcademicsPanel.tsx
│   │   │   └── chat/
│   │   │       └── ChatSidebar.tsx       # AI assistant UI
│   │   ├── lib/
│   │   │   ├── mcp-client.ts             # Browser-side MCP caller
│   │   │   └── tools.ts                  # OpenAI-format tool definitions
│   │   └── types/index.ts
│   ├── .env.example
│   └── package.json
│
├── mcp-servers/
│   ├── library/src/index.ts              # port 3001
│   ├── cafeteria/src/index.ts            # port 3002
│   ├── events/src/index.ts               # port 3003
│   └── academics/src/index.ts            # port 3004
│
├── start-dev.sh                          # One-command local startup
└── README.md
```

---

## ─── SETUP GUIDE ────────────────────────────────────────────────────────────

### Step 1 — Get your FREE Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with any Google account
3. Click "Create API Key" → select any project
4. Copy the key 

---

### Step 2 — Install Node.js (if not already installed)

Download from **https://nodejs.org** → install the LTS version.

Verify: open a terminal and run:
```bash
node --version   # should show v20 or higher
npm --version    # should show v9 or higher
```

---

### Step 3 — Get the project

**Option A — Clone from GitHub (after you push)**
```bash
git clone https://github.com/Parijat1072005/campus-intelligence-dashboard.git
cd campus-intelligence-dashboard
```

**Option B — Unzip the downloaded file**
```bash
# Unzip campus-intelligence-dashboard.zip
# Then open the folder in VS Code
```

---

### Step 4 — Install dependencies

Open a terminal in VS Code (`Ctrl + backtick`) and run:

```bash
# Frontend
cd frontend
npm install
cd ..

# Library MCP
cd mcp-servers/library
npm install
cd ../..

# Cafeteria MCP
cd mcp-servers/cafeteria
npm install
cd ../..

# Events MCP
cd mcp-servers/events
npm install
cd ../..

# Academics MCP
cd mcp-servers/academics
npm install
cd ../..
```

---

### Step 5 — Add your API key

```bash
cd frontend
copy frontend\.env.example frontend\.env.local
```

Open `frontend/.env.local` in VS Code and replace `gemini-xxxxxxxxx` with your real key:
```
GEMINI_API_KEY=gemini-xxxxxxxxxx
```

---

### Step 6 — Run locally (5 terminals in VS Code)

Open 5 terminal tabs in VS Code (`+` button in the terminal panel):

**Terminal 1:**
```bash
cd mcp-servers/library && npm run dev
# → 📚 Library MCP Server running on http://localhost:3001
```

**Terminal 2:**
```bash
cd mcp-servers/cafeteria && npm run dev
# → 🍽️  Cafeteria MCP Server running on http://localhost:3002
```

**Terminal 3:**
```bash
cd mcp-servers/events && npm run dev
# → 📅 Events MCP Server running on http://localhost:3003
```

**Terminal 4:**
```bash
cd mcp-servers/academics && npm run dev
# → 🎓 Academics MCP Server running on http://localhost:3004
```

**Terminal 5:**
```bash
cd frontend && npm run dev
# → Next.js ready on http://localhost:3000
```

**OR** use the one-command script:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

Open **http://localhost:3000** in your browser — you should see the CampusIQ dashboard!

---

## ─── DEPLOYMENT GUIDE ───────────────────────────────────────────────────────

### Part A — Deploy MCP Servers to Render (free)

Render gives you **free hosting** for Node.js servers.

#### 1. Push your project to GitHub first

```bash
git init
git add .
git commit -m "Initial commit — CampusIQ"
git branch -M main
git remote add origin https://github.com/Parijat1072005/campus-intelligence-dashboard.git
git push -u origin main
```

#### 2. Deploy Library MCP

1. Go to **https://render.com** → Sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Fill in the form:
   - **Name:** `campus-library-mcp`
   - **Root Directory:** `mcp-servers/library`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **"Create Web Service"**
6. Wait ~3 minutes → copy the URL (e.g. `https://campus-library-mcp.onrender.com`)

#### 3. Repeat for the other 3 servers

| Service Name | Root Directory |
|---|---|
| `campus-cafeteria-mcp` | `mcp-servers/cafeteria` |
| `campus-events-mcp` | `mcp-servers/events` |
| `campus-academics-mcp` | `mcp-servers/academics` |

You'll have 4 URLs when done.

---

### Part B — Deploy Frontend to Vercel (free)

#### 1. Go to https://vercel.com → Sign up with GitHub (free)

#### 2. Click "Add New Project" → Import your GitHub repo

#### 3. Configure the project:
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `frontend`

#### 4. Add Environment Variables

In the Vercel project settings → **Environment Variables**, add all of these:

| Key | Value |
|---|---|
| `GEMINI_API_KEY` | `your-actual-key` |
| `LIBRARY_MCP_URL` | `https://campus-library-mcp.onrender.com` |
| `CAFETERIA_MCP_URL` | `https://campus-cafeteria-mcp.onrender.com` |
| `EVENTS_MCP_URL` | `https://campus-events-mcp.onrender.com` |
| `ACADEMICS_MCP_URL` | `https://campus-academics-mcp.onrender.com` |
| `NEXT_PUBLIC_LIBRARY_MCP_URL` | `https://campus-library-mcp.onrender.com` |
| `NEXT_PUBLIC_CAFETERIA_MCP_URL` | `https://campus-cafeteria-mcp.onrender.com` |
| `NEXT_PUBLIC_EVENTS_MCP_URL` | `https://campus-events-mcp.onrender.com` |
| `NEXT_PUBLIC_ACADEMICS_MCP_URL` | `https://campus-academics-mcp.onrender.com` |

#### 5. Click "Deploy"

Vercel builds and deploys in ~2 minutes. You'll get a live URL like:
**`https://campus-intelligence-dashboard.vercel.app`**

---

## ─── IMPORTANT NOTES ────────────────────────────────────────────────────────

### Render free tier cold starts
Render free services spin down after 15 minutes of inactivity. The first request after idle takes ~30 seconds. This is normal — it warms up and works fine after.

**Fix:** Use [UptimeRobot](https://uptimerobot.com) (free) to ping each MCP server URL every 10 minutes to keep them warm if using free tier of Render.

### Vercel + Render CORS
All MCP servers already have CORS enabled (`cors()` middleware). No extra config needed.

---

## Sample queries to try in the AI chat

- *"What machine learning books are available right now?"*
- *"Is the cafeteria open? What's for lunch today?"*
- *"Show me all workshops happening this week"*
- *"When is my Data Structures mid-term?"*
- *"What's the attendance policy?"*
- *"I have an OS exam tomorrow — what topics does it cover and what's for dinner tonight?"*

---

## License
MIT
