"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, ExternalLink, Filter, Loader2, Star } from "lucide-react";
import { callMCPTool } from "@/lib/mcp-client";
import type { CampusEvent, EventCategory } from "@/types";
import { clsx } from "clsx";

const CATEGORIES: { id: EventCategory | "all"; label: string; color: string }[] = [
  { id: "all", label: "All", color: "border-campus-border text-campus-muted" },
  { id: "technical", label: "Technical", color: "border-blue-500/40 text-blue-400 bg-blue-500/10" },
  { id: "cultural", label: "Cultural", color: "border-purple-500/40 text-purple-400 bg-purple-500/10" },
  { id: "academic", label: "Academic", color: "border-teal-500/40 text-teal-400 bg-teal-500/10" },
  { id: "sports", label: "Sports", color: "border-green-500/40 text-green-400 bg-green-500/10" },
  { id: "workshop", label: "Workshop", color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
  { id: "fest", label: "Fest", color: "border-rose-500/40 text-rose-400 bg-rose-500/10" },
];

const CAT_COLORS: Record<string, string> = {
  technical: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  cultural: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  academic: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  sports: "bg-green-500/20 text-green-400 border-green-500/30",
  workshop: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  fest: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  seminar: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

export function EventsPanel() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [daysAhead, setDaysAhead] = useState(7);

  useEffect(() => {
    fetchEvents();
  }, [daysAhead, activeCategory]);

  async function fetchEvents() {
    setLoading(true);
    const args: Record<string, unknown> = { days_ahead: daysAhead };
    if (activeCategory !== "all") args.category = activeCategory;
    if (search.trim()) args.search = search.trim();

    const r = await callMCPTool("events", "get_upcoming", args);
    if (r.data && !r.error) {
      const data = r.data as { events?: CampusEvent[] };
      setEvents(data.events ?? []);
    }
    setLoading(false);
  }

  const filteredEvents = search
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(search.toLowerCase()) ||
          e.description.toLowerCase().includes(search.toLowerCase())
      )
    : events;

  const featuredEvents = filteredEvents.filter((e) => e.featured);
  const regularEvents = filteredEvents.filter((e) => !e.featured);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-campus-text">Campus Events</h2>
          <p className="text-campus-muted text-sm">Workshops, fests, seminars, and more</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input-field w-auto"
            value={daysAhead}
            onChange={(e) => setDaysAhead(Number(e.target.value))}
          >
            <option value={3}>Next 3 days</option>
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 2 weeks</option>
            <option value={30}>Next month</option>
          </select>
          <button onClick={fetchEvents} className="btn-primary">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                "px-3 py-1 rounded-full border text-xs font-medium transition-all duration-200",
                activeCategory === cat.id ? cat.color : "border-campus-border text-campus-muted hover:border-campus-dim"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-campus-accent animate-spin" />
        </div>
      ) : (
        <>
          {/* Featured */}
          {featuredEvents.length > 0 && (
            <div>
              <p className="section-label mb-3 flex items-center gap-2">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Featured Events
              </p>
              <div className="grid gap-4">
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} featured />
                ))}
              </div>
            </div>
          )}

          {/* Regular */}
          {regularEvents.length > 0 && (
            <div>
              <p className="section-label mb-3">
                All Events ({regularEvents.length})
              </p>
              <div className="grid gap-3">
                {regularEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {filteredEvents.length === 0 && (
            <div className="glass-card p-8 text-center text-campus-muted">
              No events found. Try adjusting the filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, featured }: { event: CampusEvent; featured?: boolean }) {
  const catColor = CAT_COLORS[event.category] || "bg-campus-surface text-campus-muted border-campus-border";
  const date = new Date(event.date);
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div
      className={clsx(
        "glass-card p-5 hover:border-teal-500/30 transition-all duration-200 card-reveal",
        featured && "border-teal-500/20 bg-teal-500/5"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div className={clsx(
          "shrink-0 text-center rounded-xl p-3 min-w-[56px] border",
          isToday ? "bg-teal-500/20 border-teal-500/40" : "bg-campus-surface border-campus-border"
        )}>
          <div className={clsx("text-xs font-medium", isToday ? "text-teal-400" : "text-campus-muted")}>
            {date.toLocaleDateString("en-IN", { month: "short" })}
          </div>
          <div className={clsx("text-2xl font-bold font-display leading-none", isToday ? "text-teal-400" : "text-campus-text")}>
            {date.getDate()}
          </div>
          {isToday && <div className="text-xs text-teal-400 font-medium">Today</div>}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={clsx("badge border", catColor)}>
              {event.category}
            </span>
            {featured && (
              <span className="badge bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Star className="w-2.5 h-2.5 fill-current" /> Featured
              </span>
            )}
          </div>
          <h3 className="font-display font-semibold text-campus-text mb-1">{event.title}</h3>
          <p className="text-sm text-campus-muted line-clamp-2 mb-3">{event.description}</p>

          <div className="flex items-center gap-4 text-xs text-campus-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {event.startTime} – {event.endTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.venue}
            </span>
            {event.capacity && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.registeredCount}/{event.capacity}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        {event.registrationRequired && event.registrationLink && (
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 text-teal-400 text-xs font-medium hover:bg-teal-500/20 transition-colors"
          >
            Register <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
