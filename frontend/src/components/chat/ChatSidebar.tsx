"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  User,
  BookOpen,
  Coffee,
  Calendar,
  GraduationCap,
  Loader2,
  ChevronDown,
  Sparkles,
  Wifi,
  AlertCircle,
} from "lucide-react";
import type { ChatMessage, MCPServerName, ToolCall } from "@/types";
import { clsx } from "clsx";
import type { ActiveView } from "@/app/page";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ActiveView) => void;
}

const SERVER_ICONS: Record<MCPServerName, React.ElementType> = {
  library: BookOpen,
  cafeteria: Coffee,
  events: Calendar,
  academics: GraduationCap,
};

const SERVER_COLORS: Record<MCPServerName, string> = {
  library: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
  cafeteria: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  events: "text-teal-400 bg-teal-500/20 border-teal-500/30",
  academics: "text-rose-400 bg-rose-500/20 border-rose-500/30",
};

const QUICK_PROMPTS = [
  "What books are available on data structures?",
  "What's for lunch today?",
  "Any workshops this week?",
  "When is the next mid-term exam?",
];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function ChatSidebar({ isOpen, onClose, onNavigate }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: "assistant",
      content:
        "Hey! I'm **CampusIQ** — your unified campus AI. I can search the library, check today's cafeteria menu, find events, pull your exam schedule, and answer academic policy questions — all in one place.\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!isLoading) scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) textareaRef.current?.focus();
  }, [isOpen]);

  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!atBottom);
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    textareaRef.current?.focus();

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const errJson = await res.json();
          detail = errJson.detail || errJson.error || detail;
        } catch { /* ignore */ }
        throw new Error(detail);
      }

      const data = await res.json();

      const toolCalls: ToolCall[] = (data.toolCalls ?? []).map(
        (tc: {
          server: MCPServerName;
          tool: string;
          args: Record<string, unknown>;
          result: unknown;
          latencyMs: number;
        }) => ({
          id: generateId(),
          server: tc.server,
          tool: tc.tool,
          args: tc.args,
          result: tc.result,
          status: "success" as const,
          latencyMs: tc.latencyMs,
        })
      );

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: data.message || "I couldn't get a response. Please try again.",
        timestamp: new Date(),
        toolCalls,
        sources: data.serversUsed,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === "TimeoutError";
      const detail = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: isTimeout
            ? "⏱️ The request timed out. The campus servers may be slow — please try again."
            : `⚠️ ${detail.length > 200 ? detail.slice(0, 200) + "…" : detail}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        content: "Chat cleared. How can I help you?",
        timestamp: new Date(),
      },
    ]);
  }

  if (!isOpen) return null;

  return (
    <aside className="w-96 flex flex-col border-l border-campus-border bg-campus-surface shrink-0 animate-slide-up">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-campus-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-campus-accent to-campus-indigo flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-display font-semibold text-campus-text text-sm">CampusIQ AI</div>
            <div className="flex items-center gap-1.5 text-xs text-campus-muted">
              <span className="status-dot online" />
              MCP-powered · All systems
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="btn-ghost text-xs px-2 py-1">
            Clear
          </button>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MCP Server indicators */}
      <div className="flex gap-1.5 px-4 py-2.5 border-b border-campus-border bg-campus-card/40 overflow-x-auto">
        {(["library", "cafeteria", "events", "academics"] as MCPServerName[]).map((s) => {
          const Icon = SERVER_ICONS[s];
          return (
            <div
              key={s}
              className={clsx("tool-chip border capitalize", SERVER_COLORS[s])}
            >
              <Icon className="w-2.5 h-2.5" />
              {s}
            </div>
          );
        })}
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="chat-message-ai">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="typing-dot w-1.5 h-1.5 bg-campus-muted rounded-full" />
                <span className="typing-dot w-1.5 h-1.5 bg-campus-muted rounded-full" />
                <span className="typing-dot w-1.5 h-1.5 bg-campus-muted rounded-full" />
              </div>
              <span className="text-xs text-campus-muted">Querying campus servers…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute right-6 bottom-28 w-8 h-8 rounded-full bg-campus-accent text-white flex items-center justify-center shadow-lg hover:bg-campus-accent-soft transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}

      {/* Quick prompts (only if no user messages yet) */}
      {messages.length === 1 && (
        <div className="px-4 py-3 border-t border-campus-border">
          <p className="text-xs text-campus-muted mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Try asking
          </p>
          <div className="flex flex-col gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-left text-xs text-campus-muted px-3 py-2 rounded-lg border border-campus-border hover:border-campus-accent hover:text-campus-text transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-campus-border">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            className="input-field flex-1 resize-none text-sm min-h-[42px] max-h-32"
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about library, food, events…"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="btn-primary p-2.5 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-campus-dim mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </aside>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [showTools, setShowTools] = useState(false);

  function renderContent(text: string) {
    // Simple markdown-like rendering
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="font-mono text-campus-accent bg-campus-surface px-1 rounded">$1</code>')
      .split('\n')
      .map((line, i) => `<span key="${i}">${line}</span>`)
      .join('<br/>');
  }

  return (
    <div className={clsx("flex flex-col gap-1.5", isUser && "items-end")}>
      {/* Tool calls badge */}
      {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
        <button
          onClick={() => setShowTools((v) => !v)}
          className="self-start flex items-center gap-1.5 text-xs text-campus-muted hover:text-campus-text transition-colors"
        >
          <Wifi className="w-3 h-3 text-campus-accent" />
          <span>
            Queried {message.toolCalls.length} MCP tool
            {message.toolCalls.length > 1 ? "s" : ""}
          </span>
          <ChevronDown className={clsx("w-3 h-3 transition-transform", showTools && "rotate-180")} />
        </button>
      )}

      {/* Tool call details */}
      {showTools && message.toolCalls && (
        <div className="self-start w-full space-y-1.5 mb-1">
          {message.toolCalls.map((tc) => {
            const Icon = SERVER_ICONS[tc.server] ?? Wifi;
            const color = SERVER_COLORS[tc.server] ?? "text-campus-muted bg-campus-surface border-campus-border";
            return (
              <div
                key={tc.id}
                className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg border text-xs", color)}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="font-mono flex-1 truncate">
                  {tc.server}.{tc.tool}
                </span>
                {tc.latencyMs && (
                  <span className="text-campus-dim font-mono shrink-0">{tc.latencyMs}ms</span>
                )}
                {tc.status === "success" ? (
                  <span className="text-emerald-400">✓</span>
                ) : (
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Message bubble */}
      <div className={isUser ? "chat-message-user" : "chat-message-ai"}>
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <div
            className="prose-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
          />
        )}
      </div>

      {/* Sources */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <div className="self-start flex flex-wrap gap-1">
          {message.sources.map((source) => {
            const Icon = SERVER_ICONS[source];
            const color = SERVER_COLORS[source];
            return (
              <span key={source} className={clsx("tool-chip border capitalize", color)}>
                <Icon className="w-2.5 h-2.5" />
                {source}
              </span>
            );
          })}
        </div>
      )}

      {/* Timestamp */}
      <span className="text-xs text-campus-dim px-1">
        {message.timestamp.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </span>
    </div>
  );
}
