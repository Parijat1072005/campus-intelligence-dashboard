import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3002;

const DB_PATH = path.join(__dirname, "../data/db.json");
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
  catch { return { menu: { breakfast: [], lunch: [], dinner: [], snacks: [] } }; }
}
function writeDB(data: object) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

function getCafeteriaStatus() {
  const h = new Date().getHours(), m = new Date().getMinutes();
  const t = h * 60 + m;
  let isOpen = false, currentMeal: string | null = null, nextMealTime = "";
  if (t >= 450 && t < 570) { isOpen = true; currentMeal = "breakfast"; nextMealTime = "12:00 PM (Lunch)"; }
  else if (t >= 720 && t < 870) { isOpen = true; currentMeal = "lunch"; nextMealTime = "4:00 PM (Snacks)"; }
  else if (t >= 960 && t < 1080) { isOpen = true; currentMeal = "snacks"; nextMealTime = "7:00 PM (Dinner)"; }
  else if (t >= 1140 && t < 1260) { isOpen = true; currentMeal = "dinner"; nextMealTime = "7:30 AM (Breakfast)"; }
  else { nextMealTime = t < 450 ? "7:30 AM (Breakfast)" : t < 720 ? "12:00 PM (Lunch)" : t < 960 ? "4:00 PM (Snacks)" : t < 1140 ? "7:00 PM (Dinner)" : "7:30 AM tomorrow"; }
  const levels = ["low","medium","high","medium","low"] as const;
  const crowdLevel = levels[Math.floor(Math.random() * levels.length)];
  return { isOpen, currentMeal, nextMealTime, crowdLevel, waitTimeMinutes: { low:5, medium:15, high:25 }[crowdLevel] };
}

app.get("/health", (_req, res) => res.json({ status: "ok", server: "cafeteria" }));
app.get("/tools", (_req, res) => res.json({ server: "cafeteria", tools: ["get_status","get_todays_menu","get_weekly_menu"] }));

app.post("/tools/get_status", (_req, res) => res.json({ result: getCafeteriaStatus() }));

app.post("/tools/get_todays_menu", (req, res) => {
  const { meal = "all", veg_only } = req.body;
  const { menu } = readDB();
  const today = new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  if (meal === "all") {
    const meals: Record<string, any> = {};
    for (const [key, items] of Object.entries(menu)) {
      meals[key] = veg_only ? (items as any[]).filter((i: any) => i.isVeg) : items;
    }
    return res.json({ result: { date: today, meals } });
  }
  const items: any[] = menu[meal] ?? [];
  const filtered = veg_only ? items.filter((i: any) => i.isVeg) : items;
  res.json({ result: { date: today, meal, items: filtered, count: filtered.length } });
});

app.post("/tools/get_weekly_menu", (req, res) => {
  const { meal = "lunch" } = req.body;
  const { menu } = readDB();
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  res.json({ result: { meal, weekly: days.map(day => ({ day, items: menu[meal] ?? [] })) } });
});

// ── ADMIN API ──────────────────────────────────────────────────────────────
app.get("/admin/data", (_req, res) => res.json(readDB()));

app.post("/admin/menu/:meal", (req, res) => {
  const db = readDB();
  const meal = req.params.meal;
  if (!db.menu[meal]) db.menu[meal] = [];
  const item = { ...req.body, id: `${meal.slice(0,2)}${Date.now()}` };
  db.menu[meal].push(item);
  writeDB(db);
  res.json({ success: true, item });
});

app.put("/admin/menu/:meal/:id", (req, res) => {
  const db = readDB();
  const { meal, id } = req.params;
  const idx = (db.menu[meal] ?? []).findIndex((i: any) => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.menu[meal][idx] = { ...db.menu[meal][idx], ...req.body };
  writeDB(db);
  res.json({ success: true });
});

app.delete("/admin/menu/:meal/:id", (req, res) => {
  const db = readDB();
  const { meal, id } = req.params;
  db.menu[meal] = (db.menu[meal] ?? []).filter((i: any) => i.id !== id);
  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`🍽️  Cafeteria MCP → http://localhost:${PORT}`));
