import { NextResponse } from "next/server";
import type { MCPServerName } from "@/types";

export const dynamic = 'force-dynamic';

const SERVERS: Record<MCPServerName, string> = {
  library: process.env.NEXT_PUBLIC_LIBRARY_MCP_URL || process.env.LIBRARY_MCP_URL || "http://localhost:3001",
  cafeteria: process.env.NEXT_PUBLIC_CAFETERIA_MCP_URL || process.env.CAFETERIA_MCP_URL || "http://localhost:3002",
  events: process.env.NEXT_PUBLIC_EVENTS_MCP_URL || process.env.EVENTS_MCP_URL || "http://localhost:3003",
  academics: process.env.NEXT_PUBLIC_ACADEMICS_MCP_URL || process.env.ACADEMICS_MCP_URL || "http://localhost:3004",
};

export async function GET() {
  const results = await Promise.allSettled(
    Object.entries(SERVERS).map(async ([name, url]) => {
      const start = Date.now();
      try {
        const res = await fetch(`${url}/health`, {
          signal: AbortSignal.timeout(10000),
        });
        return {
          server: name as MCPServerName,
          online: res.ok,
          latencyMs: Date.now() - start,
        };
      } catch {
        return {
          server: name as MCPServerName,
          online: false,
          latencyMs: Date.now() - start,
        };
      }
    })
  );

  const statuses = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { server: "unknown", online: false, latencyMs: 0 }
  );

  return NextResponse.json({ statuses, checkedAt: new Date().toISOString() });
}
