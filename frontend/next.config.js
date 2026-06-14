/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_PUBLIC_* vars are for client-side; LIBRARY_MCP_URL etc. are server-only
  // (used only in the API route, never sent to the browser)
  serverRuntimeConfig: {
    geminiApiKey:  process.env.GEMINI_API_KEY,
    libraryUrl:    process.env.LIBRARY_MCP_URL   || "http://localhost:3001",
    cafeteriaUrl:  process.env.CAFETERIA_MCP_URL || "http://localhost:3002",
    eventsUrl:     process.env.EVENTS_MCP_URL    || "http://localhost:3003",
    academicsUrl:  process.env.ACADEMICS_MCP_URL || "http://localhost:3004",
  },
  // NEXT_PUBLIC_* vars go to the browser (needed by the admin panel to talk to MCP)
  env: {
    NEXT_PUBLIC_LIBRARY_MCP_URL:   process.env.NEXT_PUBLIC_LIBRARY_MCP_URL   || process.env.LIBRARY_MCP_URL   || "http://localhost:3001",
    NEXT_PUBLIC_CAFETERIA_MCP_URL: process.env.NEXT_PUBLIC_CAFETERIA_MCP_URL || process.env.CAFETERIA_MCP_URL || "http://localhost:3002",
    NEXT_PUBLIC_EVENTS_MCP_URL:    process.env.NEXT_PUBLIC_EVENTS_MCP_URL    || process.env.EVENTS_MCP_URL    || "http://localhost:3003",
    NEXT_PUBLIC_ACADEMICS_MCP_URL: process.env.NEXT_PUBLIC_ACADEMICS_MCP_URL || process.env.ACADEMICS_MCP_URL || "http://localhost:3004",
  },
};

module.exports = nextConfig;
