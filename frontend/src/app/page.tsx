"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { LibraryPanel } from "@/components/dashboard/LibraryPanel";
import { CafeteriaPanel } from "@/components/dashboard/CafeteriaPanel";
import { EventsPanel } from "@/components/dashboard/EventsPanel";
import { AcademicsPanel } from "@/components/dashboard/AcademicsPanel";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import type { ServerStatus } from "@/types";

export type ActiveView =
  | "home"
  | "library"
  | "cafeteria"
  | "events"
  | "academics";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [chatOpen, setChatOpen] = useState(false);
  const [serverStatuses, setServerStatuses] = useState<ServerStatus[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkServerStatuses();
    const interval = setInterval(checkServerStatuses, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function checkServerStatuses() {
    try {
      const res = await fetch("/api/servers/status");
      if (!res.ok) return;
      const data = await res.json();
      setServerStatuses(
        data.statuses.map(
          (s: { server: string; online: boolean; latencyMs: number }) => ({
            server: s.server,
            isOnline: s.online,   // API returns `online`, type expects `isOnline`
            latencyMs: s.latencyMs,
            lastChecked: new Date(),
          })
        )
      );
    } catch {
      // silently fail
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-campus-bg">
      {/* Left Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        serverStatuses={serverStatuses}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header
          activeView={activeView}
          onOpenChat={() => setChatOpen(true)}
          serverStatuses={serverStatuses}
          chatOpen={chatOpen}
        />

        <main className="flex-1 overflow-y-auto bg-grid relative">
          <div className="absolute inset-0 glow-accent pointer-events-none" />
          <div className="relative z-10 p-6">
            {activeView === "home" && (
              <DashboardHome
                serverStatuses={serverStatuses}
                onNavigate={setActiveView}
                onOpenChat={() => setChatOpen(true)}
              />
            )}
            {activeView === "library" && <LibraryPanel />}
            {activeView === "cafeteria" && <CafeteriaPanel />}
            {activeView === "events" && <EventsPanel />}
            {activeView === "academics" && <AcademicsPanel />}
          </div>
        </main>
      </div>

      {/* Right AI Chat Sidebar */}
      <ChatSidebar
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        onNavigate={setActiveView}
      />
    </div>
  );
}
