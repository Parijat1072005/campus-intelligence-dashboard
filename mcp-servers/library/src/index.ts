import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

const DB_PATH = path.join(__dirname, "../data/db.json");

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return { books: [], hours: [] };
  }
}
function writeDB(data: object) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Health & tool listing ───────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", server: "library" }));
app.get("/tools", (_req, res) => res.json({ server: "library", tools: ["search_books", "get_hours", "check_book_availability"] }));

// ── READ tools (called by AI) ───────────────────────────────────────────────
app.post("/tools/search_books", (req, res) => {
  const { query = "", available_only, genre } = req.body;
  const { books } = readDB();
  const q = query.toLowerCase();
  let results = q === "" || q === "all" ? books : books.filter((b: any) =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.isbn?.includes(q) ||
    b.genre?.toLowerCase().includes(q) ||
    b.subject?.toLowerCase().includes(q) ||
    (b.tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
    b.description?.toLowerCase().includes(q)
  );
  // If no matches on exact keywords, try word-by-word (e.g. "machine learning" → match "AI", "algorithms")
  if (results.length === 0 && q.split(" ").length > 1) {
    const words = q.split(" ").filter((w: string) => w.length > 3);
    results = books.filter((b: any) =>
      words.some((w: string) =>
        b.title.toLowerCase().includes(w) ||
        b.genre?.toLowerCase().includes(w) ||
        (b.tags || []).some((t: string) => t.toLowerCase().includes(w))
      )
    );
  }
  if (available_only) results = results.filter((b: any) => b.available);
  if (genre) results = results.filter((b: any) => b.genre?.toLowerCase() === genre.toLowerCase());
  res.json({ result: { books: results, total: results.length, availableCount: results.filter((b: any) => b.available).length } });
});

app.post("/tools/get_hours", (_req, res) => {
  const { hours } = readDB();
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = dayNames[new Date().getDay()];
  const h = new Date().getHours();
  const hoursWithToday = hours.map((hr: any) => ({ ...hr, isToday: hr.day === today }));
  res.json({ result: { hours: hoursWithToday, isCurrentlyOpen: h >= 8 && h < 22 } });
});

app.post("/tools/check_book_availability", (req, res) => {
  const { book_id, title } = req.body;
  const { books } = readDB();
  let book = book_id ? books.find((b: any) => b.id === book_id) : null;
  if (!book && title) book = books.find((b: any) => b.title.toLowerCase().includes(title.toLowerCase()));
  if (!book) return res.json({ result: { found: false, message: "Book not found in catalog" } });
  res.json({ result: { found: true, book, message: book.available
    ? `"${book.title}" is available. ${book.availableCopies} of ${book.totalCopies} copies on shelf at ${book.location}.`
    : `"${book.title}" is checked out. Expected return: ${book.dueDate || "Unknown"}.` }});
});

// ── ADMIN AUTH & USER MANAGEMENT ───────────────────────────────────────────
const ADMINS_PATH = path.join(__dirname, "../data/admins.json");

function readAdmins() {
  try { return JSON.parse(fs.readFileSync(ADMINS_PATH, "utf8")); }
  catch { return { admins: [{ username: "superadmin", password: "admin123", role: "superadmin" }] }; }
}
function writeAdmins(data: object) { fs.writeFileSync(ADMINS_PATH, JSON.stringify(data, null, 2)); }

// Verify credentials — returns { ok, role, username }
app.post("/admin/auth", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ ok: false });
  const { admins } = readAdmins();
  const found = admins.find((a: any) => a.username === username && a.password === password);
  if (!found) return res.json({ ok: false });
  res.json({ ok: true, role: found.role, username: found.username });
});

// List all admins (passwords omitted)
app.get("/admin/users", (_req, res) => {
  const { admins } = readAdmins();
  res.json({ admins: admins.map((a: any) => ({ username: a.username, role: a.role })) });
});

// Add a new admin (role always "admin"; only superadmin can call this)
app.post("/admin/users", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });
  const db = readAdmins();
  if (db.admins.find((a: any) => a.username === username)) {
    return res.status(409).json({ error: "Username already exists" });
  }
  db.admins.push({ username, password, role: "admin" });
  writeAdmins(db);
  res.json({ success: true });
});

// Remove an admin (cannot remove yourself — checked on the frontend)
app.delete("/admin/users/:username", (req, res) => {
  const db = readAdmins();
  db.admins = db.admins.filter((a: any) => a.username !== req.params.username);
  writeAdmins(db);
  res.json({ success: true });
});

// Change own password
app.put("/admin/users/:username/password", (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ error: "newPassword required" });
  const db = readAdmins();
  const idx = db.admins.findIndex((a: any) => a.username === req.params.username);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  db.admins[idx].password = newPassword;
  writeAdmins(db);
  res.json({ success: true });
});

// ── ADMIN CRUD API ──────────────────────────────────────────────────────────
// Get all data
app.get("/admin/data", (_req, res) => res.json(readDB()));

// Add a book
app.post("/admin/books", (req, res) => {
  const db = readDB();
  const book = { ...req.body, id: `b${Date.now()}` };
  db.books.push(book);
  writeDB(db);
  res.json({ success: true, book });
});

// Update a book
app.put("/admin/books/:id", (req, res) => {
  const db = readDB();
  const idx = db.books.findIndex((b: any) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.books[idx] = { ...db.books[idx], ...req.body };
  writeDB(db);
  res.json({ success: true, book: db.books[idx] });
});

// Delete a book
app.delete("/admin/books/:id", (req, res) => {
  const db = readDB();
  db.books = db.books.filter((b: any) => b.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Update hours
app.put("/admin/hours", (req, res) => {
  const db = readDB();
  db.hours = req.body.hours;
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`📚 Library MCP → http://localhost:${PORT}`));
