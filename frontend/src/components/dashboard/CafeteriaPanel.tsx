"use client";

import { useState, useEffect } from "react";
import { Coffee, Users, Clock, Star, Leaf, Flame, Loader2 } from "lucide-react";
import { callMCPTool } from "@/lib/mcp-client";
import type { CafeteriaStatus, DailyMenu, MenuItem, MealType } from "@/types";

const MEAL_TABS: { id: MealType | "all"; label: string; time: string }[] = [
  { id: "breakfast", label: "Breakfast", time: "7:30–9:30" },
  { id: "lunch", label: "Lunch", time: "12:00–14:30" },
  { id: "dinner", label: "Dinner", time: "19:00–21:00" },
  { id: "snacks", label: "Snacks", time: "16:00–18:00" },
];

export function CafeteriaPanel() {
  const [status, setStatus] = useState<CafeteriaStatus | null>(null);
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [activeMeal, setActiveMeal] = useState<MealType>("lunch");
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    Promise.all([
      callMCPTool("cafeteria", "get_status", {}),
      callMCPTool("cafeteria", "get_todays_menu", { meal: "all" }),
    ]).then(([statusRes, menuRes]) => {
      if (statusRes.data && !statusRes.error) {
        setStatus(statusRes.data as CafeteriaStatus);
        const current = (statusRes.data as CafeteriaStatus).currentMeal;
        if (current) setActiveMeal(current);
      }
      if (menuRes.data && !menuRes.error) {
        setMenu(menuRes.data as DailyMenu);
      }
      setLoading(false);
    });
  }, []);

  const items: MenuItem[] = menu?.meals?.[activeMeal] ?? [];
  const filteredItems = vegOnly ? items.filter((i) => i.isVeg) : items;

  const crowdColor = {
    low: "text-emerald-400",
    medium: "text-amber-400",
    high: "text-rose-400",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-campus-text">Cafeteria</h2>
          </div>
          <p className="text-campus-muted text-sm ml-12">Today's menu, live status, and crowd levels</p>
        </div>

        {/* Status Card */}
        {status && (
          <div className="glass-card px-5 py-4 flex items-center gap-6">
            <div className="text-center">
              <div className={`text-lg font-bold ${status.isOpen ? "text-emerald-400" : "text-rose-400"}`}>
                {status.isOpen ? "Open" : "Closed"}
              </div>
              <div className="text-xs text-campus-muted">Status</div>
            </div>
            <div className="h-8 w-px bg-campus-border" />
            <div className="text-center">
              <div className={`text-lg font-bold ${crowdColor[status.crowdLevel]}`}>
                {status.crowdLevel.charAt(0).toUpperCase() + status.crowdLevel.slice(1)}
              </div>
              <div className="text-xs text-campus-muted">Crowd</div>
            </div>
            <div className="h-8 w-px bg-campus-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-campus-text">{status.waitTimeMinutes}m</div>
              <div className="text-xs text-campus-muted">Wait</div>
            </div>
          </div>
        )}
      </div>

      {/* Meal Tabs */}
      <div className="glass-card p-1.5 flex gap-1">
        {MEAL_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveMeal(tab.id as MealType)}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeMeal === tab.id
                ? "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                : "text-campus-muted hover:text-campus-text hover:bg-campus-border"
            }`}
          >
            <div>{tab.label}</div>
            <div className="text-xs opacity-70 font-normal">{tab.time}</div>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setVegOnly((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
            vegOnly
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
              : "border-campus-border text-campus-muted hover:border-campus-accent"
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          Veg Only
        </button>
        <span className="text-sm text-campus-muted">{filteredItems.length} items</span>
      </div>

      {/* Menu Items */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-campus-accent animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card p-8 text-center text-campus-muted">
          No items available for this meal time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="glass-card p-5 hover:border-amber-500/30 transition-all duration-200 card-reveal">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {item.isVeg ? (
              <span className="w-4 h-4 border-2 border-emerald-500 rounded-sm flex items-center justify-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              </span>
            ) : (
              <span className="w-4 h-4 border-2 border-rose-500 rounded-sm flex items-center justify-center">
                <span className="w-2 h-2 bg-rose-500 rounded-full" />
              </span>
            )}
            <h4 className="font-medium text-campus-text">{item.name}</h4>
          </div>
          <p className="text-xs text-campus-muted line-clamp-2">{item.description}</p>
        </div>
        <div className="text-right ml-4 shrink-0">
          <div className="text-lg font-bold text-amber-400">₹{item.price}</div>
          <div className="flex items-center gap-1 text-xs text-campus-muted justify-end">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {item.rating.toFixed(1)}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge bg-campus-surface border border-campus-border text-campus-muted">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-campus-muted">
          <Flame className="w-3 h-3 text-orange-400" />
          {item.calories} cal
        </div>
      </div>
    </div>
  );
}
