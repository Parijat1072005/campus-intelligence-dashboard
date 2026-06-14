"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, Coffee, Calendar, GraduationCap, Plus, Trash2,
  Save, RefreshCw, CheckCircle, AlertCircle, Lock, Zap,
  Users, ShieldCheck, Shield, Eye, EyeOff, LogOut,
} from "lucide-react";

const MCP = {
  library:   process.env.NEXT_PUBLIC_LIBRARY_MCP_URL   || "http://localhost:3001",
  cafeteria: process.env.NEXT_PUBLIC_CAFETERIA_MCP_URL || "http://localhost:3002",
  events:    process.env.NEXT_PUBLIC_EVENTS_MCP_URL    || "http://localhost:3003",
  academics: process.env.NEXT_PUBLIC_ACADEMICS_MCP_URL || "http://localhost:3004",
};

type Tab = "library" | "cafeteria" | "events" | "academics" | "users";
type AdminRole = "superadmin" | "admin";
interface AuthInfo { username: string; role: AdminRole; }

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border
      ${type === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-red-50 border-red-200 text-red-700"}`}>
      {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {msg}
    </div>
  );
}

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthInfo | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    setLoginLoading(true);
    try {
      const res = await fetch(`${MCP.library}/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setAuth({ username: data.username, role: data.role });
        setPassword("");
      } else {
        showToast("Invalid username or password", "error");
      }
    } catch {
      showToast("Could not reach auth server", "error");
    } finally {
      setLoginLoading(false);
    }
  }

  if (!auth) {
    return (
      <div className="min-h-screen bg-campus-bg flex items-center justify-center p-4">
        <div className="glass-card p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-campus-accent to-indigo-600 flex items-center justify-center shadow-sm">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-campus-text">Admin Panel</h1>
              <p className="text-xs text-campus-muted">CampusIQ Data Manager</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={username}
              autoComplete="username"
              onChange={e => setUsername(e.target.value)}
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="input-field pr-10"
                placeholder="Password"
                value={password}
                autoComplete="current-password"
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-campus-dim hover:text-campus-muted transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loginLoading || !username || !password}
              className="btn-primary w-full justify-center"
            >
              <Lock className="w-4 h-4" />
              {loginLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>


        </div>
        {toast && <Toast {...toast} />}
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
    { id: "library",   label: "Library",   icon: BookOpen,      color: "text-indigo-600" },
    { id: "cafeteria", label: "Cafeteria", icon: Coffee,        color: "text-amber-600"  },
    { id: "events",    label: "Events",    icon: Calendar,      color: "text-teal-600"   },
    { id: "academics", label: "Academics", icon: GraduationCap, color: "text-rose-600"   },
    { id: "users",     label: "Users",     icon: Users,         color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-campus-bg">
      {/* Top bar */}
      <div className="bg-campus-surface border-b border-campus-border px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-campus-accent to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-campus-text">CampusIQ</span>
            <span className="text-campus-muted text-sm ml-2">Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Current user badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-campus-border text-sm">
            {auth.role === "superadmin"
              ? <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              : <Shield className="w-3.5 h-3.5 text-campus-accent" />}
            <span className="font-medium text-campus-text">{auth.username}</span>
            <span className="text-campus-dim capitalize text-xs">{auth.role}</span>
          </div>
          <a href="/" className="btn-ghost text-sm">← Dashboard</a>
          <button
            onClick={() => { setAuth(null); setUsername(""); }}
            className="btn-ghost text-sm text-rose-600 hover:text-rose-700"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="glass-card p-1.5 flex gap-1 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 flex-1 justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? `bg-gray-100 ${tab.color} shadow-sm border border-campus-border`
                    : "text-campus-muted hover:text-campus-text hover:bg-gray-50"}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "library"   && <LibraryAdmin   showToast={showToast} />}
        {activeTab === "cafeteria" && <CafeteriaAdmin showToast={showToast} />}
        {activeTab === "events"    && <EventsAdmin    showToast={showToast} />}
        {activeTab === "academics" && <AcademicsAdmin showToast={showToast} />}
        {activeTab === "users" && (
          <UsersAdmin showToast={showToast} currentUser={auth.username} />
        )}
      </div>

      {toast && <Toast {...toast} />}
    </div>
  );
}

// ─── Users Admin (Superadmin only) ──────────────────────────────────────────
function UsersAdmin({ showToast, currentUser }: { showToast: (m: string, t?: "success" | "error") => void; currentUser: string }) {
  const [admins, setAdmins] = useState<{ username: string; role: string }[]>([]);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch(`${MCP.library}/admin/users`);
    const d = await r.json();
    setAdmins(d.admins || []);
  }
  useEffect(() => { load(); }, []);

  async function addAdmin() {
    if (!form.username || !form.password) return showToast("Username and password required", "error");
    setLoading(true);
    try {
      const res = await fetch(`${MCP.library}/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) return showToast(d.error || "Failed to add admin", "error");
      showToast(`Admin "${form.username}" added!`);
      setForm({ username: "", password: "" });
      load();
    } finally {
      setLoading(false);
    }
  }

  async function removeAdmin(username: string) {
    if (!confirm(`Remove admin "${username}"? They will lose access immediately.`)) return;
    const res = await fetch(`${MCP.library}/admin/users/${username}`, { method: "DELETE" });
    const d = await res.json();
    if (!res.ok) return showToast(d.error || "Failed", "error");
    showToast(`Admin "${username}" removed`);
    load();
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200 text-sm text-purple-800">
        <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-purple-600" />
        <div>
          <p className="font-semibold">User Management</p>
          <p className="text-purple-600 mt-0.5">Add or remove admin accounts. All admins can manage campus data across all tabs. You cannot delete your own account while logged in.</p>
        </div>
      </div>

      {/* Add admin */}
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-campus-text mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-600" /> Add Admin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="input-field"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              className="input-field pr-10"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-campus-dim hover:text-campus-muted">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addAdmin} disabled={loading}>
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      {/* Admin list */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-campus-text">All Admins ({admins.length})</h2>
          <button onClick={load} className="btn-ghost text-xs"><RefreshCw className="w-3 h-3" /> Refresh</button>
        </div>
        <div className="space-y-2">
          {admins.map(a => (
            <div key={a.username} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-campus-border">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
                ${a.role === "superadmin" ? "bg-purple-600" : "bg-campus-accent"}`}>
                {a.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-campus-text">{a.username}
                  {a.username === currentUser && <span className="ml-2 text-xs text-campus-muted">(you)</span>}
                </p>
                <p className="text-xs text-campus-muted capitalize flex items-center gap-1">
                  {a.role === "superadmin"
                    ? <><ShieldCheck className="w-3 h-3 text-purple-600" /> Superadmin</>
                    : <><Shield className="w-3 h-3 text-campus-accent" /> Admin</>}
                </p>
              </div>
              {a.username !== currentUser ? (
                <button
                  onClick={() => removeAdmin(a.username)}
                  className="btn-ghost text-rose-600 hover:text-rose-700 p-1.5"
                  title="Remove admin access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs text-campus-dim font-medium px-2 py-1 bg-gray-100 border border-campus-border rounded-full">You</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Library Admin ──────────────────────────────────────────────────────────
function LibraryAdmin({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [books, setBooks] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", author: "", isbn: "", genre: "Engineering", totalCopies: 3, availableCopies: 3, location: "", available: true, coverColor: "#4F46E5" });

  async function load() {
    const r = await fetch(`${MCP.library}/admin/data`);
    const d = await r.json();
    setBooks(d.books || []);
  }
  useEffect(() => { load(); }, []);

  async function addBook() {
    if (!form.title || !form.author) return showToast("Title and author are required", "error");
    await fetch(`${MCP.library}/admin/books`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    showToast("Book added successfully!");
    setForm({ title: "", author: "", isbn: "", genre: "Engineering", totalCopies: 3, availableCopies: 3, location: "", available: true, coverColor: "#4F46E5" });
    load();
  }

  async function deleteBook(id: string) {
    await fetch(`${MCP.library}/admin/books/${id}`, { method: "DELETE" });
    showToast("Book deleted");
    load();
  }

  async function toggleAvail(book: any) {
    await fetch(`${MCP.library}/admin/books/${book.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !book.available, availableCopies: !book.available ? book.totalCopies : 0 })
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-campus-text mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-600" /> Add Book
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input-field" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input className="input-field" placeholder="Author *" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
          <input className="input-field" placeholder="ISBN" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
          <select className="input-field" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>
            {["Engineering", "Science", "Arts", "History", "Fiction", "Mathematics", "Management"].map(g => <option key={g}>{g}</option>)}
          </select>
          <input className="input-field" placeholder="Shelf Location (e.g. Section A-12)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <div className="flex gap-2">
            <input type="number" className="input-field" placeholder="Total Copies" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: +e.target.value })} />
            <input type="number" className="input-field" placeholder="Available" value={form.availableCopies} onChange={e => setForm({ ...form, availableCopies: +e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-campus-muted">Cover color:</label>
            <input type="color" value={form.coverColor} onChange={e => setForm({ ...form, coverColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-campus-border bg-white" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="accent-campus-accent" />
            <label htmlFor="avail" className="text-sm text-campus-muted">Currently available</label>
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addBook}><Plus className="w-4 h-4" /> Add Book</button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-campus-text">Books ({books.length})</h2>
          <button onClick={load} className="btn-ghost text-xs"><RefreshCw className="w-3 h-3" /> Refresh</button>
        </div>
        {books.length === 0 ? (
          <p className="text-campus-muted text-sm text-center py-8">No books yet. Add some above.</p>
        ) : (
          <div className="space-y-2">
            {books.map(book => (
              <div key={book.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-campus-border">
                <div className="w-8 h-10 rounded shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: book.coverColor || "#4F46E5" }}>
                  {book.title?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-campus-text truncate">{book.title}</p>
                  <p className="text-xs text-campus-muted">{book.author} · {book.genre} · {book.location}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border
                  ${book.available ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {book.availableCopies}/{book.totalCopies}
                </span>
                <button onClick={() => toggleAvail(book)} className="btn-ghost text-xs px-2 py-1">
                  {book.available ? "Mark Out" : "Mark In"}
                </button>
                <button onClick={() => deleteBook(book.id)} className="btn-ghost text-rose-600 hover:text-rose-700 p-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cafeteria Admin ────────────────────────────────────────────────────────
function CafeteriaAdmin({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [menu, setMenu] = useState<Record<string, any[]>>({ breakfast: [], lunch: [], dinner: [], snacks: [] });
  const [activeMeal, setActiveMeal] = useState("lunch");
  const [form, setForm] = useState({ name: "", description: "", price: 0, calories: 0, category: "", isVeg: true, available: true, rating: 4.0, tags: "" });

  async function load() {
    const r = await fetch(`${MCP.cafeteria}/admin/data`);
    const d = await r.json();
    setMenu(d.menu || { breakfast: [], lunch: [], dinner: [], snacks: [] });
  }
  useEffect(() => { load(); }, []);

  async function addItem() {
    if (!form.name) return showToast("Item name required", "error");
    const item = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
    await fetch(`${MCP.cafeteria}/admin/menu/${activeMeal}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
    showToast("Menu item added!");
    setForm({ name: "", description: "", price: 0, calories: 0, category: "", isVeg: true, available: true, rating: 4.0, tags: "" });
    load();
  }

  async function deleteItem(meal: string, id: string) {
    await fetch(`${MCP.cafeteria}/admin/menu/${meal}/${id}`, { method: "DELETE" });
    showToast("Item removed"); load();
  }

  const meals = ["breakfast", "lunch", "dinner", "snacks"];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-campus-text mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-amber-600" /> Add Menu Item
        </h2>
        <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg border border-campus-border">
          {meals.map(m => (
            <button key={m} onClick={() => setActiveMeal(m)}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all capitalize
                ${activeMeal === m ? "bg-white text-amber-700 border border-amber-200 shadow-sm" : "text-campus-muted hover:text-campus-text"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input-field" placeholder="Item name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="Category (e.g. South Indian)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input className="input-field md:col-span-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input type="number" className="input-field" placeholder="Price (₹)" value={form.price || ""} onChange={e => setForm({ ...form, price: +e.target.value })} />
          <input type="number" className="input-field" placeholder="Calories" value={form.calories || ""} onChange={e => setForm({ ...form, calories: +e.target.value })} />
          <input className="input-field" placeholder="Tags (comma-separated: popular, spicy)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm text-campus-muted cursor-pointer">
              <input type="checkbox" checked={form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.checked })} className="accent-emerald-600" />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm text-campus-muted cursor-pointer">
              <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="accent-campus-accent" />
              Available today
            </label>
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addItem}><Plus className="w-4 h-4" /> Add to {activeMeal}</button>
      </div>

      {meals.map(meal => (
        <div key={meal} className="glass-card p-5">
          <h3 className="font-medium text-campus-text capitalize mb-3 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-600" /> {meal} ({(menu[meal] || []).length} items)
          </h3>
          {(menu[meal] || []).length === 0 ? (
            <p className="text-xs text-campus-muted">No items. Add some above.</p>
          ) : (
            <div className="space-y-2">
              {(menu[meal] || []).map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-campus-border">
                  <span className={`w-3 h-3 rounded-sm border-2 shrink-0 ${item.isVeg ? "border-emerald-500" : "border-rose-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-campus-text">{item.name}</p>
                    <p className="text-xs text-campus-muted">₹{item.price} · {item.calories} cal · {item.category}</p>
                  </div>
                  <button onClick={() => deleteItem(meal, item.id)} className="btn-ghost text-rose-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Events Admin ───────────────────────────────────────────────────────────
function EventsAdmin({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", category: "workshop", date: "", startTime: "", endTime: "", venue: "", organizer: "", registrationRequired: false, registrationLink: "", capacity: "", tags: "", featured: false });

  async function load() {
    const r = await fetch(`${MCP.events}/admin/data`);
    const d = await r.json();
    setEvents(d.events || []);
  }
  useEffect(() => { load(); }, []);

  async function addEvent() {
    if (!form.title || !form.date) return showToast("Title and date required", "error");
    const event = { ...form, capacity: form.capacity ? +form.capacity : undefined, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), registeredCount: 0 };
    await fetch(`${MCP.events}/admin/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event) });
    showToast("Event added!");
    setForm({ title: "", description: "", category: "workshop", date: "", startTime: "", endTime: "", venue: "", organizer: "", registrationRequired: false, registrationLink: "", capacity: "", tags: "", featured: false });
    load();
  }

  async function deleteEvent(id: string) {
    await fetch(`${MCP.events}/admin/events/${id}`, { method: "DELETE" });
    showToast("Event deleted"); load();
  }

  const categories = ["academic", "cultural", "sports", "technical", "workshop", "seminar", "fest"];

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-campus-text mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-600" /> Add Event
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input-field md:col-span-2" placeholder="Event title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="input-field md:col-span-2 resize-none" rows={2} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <input type="date" className="input-field" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input className="input-field" placeholder="Start time (e.g. 2:00 PM)" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
          <input className="input-field" placeholder="End time (e.g. 5:00 PM)" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
          <input className="input-field" placeholder="Venue" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
          <input className="input-field" placeholder="Organizer" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} />
          <input className="input-field" placeholder="Tags (comma-sep: AI, hands-on)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <input type="number" className="input-field" placeholder="Capacity (optional)" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
          <input className="input-field md:col-span-2" placeholder="Registration link (optional)" value={form.registrationLink} onChange={e => setForm({ ...form, registrationLink: e.target.value })} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-campus-muted cursor-pointer">
              <input type="checkbox" checked={form.registrationRequired} onChange={e => setForm({ ...form, registrationRequired: e.target.checked })} className="accent-campus-accent" />
              Registration required
            </label>
            <label className="flex items-center gap-2 text-sm text-campus-muted cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-amber-600" />
              Featured event
            </label>
          </div>
        </div>
        <button className="btn-primary mt-4" onClick={addEvent}><Plus className="w-4 h-4" /> Add Event</button>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-campus-text">All Events ({events.length})</h2>
          <button onClick={load} className="btn-ghost text-xs"><RefreshCw className="w-3 h-3" /> Refresh</button>
        </div>
        {events.length === 0 ? <p className="text-sm text-campus-muted text-center py-8">No events. Add some above.</p> : (
          <div className="space-y-2">
            {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(ev => (
              <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-campus-border">
                <div className="text-center shrink-0 w-10">
                  <div className="text-xs text-campus-muted">{new Date(ev.date).toLocaleDateString("en-IN", { month: "short" })}</div>
                  <div className="text-xl font-bold font-display text-teal-600">{new Date(ev.date).getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 capitalize">{ev.category}</span>
                    {ev.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Featured</span>}
                  </div>
                  <p className="text-sm font-medium text-campus-text">{ev.title}</p>
                  <p className="text-xs text-campus-muted">{ev.venue} · {ev.startTime}–{ev.endTime}</p>
                </div>
                <button onClick={() => deleteEvent(ev.id)} className="btn-ghost text-rose-600 p-1 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Academics Admin ────────────────────────────────────────────────────────
function AcademicsAdmin({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [data, setData] = useState<any>({ exams: [], calendar: [], courses: [] });
  const [section, setSection] = useState<"exams" | "calendar" | "courses">("exams");
  const [examForm, setExamForm] = useState({ courseCode: "", courseName: "", examDate: "", examTime: "", venue: "", duration: "3 hours", type: "mid-term" });
  const [calForm, setCalForm] = useState({ title: "", date: "", endDate: "", type: "exam", description: "" });
  const [courseForm, setCourseForm] = useState({ courseCode: "", courseName: "", credits: 4, instructor: "", schedule: "", topics: "", textbooks: "" });

  async function load() {
    const r = await fetch(`${MCP.academics}/admin/data`);
    setData(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function addExam() {
    if (!examForm.courseCode || !examForm.examDate) return showToast("Course code and date required", "error");
    await fetch(`${MCP.academics}/admin/exams`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(examForm) });
    showToast("Exam added!"); setExamForm({ courseCode: "", courseName: "", examDate: "", examTime: "", venue: "", duration: "3 hours", type: "mid-term" }); load();
  }

  async function addCalEntry() {
    if (!calForm.title || !calForm.date) return showToast("Title and date required", "error");
    await fetch(`${MCP.academics}/admin/calendar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(calForm) });
    showToast("Calendar entry added!"); setCalForm({ title: "", date: "", endDate: "", type: "exam", description: "" }); load();
  }

  async function addCourse() {
    if (!courseForm.courseCode || !courseForm.courseName) return showToast("Code and name required", "error");
    const course = { ...courseForm, credits: +courseForm.credits, topics: courseForm.topics.split("\n").filter(Boolean), textbooks: courseForm.textbooks.split("\n").filter(Boolean), gradingPolicy: { "Mid-Term": 25, "End-Term": 40, "Assignments": 20, "Lab": 15 } };
    await fetch(`${MCP.academics}/admin/courses`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(course) });
    showToast("Course added!"); setCourseForm({ courseCode: "", courseName: "", credits: 4, instructor: "", schedule: "", topics: "", textbooks: "" }); load();
  }

  const examTypes = ["mid-term", "end-term", "quiz", "practical"];
  const calTypes = ["exam", "holiday", "deadline", "event", "registration"];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["exams", "calendar", "courses"] as const).map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${section === s ? "bg-rose-50 border border-rose-200 text-rose-700 shadow-sm" : "text-campus-muted hover:text-campus-text border border-transparent hover:bg-gray-100"}`}>
            {s}
          </button>
        ))}
      </div>

      {section === "exams" && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-campus-text mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-600" /> Add Exam
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input-field" placeholder="Course code (e.g. CS301)" value={examForm.courseCode} onChange={e => setExamForm({ ...examForm, courseCode: e.target.value })} />
              <input className="input-field" placeholder="Course name" value={examForm.courseName} onChange={e => setExamForm({ ...examForm, courseName: e.target.value })} />
              <input type="date" className="input-field" value={examForm.examDate} onChange={e => setExamForm({ ...examForm, examDate: e.target.value })} />
              <input className="input-field" placeholder="Time (e.g. 9:00 AM)" value={examForm.examTime} onChange={e => setExamForm({ ...examForm, examTime: e.target.value })} />
              <input className="input-field" placeholder="Venue" value={examForm.venue} onChange={e => setExamForm({ ...examForm, venue: e.target.value })} />
              <select className="input-field" value={examForm.type} onChange={e => setExamForm({ ...examForm, type: e.target.value })}>
                {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn-primary mt-4" onClick={addExam}><Plus className="w-4 h-4" /> Add Exam</button>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-medium text-campus-text mb-3">Scheduled Exams ({(data.exams || []).length})</h3>
            <div className="space-y-2">
              {(data.exams || []).sort((a: any, b: any) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()).map((ex: any) => (
                <div key={ex.courseCode} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-campus-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-campus-text">{ex.courseName} <span className="font-mono text-xs text-campus-accent ml-1">{ex.courseCode}</span></p>
                    <p className="text-xs text-campus-muted">{new Date(ex.examDate).toLocaleDateString("en-IN")} · {ex.examTime} · {ex.venue} · <span className="capitalize">{ex.type}</span></p>
                  </div>
                  <button onClick={async () => { await fetch(`${MCP.academics}/admin/exams/${ex.courseCode}`, { method: "DELETE" }); showToast("Deleted"); load(); }} className="btn-ghost text-rose-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "calendar" && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-campus-text mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-600" /> Add Calendar Entry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input-field md:col-span-2" placeholder="Title *" value={calForm.title} onChange={e => setCalForm({ ...calForm, title: e.target.value })} />
              <input type="date" className="input-field" value={calForm.date} onChange={e => setCalForm({ ...calForm, date: e.target.value })} />
              <input type="date" className="input-field" value={calForm.endDate} onChange={e => setCalForm({ ...calForm, endDate: e.target.value })} placeholder="End date (optional)" />
              <select className="input-field" value={calForm.type} onChange={e => setCalForm({ ...calForm, type: e.target.value })}>
                {calTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input-field" placeholder="Description (optional)" value={calForm.description} onChange={e => setCalForm({ ...calForm, description: e.target.value })} />
            </div>
            <button className="btn-primary mt-4" onClick={addCalEntry}><Plus className="w-4 h-4" /> Add Entry</button>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-medium text-campus-text mb-3">Calendar ({(data.calendar || []).length} entries)</h3>
            <div className="space-y-2">
              {(data.calendar || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((entry: any) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-campus-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-campus-text">{entry.title} <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-campus-muted ml-1 capitalize">{entry.type}</span></p>
                    <p className="text-xs text-campus-muted">{new Date(entry.date).toLocaleDateString("en-IN")}{entry.endDate ? ` – ${new Date(entry.endDate).toLocaleDateString("en-IN")}` : ""}</p>
                  </div>
                  <button onClick={async () => { await fetch(`${MCP.academics}/admin/calendar/${entry.id}`, { method: "DELETE" }); showToast("Deleted"); load(); }} className="btn-ghost text-rose-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {section === "courses" && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="font-display font-semibold text-campus-text mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-600" /> Add Course
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input-field" placeholder="Course code (e.g. CS301)" value={courseForm.courseCode} onChange={e => setCourseForm({ ...courseForm, courseCode: e.target.value })} />
              <input className="input-field" placeholder="Course name" value={courseForm.courseName} onChange={e => setCourseForm({ ...courseForm, courseName: e.target.value })} />
              <input className="input-field" placeholder="Instructor" value={courseForm.instructor} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })} />
              <input type="number" className="input-field" placeholder="Credits" value={courseForm.credits} onChange={e => setCourseForm({ ...courseForm, credits: +e.target.value })} />
              <input className="input-field md:col-span-2" placeholder="Schedule (e.g. Mon/Wed/Fri 10:00–11:00 AM)" value={courseForm.schedule} onChange={e => setCourseForm({ ...courseForm, schedule: e.target.value })} />
              <textarea className="input-field resize-none" rows={3} placeholder="Topics (one per line)" value={courseForm.topics} onChange={e => setCourseForm({ ...courseForm, topics: e.target.value })} />
              <textarea className="input-field resize-none" rows={3} placeholder="Textbooks (one per line)" value={courseForm.textbooks} onChange={e => setCourseForm({ ...courseForm, textbooks: e.target.value })} />
            </div>
            <button className="btn-primary mt-4" onClick={addCourse}><Plus className="w-4 h-4" /> Add Course</button>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-medium text-campus-text mb-3">Courses ({(data.courses || []).length})</h3>
            <div className="space-y-2">
              {(data.courses || []).map((c: any) => (
                <div key={c.courseCode} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-campus-border">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-campus-text">{c.courseName} <span className="font-mono text-xs text-campus-accent ml-1">{c.courseCode}</span></p>
                    <p className="text-xs text-campus-muted">{c.credits} credits · {c.instructor} · {c.schedule}</p>
                  </div>
                  <button onClick={async () => { await fetch(`${MCP.academics}/admin/courses/${c.courseCode}`, { method: "DELETE" }); showToast("Deleted"); load(); }} className="btn-ghost text-rose-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
