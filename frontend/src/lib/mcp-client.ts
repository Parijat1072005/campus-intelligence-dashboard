import type { MCPServerName, MCPCallResult } from "@/types";

const SERVER_URLS: Record<MCPServerName, string> = {
  library: process.env.NEXT_PUBLIC_LIBRARY_MCP_URL || "http://localhost:3001",
  cafeteria:
    process.env.NEXT_PUBLIC_CAFETERIA_MCP_URL || "http://localhost:3002",
  events: process.env.NEXT_PUBLIC_EVENTS_MCP_URL || "http://localhost:3003",
  academics:
    process.env.NEXT_PUBLIC_ACADEMICS_MCP_URL || "http://localhost:3004",
};

/**
 * Call a tool on an MCP server
 */
export async function callMCPTool(
  server: MCPServerName,
  tool: string,
  args: Record<string, unknown> = {}
): Promise<MCPCallResult> {
  const start = Date.now();
  try {
    const res = await fetch(`${SERVER_URLS[server]}/tools/${tool}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      server,
      tool,
      data: data.result ?? data,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      server,
      tool,
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      latencyMs: Date.now() - start,
    };
  }
}

/**
 * Ping a server to check if it's online
 */
export async function pingServer(
  server: MCPServerName
): Promise<{ online: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${SERVER_URLS[server]}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    return { online: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { online: false, latencyMs: Date.now() - start };
  }
}

/**
 * Get available tools from a server
 */
export async function getServerTools(server: MCPServerName) {
  try {
    const res = await fetch(`${SERVER_URLS[server]}/tools`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tools || [];
  } catch {
    return [];
  }
}
