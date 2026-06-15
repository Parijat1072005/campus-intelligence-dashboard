import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, FunctionDeclaration, Tool, SchemaType } from "@google/generative-ai";
import { CAMPUS_TOOLS, parseToolName } from "@/lib/tools";
import type { MCPServerName } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MCP_SERVER_URLS: Record<MCPServerName, string> = {
  library:   process.env.NEXT_PUBLIC_LIBRARY_MCP_URL   || process.env.LIBRARY_MCP_URL   || "http://localhost:3001",
  cafeteria: process.env.NEXT_PUBLIC_CAFETERIA_MCP_URL || process.env.CAFETERIA_MCP_URL || "http://localhost:3002",
  events:    process.env.NEXT_PUBLIC_EVENTS_MCP_URL    || process.env.EVENTS_MCP_URL    || "http://localhost:3003",
  academics: process.env.NEXT_PUBLIC_ACADEMICS_MCP_URL || process.env.ACADEMICS_MCP_URL || "http://localhost:3004",
};

async function callMCPServer(
  server: MCPServerName,
  tool: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const url = `${MCP_SERVER_URLS[server]}/tools/${tool}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { error: `Server returned ${res.status}: ${res.statusText}` };
    return await res.json();
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to reach MCP server", server, tool };
  }
}

const SYSTEM_PROMPT = `You are CampusIQ, an intelligent AI assistant embedded in a unified campus dashboard. You help students navigate all campus systems — library, cafeteria, events, and academics — through a single conversation.

You have access to live MCP servers for each campus system:
- Library: Search books, check availability, library hours
- Cafeteria: Today's menu, current status, weekly meals
- Events: Campus events, workshops, fests, seminars
- Academics: Exam schedules, academic calendar, course info, policies

Personality: Friendly, efficient, campus-savvy. Use student-friendly language. Use emojis sparingly 📚🍽️📅🎓
Format: Present data cleanly. Mention which system data came from. If a server is unavailable, say so.
Search strategy: If a search returns 0 results, try a broader or related keyword before concluding nothing is available. For books, also try genre names like 'Science', 'Engineering'. Always use the tool results to form your answer — never say 'I couldn't get a response' if a tool call succeeded.

Today is ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Academic Year: 2025-26 | Semester: Even (Jan–May 2026)`;

// Convert our OpenAI-format tools to Gemini FunctionDeclaration format
function toGeminiTools(): Tool[] {
  const declarations: FunctionDeclaration[] = CAMPUS_TOOLS.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    parameters: {
      type: SchemaType.OBJECT,
      properties: Object.fromEntries(
        Object.entries(t.function.parameters.properties || {}).map(([k, v]) => {
          const prop = v as Record<string, unknown>;
          const geminiProp: Record<string, unknown> = { type: SchemaType[(String(prop.type || "STRING")).toUpperCase() as keyof typeof SchemaType] };
          if (prop.description) geminiProp.description = prop.description;
          if (prop.enum)        geminiProp.enum = prop.enum;
          return [k, geminiProp];
        })
      ),
      required: t.function.parameters.required || [],
    },
  }));
  return [{ functionDeclarations: declarations }];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Try models in order; fall back if a free-tier quota (429) is hit
    const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash-lite"];
    let modelUsed = MODELS[0];

    // Build Gemini chat history (all but last message).
    // Gemini requires history to start with a "user" turn, so we drop any
    // leading "model" (assistant) messages — e.g. the initial greeting.
    const rawHistory = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const firstUserIdx = rawHistory.findIndex((m) => m.role === "user");
    const history = firstUserIdx === -1 ? [] : rawHistory.slice(firstUserIdx);

    const toolCallLog: Array<{
      server: MCPServerName;
      tool: string;
      args: Record<string, unknown>;
      result: unknown;
      latencyMs: number;
    }> = [];

    /**
     * Sends a message with automatic 429 model fallback.
     * On quota error it upgrades `modelUsed` and retries with the next model.
     */
    async function sendWithFallback(
      payload: any,
      currentChat: any
    ) {
      // Try the current chat first
      try {
        return await currentChat.sendMessage(payload);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("429")) throw err;
      }
      // Fall back through remaining models
      const startIdx = MODELS.indexOf(modelUsed) + 1;
      for (let i = startIdx; i < MODELS.length; i++) {
        const modelName = MODELS[i];
        console.warn(`[AI Chat] 429 on ${modelUsed}, trying ${modelName}…`);
        try {
          const fallbackModel = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SYSTEM_PROMPT,
            tools: toGeminiTools(),
          });
          const fallbackChat = fallbackModel.startChat({ history });
          const res = await fallbackChat.sendMessage(payload as never);
          modelUsed = modelName;
          // Replace the chat reference used by the outer loop
          Object.assign(currentChat, fallbackChat);
          return res;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (!msg.includes("429") || i === MODELS.length - 1) throw err;
        }
      }
      throw new Error("All Gemini models quota exhausted.");
    }

    // Pick starting model and build chat
    let model = genAI.getGenerativeModel({
      model: modelUsed,
      systemInstruction: SYSTEM_PROMPT,
      tools: toGeminiTools(),
    });
    let chat = model.startChat({ history });

    // Send the first user message
    const lastMessage = messages[messages.length - 1].content;
    let response = await sendWithFallback(lastMessage as never, chat);
    console.log(`[AI Chat] Using model: ${modelUsed}`);

    let finalText = "";
    let iterations = 0;
    const MAX_ITERATIONS = 8;

    // Agentic loop — keep going while Gemini wants to call functions
    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const candidate = response.response.candidates?.[0];
      if (!candidate) break;

      const parts = candidate.content?.parts || [];
      const functionCallParts = parts.filter((p: any) => p.functionCall);
      const textParts = parts.filter((p: any) => p.text);

      // Accumulate text from every turn (final answer may come in any turn)
      if (textParts.length > 0) {
        const turnText = textParts.map((p: any) => p.text).join("");
        if (turnText.trim()) finalText = turnText; // keep the latest non-empty text
      }

      // No function calls — we're done
      if (functionCallParts.length === 0) break;

      // Execute each function call and collect results
      const functionResponses = [];
      for (const part of functionCallParts) {
        const fc = part.functionCall!;
        const { server, tool } = parseToolName(fc.name);
        const args = (fc.args || {}) as Record<string, unknown>;

        const start = Date.now();
        const result = await callMCPServer(server as MCPServerName, tool, args);
        const latencyMs = Date.now() - start;

        toolCallLog.push({ server: server as MCPServerName, tool, args, result, latencyMs });

        functionResponses.push({
          functionResponse: {
            name: fc.name,
            response: { result },
          },
        });
      }

      // Send all function results back to Gemini (with same fallback)
      response = await sendWithFallback(functionResponses as never, chat);
    }

    // If the model returned tool results but produced no final text, ask it to summarize
    if (!finalText && toolCallLog.length > 0) {
      try {
        const summaryReq = "Based on the tool results you just received, please give the user a clear, friendly summary answer.";
        const summaryResp = await sendWithFallback(summaryReq as never, chat);
        const summaryCandidate = summaryResp.response.candidates?.[0];
        const summaryText = (summaryCandidate?.content?.parts || [])
          .filter((p: { text?: string }) => p.text)
          .map((p: { text?: string }) => p.text)
          .join("");
        if (summaryText.trim()) finalText = summaryText;
      } catch {
        // If summarize also fails, build a plain-text fallback from raw results
        finalText = toolCallLog
          .map((tc) => `**${tc.server} › ${tc.tool}**: ${JSON.stringify(tc.result, null, 2)}`)
          .join("\n\n");
      }
    }

    return NextResponse.json({
      message: finalText || "I couldn't get a response. Please try again.",
      toolCalls: toolCallLog,
      serversUsed: [...new Set(toolCallLog.map((t) => t.server))] as MCPServerName[],
      modelUsed,
    });
  } catch (err) {
    console.error("[AI Chat Error]", err);
    return NextResponse.json(
      { error: "AI service error", detail: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
