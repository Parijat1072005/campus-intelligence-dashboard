"use client";

import { BookOpen, Coffee, Calendar, GraduationCap, Home, ChevronLeft, ChevronRight, Wifi, WifiOff, Zap, Settings } from "lucide-react";
import type { ActiveView } from "@/app/page";
import type { ServerStatus } from "@/types";
import { clsx } from "clsx";

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  serverStatuses: ServerStatus[];
}

const NAV_ITEMS = [
  { id: "home" as const, label: "Overview", icon: Home, color: "text-campus-accent" },
  { id: "library" as const, label: "Library", icon: BookOpen, color: "text-indigo-400", server: "library" as const },
  { id: "cafeteria" as const, label: "Cafeteria", icon: Coffee, color: "text-amber-400", server: "cafeteria" as const },
  { id: "events" as const, label: "Events", icon: Calendar, color: "text-teal-400", server: "events" as const },
  { id: "academics" as const, label: "Academics", icon: GraduationCap, color: "text-rose-400", server: "academics" as const },
];

export function Sidebar({ activeView, onNavigate, collapsed, onToggleCollapse, serverStatuses }: SidebarProps) {
  function getStatus(server?: string) {
    if (!server) return null;
    return serverStatuses.find((s) => s.server === server);
  }

  return (
    <aside
      className={clsx(
        "flex flex-col bg-campus-surface border-r border-campus-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={clsx(
        "flex items-center gap-3 px-4 py-5 border-b border-campus-border",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-campus-accent to-campus-indigo flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-display font-bold text-campus-text text-sm leading-none">CampusIQ</div>
            <div className="text-campus-muted text-xs mt-0.5">Intelligence Hub</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {!collapsed && (
          <p className="section-label px-2 mb-3">Navigation</p>
        )}
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const status = getStatus(item.server);
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-campus-accent/15 border border-campus-accent/30 text-campus-text"
                  : "hover:bg-campus-border text-campus-muted hover:text-campus-text",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={clsx(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? item.color : "text-current"
                )}
              />
              {!collapsed && (
                <>
                  <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  {status && (
                    <span
                      className={clsx(
                        "status-dot",
                        status.isOnline ? "online" : "offline"
                      )}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Server Status Summary */}
      {!collapsed && serverStatuses.length > 0 && (
        <div className="px-3 py-4 border-t border-campus-border">
          <p className="section-label mb-2 px-1">MCP Servers</p>
          <div className="space-y-1.5">
            {serverStatuses.map((s) => (
              <div key={s.server} className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  {s.isOnline ? (
                    <Wifi className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-rose-400" />
                  )}
                  <span className="text-xs capitalize text-campus-muted">{s.server}</span>
                </div>
                {s.isOnline && s.latencyMs && (
                  <span className="text-xs text-campus-dim font-mono">{s.latencyMs}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Link */}
      <div className="px-2 pb-2">
        <a
          href="/admin"
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-campus-muted hover:text-campus-text hover:bg-campus-border",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Admin Panel" : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Admin Panel</span>}
        </a>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center h-10 border-t border-campus-border hover:bg-campus-border transition-colors text-campus-muted hover:text-campus-text"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
