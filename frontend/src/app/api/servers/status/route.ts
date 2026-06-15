import { NextResponse } from "next/server";
import type { MCPServerName } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET() {
  const SERVERS: Record<MCPServerName, string> = {
    library: process.env.NEXT_PUBLIC_LIBRARY_MCP_URL || process.env.LIBRARY_MCP_URL || "http://localhost:3001",
    cafeteria: process.env.NEXT_PUBLIC_CAFETERIA_MCP_URL || process.env.CAFETERIA_MCP_URL || "http://localhost:3002",
    events: process.env.NEXT_PUBLIC_EVENTS_MCP_URL || process.env.EVENTS_MCP_URL || "http://localhost:3003",
    academics: process.env.NEXT_PUBLIC_ACADEMICS_MCP_URL || process.env.ACADEMICS_MCP_URL || "http://localhost:3004",
  };

  const results = await Promise.allSettled(
    Object.entries(SERVERS).map(async ([name, url]) => {
      const start = Date.now();
      try {
        let cleanUrl = url.trim();
        if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
          cleanUrl = cleanUrl.slice(1, -1);
        }
        if (!cleanUrl.startsWith("http")) {
          cleanUrl = `https://${cleanUrl}`;
        }
        cleanUrl = cleanUrl.endsWith("/") ? cleanUrl.slice(0, -1) : cleanUrl;
        
        const res = await fetch(`${cleanUrl}/health`, {
          signal: AbortSignal.timeout(10000),
          cache: "no-store",
        });
        return {
          server: name as MCPServerName,
          online: res.ok,
          latencyMs: Date.now() - start,
          url: url,
        };
      } catch (err) {
        return {
          server: name as MCPServerName,
          online: false,
          latencyMs: Date.now() - start,
          url: url,
          error: String(err),
        };
      }
    })
  );

  const statuses = results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { server: "unknown", online: false, latencyMs: 0, url: "", error: "Promise rejected" }
  );

  console.log("[Status API] Checked servers:", SERVERS);
  console.log("[Status API] Results:", JSON.stringify(statuses, null, 2));

  return NextResponse.json({ statuses, checkedAt: new Date().toISOString() });
}
