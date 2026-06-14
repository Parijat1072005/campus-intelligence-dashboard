import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3004;

const DB_PATH = path.join(__dirname, "../data/db.json");
function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, "utf8")); }
  catch { return { exams: [], calendar: [], courses: [], policies: [] }; }
}
function writeDB(data: object) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

app.get("/health", (_req, res) => res.json({ status: "ok", server: "academics" }));
app.get("/tools", (_req, res) => res.json({ server: "academics", tools: ["get_exam_schedule","get_calendar","get_course_info","query_policy"] }));

app.post("/tools/get_exam_schedule", (req, res) => {
  const { course_code, exam_type } = req.body;
  let { exams } = readDB();
  if (course_code) exams = exams.filter((e: any) => e.courseCode.toLowerCase().includes(course_code.toLowerCase()));
  if (exam_type) exams = exams.filter((e: any) => e.type === exam_type);
  exams.sort((a: any, b: any) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  res.json({ result: { exams, total: exams.length } });
});

app.post("/tools/get_calendar", (req, res) => {
  const { month, type } = req.body;
  let { calendar } = readDB();
  if (month) calendar = calendar.filter((e: any) => new Date(e.date).toLocaleString("en-US",{month:"long"}).toLowerCase().includes(month.toLowerCase()));
  if (type) calendar = calendar.filter((e: any) => e.type === type);
  calendar.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json({ result: { entries: calendar, total: calendar.length } });
});

app.post("/tools/get_course_info", (req, res) => {
  const { course_code, course_name } = req.body;
  const { courses } = readDB();
  let course = course_code ? courses.find((c: any) => c.courseCode.toUpperCase() === course_code.toUpperCase()) : null;
  if (!course && course_name) course = courses.find((c: any) => c.courseName.toLowerCase().includes(course_name.toLowerCase()));
  if (!course) return res.json({ result: { found: false, message: "Course not found. Try a different code or name." } });
  res.json({ result: { found: true, course } });
});

app.post("/tools/query_policy", (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.json({ result: { error: "Provide a topic" } });
  const { policies } = readDB();
  const q = topic.toLowerCase();
  const matched = policies.find((p: any) => p.keywords.some((kw: string) => q.includes(kw)));
  if (!matched) return res.json({ result: { found: false, message: `No policy found for "${topic}". Try: attendance, grading, placement, hostel.` } });
  res.json({ result: { found: true, result: { section: matched.section, content: matched.content } } });
});

// ── ADMIN API ─────────────────────────────────────────────────────────────
app.get("/admin/data", (_req, res) => res.json(readDB()));

// Exams
app.post("/admin/exams", (req, res) => {
  const db = readDB();
  db.exams.push(req.body);
  writeDB(db);
  res.json({ success: true });
});
app.put("/admin/exams/:code", (req, res) => {
  const db = readDB();
  const idx = db.exams.findIndex((e: any) => e.courseCode === req.params.code);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.exams[idx] = { ...db.exams[idx], ...req.body };
  writeDB(db); res.json({ success: true });
});
app.delete("/admin/exams/:code", (req, res) => {
  const db = readDB();
  db.exams = db.exams.filter((e: any) => e.courseCode !== req.params.code);
  writeDB(db); res.json({ success: true });
});

// Calendar
app.post("/admin/calendar", (req, res) => {
  const db = readDB();
  db.calendar.push({ ...req.body, id: `ac${Date.now()}` });
  writeDB(db); res.json({ success: true });
});
app.delete("/admin/calendar/:id", (req, res) => {
  const db = readDB();
  db.calendar = db.calendar.filter((e: any) => e.id !== req.params.id);
  writeDB(db); res.json({ success: true });
});

// Courses
app.post("/admin/courses", (req, res) => {
  const db = readDB();
  db.courses.push(req.body);
  writeDB(db); res.json({ success: true });
});
app.delete("/admin/courses/:code", (req, res) => {
  const db = readDB();
  db.courses = db.courses.filter((c: any) => c.courseCode !== req.params.code);
  writeDB(db); res.json({ success: true });
});

app.listen(PORT, () => console.log(`🎓 Academics MCP → http://localhost:${PORT}`));
