"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Clock, MapPin, Copy, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { callMCPTool } from "@/lib/mcp-client";
import type { LibraryBook, LibraryHours } from "@/types";

export function LibraryPanel() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [hours, setHours] = useState<LibraryHours[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    setHoursLoading(true);
    callMCPTool("library", "get_hours", {}).then((r) => {
      if (r.data && !r.error) {
        const data = r.data as { hours?: LibraryHours[] };
        setHours(data.hours ?? []);
      }
      setHoursLoading(false);
    });
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const r = await callMCPTool("library", "search_books", {
      query: query.trim(),
      available_only: availableOnly,
    });
    if (r.data && !r.error) {
      const data = r.data as { books?: LibraryBook[] };
      setBooks(data.books ?? []);
    }
    setLoading(false);
  }

  const todayHours = hours.find((h) => h.isToday);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-campus-text">Library</h2>
          </div>
          <p className="text-campus-muted text-sm ml-12">Search books, check availability, and library hours</p>
        </div>
        {todayHours && (
          <div className="glass-card px-4 py-3 text-sm text-right">
            <div className="flex items-center gap-2 text-campus-muted mb-0.5">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Today's Hours</span>
            </div>
            <div className="font-mono font-medium text-campus-text">
              {todayHours.open} – {todayHours.close}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="glass-card p-5">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-campus-muted" />
            <input
              className="input-field pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, subject, or ISBN…"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            id="availOnly"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="rounded border-campus-border bg-campus-surface accent-campus-accent"
          />
          <label htmlFor="availOnly" className="text-sm text-campus-muted cursor-pointer">
            Available copies only
          </label>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div>
          <p className="section-label mb-3">
            {loading ? "Searching…" : `${books.length} result${books.length !== 1 ? "s" : ""} found`}
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-campus-accent animate-spin" />
            </div>
          ) : books.length === 0 ? (
            <div className="glass-card p-8 text-center text-campus-muted">
              No books found. Try a different search term.
            </div>
          ) : (
            <div className="grid gap-3">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Library Hours */}
      {hours.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold text-campus-text mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> Weekly Hours
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {hours.map((h) => (
              <div
                key={h.day}
                className={`p-3 rounded-lg border text-center ${
                  h.isToday
                    ? "border-indigo-500/40 bg-indigo-500/10"
                    : "border-campus-border bg-campus-surface"
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${h.isToday ? "text-indigo-400" : "text-campus-muted"}`}>
                  {h.day}
                  {h.isToday && <span className="ml-1 text-indigo-400">·Today</span>}
                </div>
                <div className="font-mono text-sm text-campus-text">
                  {h.open} – {h.close}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookCard({ book }: { book: LibraryBook }) {
  return (
    <div className="glass-card p-5 flex gap-4 hover:border-indigo-500/30 transition-all duration-200 card-reveal">
      {/* Spine color */}
      <div
        className="w-12 h-16 rounded-md shrink-0 flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: book.coverColor || "#4F46E5" }}
      >
        {book.title.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-campus-text truncate">{book.title}</h4>
        <p className="text-sm text-campus-muted mb-2">{book.author}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="tool-chip">{book.genre}</span>
          <span className="tool-chip">
            <MapPin className="w-3 h-3" /> {book.location}
          </span>
          <span className="tool-chip">ISBN: {book.isbn}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="shrink-0 text-right">
        {book.available ? (
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Available</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-rose-400 mb-1">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Checked Out</span>
          </div>
        )}
        <div className="text-xs text-campus-muted">
          {book.availableCopies}/{book.totalCopies} copies
        </div>
        {!book.available && book.dueDate && (
          <div className="text-xs text-campus-dim mt-0.5">
            Due: {new Date(book.dueDate).toLocaleDateString("en-IN")}
          </div>
        )}
      </div>
    </div>
  );
}
