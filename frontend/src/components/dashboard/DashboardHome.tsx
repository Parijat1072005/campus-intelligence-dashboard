"use client";

import { useEffect, useState } from "react";
import { BookOpen, Coffee, Calendar, GraduationCap, Bot, ArrowRight, Sparkles, TrendingUp, Clock } from "lucide-react";
import type { ActiveView } from "@/app/page";
import type { ServerStatus } from "@/types";
import { callMCPTool } from "@/lib/mcp-client";

interface DashboardHomeProps {
  serverStatuses: ServerStatus[];
  onNavigate: (view: ActiveView) => void;
  onOpenChat: () => void;
}

const QUICK_PROMPTS = [
  "What books are available on machine learning?",
  "What's for lunch today?",
  "Any tech fest events this week?",
  "When is my next exam?",
  "Is the library open now?",
  "What are the attendance rules?",
];

export function DashboardHome({ serverStatuses, onNavigate, onOpenChat }: DashboardHomeProps) {
  const [cafeteriaStatus, setCafeteriaStatus] = useState<{ isOpen: boolean; currentMeal: string | null; crowdLevel: string } | null>(null);
  const [todayEvents, setTodayEvents] = useState<number>(0);
  const [availableBooks, setAvailableBooks] = useState<number>(0);

  useEffect(() => {
    // Fetch live widget data
    callMCPTool("cafeteria", "get_status", {}).then((r) => {
      if (r.data && !r.error) setCafeteriaStatus(r.data as typeof cafeteriaStatus);
    });
    callMCPTool("events", "get_today", {}).then((r) => {
      if (r.data && !r.error) {
        const data = r.data as { events?: unknown[] };
        setTodayEvents(data.events?.length ?? 0);
      }
    });
    callMCPTool("library", "search_books", { query: "all", available_only: true }).then((r) => {
      if (r.data && !r.error) {
        const data = r.data as { total?: number };
        setAvailableBooks(data.total ?? 0);
      }
    });
  }, []);

  const stats = [
    {
      label: "Available Books",
      value: availableBooks || "—",
      icon: BookOpen,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      view: "library" as ActiveView,
    },
    {
      label: "Today's Events",
      value: todayEvents || "—",
      icon: Calendar,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
      view: "events" as ActiveView,
    },
    {
      label: "Cafeteria",
      value: cafeteriaStatus?.isOpen ? "Open" : "Closed",
      subtext: cafeteriaStatus?.crowdLevel ? `${cafeteriaStatus.crowdLevel} crowd` : undefined,
      icon: Coffee,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      view: "cafeteria" as ActiveView,
    },
    {
      label: "MCP Servers",
      value: `${serverStatuses.filter((s) => s.isOnline).length}/${serverStatuses.length || 4}`,
      subtext: "systems live",
      icon: TrendingUp,
      color: "text-campus-accent",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      view: "home" as ActiveView,
    },
  ];

  const modules = [
    {
      id: "library" as ActiveView,
      label: "Library",
      description: "Search books, check availability, hours",
      icon: BookOpen,
      color: "from-indigo-600 to-indigo-800",
      accent: "border-indigo-500/30",
    },
    {
      id: "cafeteria" as ActiveView,
      label: "Cafeteria",
      description: "Today's menu, live status, weekly meals",
      icon: Coffee,
      color: "from-amber-600 to-amber-800",
      accent: "border-amber-500/30",
    },
    {
      id: "events" as ActiveView,
      label: "Events",
      description: "Campus events, workshops, tech fests",
      icon: Calendar,
      color: "from-teal-600 to-teal-800",
      accent: "border-teal-500/30",
    },
    {
      id: "academics" as ActiveView,
      label: "Academics",
      description: "Exam schedule, calendar, course info",
      icon: GraduationCap,
      color: "from-rose-600 to-rose-800",
      accent: "border-rose-500/30",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-campus-accent/10 to-transparent rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-campus-accent" />
            <span className="section-label">AI-Powered Campus Hub</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-campus-text mb-2">
            Good {getGreeting()},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-campus-accent to-campus-indigo">
              Student
            </span>
          </h1>
          <p className="text-campus-muted text-base mb-6 max-w-xl">
            Your campus, unified. Ask anything about the library, cafeteria, events, or academics — one conversation covers it all.
          </p>
          <button
            onClick={onOpenChat}
            className="btn-primary text-base px-6 py-2.5 gap-3"
          >
            <Bot className="w-4 h-4" />
            Ask CampusIQ AI
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={() => stat.view !== "home" && onNavigate(stat.view)}
              className={`glass-card p-5 text-left hover:border-campus-accent/30 transition-all duration-200 group ${
                stat.view !== "home" ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${stat.bg} ${stat.border} border mb-3`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-display font-bold ${stat.color} mb-0.5`}>
                {stat.value}
              </div>
              <div className="text-xs text-campus-muted">{stat.label}</div>
              {stat.subtext && (
                <div className="text-xs text-campus-dim mt-0.5">{stat.subtext}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="font-display text-lg font-semibold text-campus-text mb-4">Campus Systems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className={`glass-card p-5 text-left hover:border-campus-accent/30 transition-all duration-200 group border ${mod.accent}`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} mb-4`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-semibold text-campus-text mb-1 group-hover:text-campus-accent transition-colors">
                  {mod.label}
                </h3>
                <p className="text-xs text-campus-muted leading-relaxed">{mod.description}</p>
                <div className="flex items-center gap-1 mt-3 text-campus-accent text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-4 h-4 text-campus-accent" />
          <h2 className="font-display font-semibold text-campus-text">Try asking CampusIQ</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={onOpenChat}
              className="px-3 py-1.5 rounded-full border border-campus-border bg-campus-surface hover:border-campus-accent hover:bg-campus-accent/10 text-campus-muted hover:text-campus-text text-sm transition-all duration-200"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
