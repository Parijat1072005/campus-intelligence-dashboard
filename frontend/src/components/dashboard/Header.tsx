"use client";

import { Bot, Bell, Search, ChevronRight } from "lucide-react";
import type { ActiveView } from "@/app/page";
import type { ServerStatus } from "@/types";

const VIEW_LABELS: Record<ActiveView, string> = {
  home: "Overview",
  library: "Library",
  cafeteria: "Cafeteria",
  events: "Events",
  academics: "Academics",
};

interface HeaderProps {
  activeView: ActiveView;
  onOpenChat: () => void;
  serverStatuses: ServerStatus[];
  chatOpen: boolean;
}

export function Header({ activeView, onOpenChat, serverStatuses, chatOpen }: HeaderProps) {
  const onlineCount = serverStatuses.filter((s) => s.isOnline).length;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-campus-border bg-campus-surface/80 backdrop-blur-sm shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-campus-muted">CampusIQ</span>
        <ChevronRight className="w-4 h-4 text-campus-dim" />
        <span className="font-medium text-campus-text">{VIEW_LABELS[activeView]}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Server health indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-campus-card border border-campus-border">
          <span
            className={`status-dot ${onlineCount === serverStatuses.length && serverStatuses.length > 0 ? "online" : "bg-amber-400"}`}
          />
          <span className="text-xs text-campus-muted font-mono">
            {onlineCount}/{serverStatuses.length || 4} servers
          </span>
        </div>

        {/* Date/time */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-campus-muted font-mono">
          <span>{dateStr}</span>
          <span className="text-campus-dim">·</span>
          <span>{timeStr}</span>
        </div>

        {/* Notifications placeholder */}
        <button className="btn-ghost relative p-2">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-campus-accent rounded-full" />
        </button>

        {/* Open AI Chat */}
        <button
          onClick={onOpenChat}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            chatOpen
              ? "bg-campus-accent text-white"
              : "bg-campus-card border border-campus-border text-campus-text hover:border-campus-accent hover:bg-campus-accent/10"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Ask CampusIQ</span>
        </button>
      </div>
    </header>
  );
}
