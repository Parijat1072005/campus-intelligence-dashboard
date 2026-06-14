import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3003;

const DB_PATH = path.join(__dirname, "../data/db.json");
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
  catch { return { events: [] }; }
}
function writeDB(data: object) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

app.get("/health", (_req, res) => res.json({ status: "ok", server: "events" }));
app.get("/tools", (_req, res) => res.json({ server: "events", tools: ["get_upcoming","get_today","get_featured"] }));

app.post("/tools/get_upcoming", (req, res) => {
  const { days_ahead = 7, category, search } = req.body;
  const { events } = readDB();
  const now = new Date(); now.setHours(0,0,0,0);
  const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() + Number(days_ahead));
  let results = events.filter((e: any) => {
    const d = new Date(e.date);
    return d >= now && d <= cutoff;
  });
  if (category) results = results.filter((e: any) => e.category === category);
  if (search) { const q = search.toLowerCase(); results = results.filter((e: any) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || (e.tags||[]).some((t: string) => t.toLowerCase().includes(q))); }
  results.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json({ result: { events: results, total: results.length } });
});

app.post("/tools/get_today", (_req, res) => {
  const { events } = readDB();
  const todayStr = new Date().toISOString().split("T")[0];
  const results = events.filter((e: any) => e.date === todayStr);
  res.json({ result: { events: results, total: results.length, date: todayStr } });
});

app.post("/tools/get_featured", (_req, res) => {
  const { events } = readDB();
  const results = events.filter((e: any) => e.featured).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json({ result: { events: results, total: results.length } });
});

// ── ADMIN API ─────────────────────────────────────────────────────────────
app.get("/admin/data", (_req, res) => res.json(readDB()));

app.post("/admin/events", (req, res) => {
  const db = readDB();
  const event = { ...req.body, id: `ev${Date.now()}` };
  db.events.push(event);
  writeDB(db);
  res.json({ success: true, event });
});

app.put("/admin/events/:id", (req, res) => {
  const db = readDB();
  const idx = db.events.findIndex((e: any) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.events[idx] = { ...db.events[idx], ...req.body };
  writeDB(db);
  res.json({ success: true });
});

app.delete("/admin/events/:id", (req, res) => {
  const db = readDB();
  db.events = db.events.filter((e: any) => e.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`📅 Events MCP → http://localhost:${PORT}`));
