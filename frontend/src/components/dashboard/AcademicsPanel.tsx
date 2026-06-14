"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Calendar, BookOpen, FileText, Search, Loader2, AlertCircle, Clock } from "lucide-react";
import { callMCPTool } from "@/lib/mcp-client";
import type { ExamSchedule, AcademicCalendarEntry, CourseSyllabus } from "@/types";
import { clsx } from "clsx";

type AcademicsTab = "exams" | "calendar" | "courses" | "policies";

const TABS: { id: AcademicsTab; label: string; icon: typeof GraduationCap }[] = [
  { id: "exams", label: "Exam Schedule", icon: AlertCircle },
  { id: "calendar", label: "Academic Calendar", icon: Calendar },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "policies", label: "Policies", icon: FileText },
];

export function AcademicsPanel() {
  const [activeTab, setActiveTab] = useState<AcademicsTab>("exams");
  const [exams, setExams] = useState<ExamSchedule[]>([]);
  const [calendar, setCalendar] = useState<AcademicCalendarEntry[]>([]);
  const [course, setCourse] = useState<CourseSyllabus | null>(null);
  const [policyResult, setPolicyResult] = useState<{ section: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");
  const [policyQuery, setPolicyQuery] = useState("");

  useEffect(() => {
    if (activeTab === "exams" && exams.length === 0) fetchExams();
    if (activeTab === "calendar" && calendar.length === 0) fetchCalendar();
  }, [activeTab]);

  async function fetchExams() {
    setLoading(true);
    const r = await callMCPTool("academics", "get_exam_schedule", {});
    if (r.data && !r.error) {
      const data = r.data as { exams?: ExamSchedule[] };
      setExams(data.exams ?? []);
    }
    setLoading(false);
  }

  async function fetchCalendar() {
    setLoading(true);
    const r = await callMCPTool("academics", "get_calendar", {});
    if (r.data && !r.error) {
      const data = r.data as { entries?: AcademicCalendarEntry[] };
      setCalendar(data.entries ?? []);
    }
    setLoading(false);
  }

  async function fetchCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!courseQuery.trim()) return;
    setLoading(true);
    const r = await callMCPTool("academics", "get_course_info", {
      course_code: courseQuery.trim().toUpperCase(),
      course_name: courseQuery.trim(),
    });
    if (r.data && !r.error) {
      const data = r.data as { course?: CourseSyllabus };
      setCourse(data.course ?? null);
    }
    setLoading(false);
  }

  async function fetchPolicy(e: React.FormEvent) {
    e.preventDefault();
    if (!policyQuery.trim()) return;
    setLoading(true);
    const r = await callMCPTool("academics", "query_policy", { topic: policyQuery.trim() });
    if (r.data && !r.error) {
      const data = r.data as { result?: { section: string; content: string } };
      setPolicyResult(data.result ?? null);
    }
    setLoading(false);
  }

  const examTypeColor: Record<string, string> = {
    "mid-term": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "end-term": "bg-rose-500/20 text-rose-400 border-rose-500/30",
    quiz: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    practical: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  };

  const calTypeColor: Record<string, string> = {
    exam: "bg-rose-500/20 text-rose-400",
    holiday: "bg-emerald-500/20 text-emerald-400",
    deadline: "bg-amber-500/20 text-amber-400",
    event: "bg-blue-500/20 text-blue-400",
    registration: "bg-indigo-500/20 text-indigo-400",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-campus-text">Academics</h2>
          <p className="text-campus-muted text-sm">Exams, calendar, courses, and policies</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-1.5 flex gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 flex-1 justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                  : "text-campus-muted hover:text-campus-text hover:bg-campus-border"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-campus-accent animate-spin" />
        </div>
      ) : (
        <>
          {/* Exams */}
          {activeTab === "exams" && (
            <div className="space-y-3">
              <p className="section-label">{exams.length} upcoming exams</p>
              {exams.map((exam, i) => {
                const d = new Date(exam.examDate);
                const daysLeft = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
                return (
                  <div key={i} className="glass-card p-5 hover:border-rose-500/30 transition-all card-reveal flex gap-4">
                    <div className="text-center shrink-0 min-w-[56px]">
                      <div className="text-xs text-campus-muted">{d.toLocaleDateString("en-IN", { month: "short" })}</div>
                      <div className="text-2xl font-bold font-display text-rose-400">{d.getDate()}</div>
                      <div className={clsx("text-xs font-medium", daysLeft <= 3 ? "text-rose-400" : "text-campus-muted")}>
                        {daysLeft <= 0 ? "Today" : `${daysLeft}d`}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx("badge border", examTypeColor[exam.type])}>
                          {exam.type}
                        </span>
                        <span className="font-mono text-xs text-campus-muted">{exam.courseCode}</span>
                      </div>
                      <h4 className="font-medium text-campus-text mb-2">{exam.courseName}</h4>
                      <div className="flex gap-4 text-xs text-campus-muted">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exam.examTime} · {exam.duration}</span>
                        <span>{exam.venue}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Calendar */}
          {activeTab === "calendar" && (
            <div className="space-y-3">
              <p className="section-label">{calendar.length} calendar entries</p>
              {calendar.map((entry) => (
                <div key={entry.id} className="glass-card p-4 flex gap-4 hover:border-campus-accent/30 transition-all card-reveal">
                  <div className={clsx("shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", calTypeColor[entry.type])}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-campus-text">{entry.title}</h4>
                    <div className="text-xs text-campus-muted mt-0.5">
                      {new Date(entry.date).toLocaleDateString("en-IN", { weekday: "short", month: "long", day: "numeric" })}
                      {entry.endDate && ` – ${new Date(entry.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`}
                    </div>
                    {entry.description && <p className="text-xs text-campus-dim mt-1">{entry.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Courses */}
          {activeTab === "courses" && (
            <div className="space-y-4">
              <form onSubmit={fetchCourse} className="flex gap-3">
                <input
                  className="input-field flex-1"
                  placeholder="Enter course code (e.g. CS301) or name…"
                  value={courseQuery}
                  onChange={(e) => setCourseQuery(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  <Search className="w-4 h-4" /> Search
                </button>
              </form>

              {course && (
                <div className="glass-card p-6 space-y-4 card-reveal">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-sm text-campus-accent mb-1">{course.courseCode}</div>
                      <h3 className="font-display text-xl font-bold text-campus-text">{course.courseName}</h3>
                      <p className="text-campus-muted text-sm mt-1">
                        {course.credits} Credits · {course.instructor} · {course.schedule}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="section-label mb-2">Topics</p>
                      <ul className="space-y-1">
                        {course.topics.map((t, i) => (
                          <li key={i} className="text-sm text-campus-muted flex items-start gap-2">
                            <span className="text-campus-accent shrink-0 mt-0.5">·</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="section-label mb-2">Grading</p>
                      {Object.entries(course.gradingPolicy).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm py-1 border-b border-campus-border last:border-0">
                          <span className="text-campus-muted">{k}</span>
                          <span className="text-campus-text font-medium">{v}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Policies */}
          {activeTab === "policies" && (
            <div className="space-y-4">
              <form onSubmit={fetchPolicy} className="flex gap-3">
                <input
                  className="input-field flex-1"
                  placeholder="Ask about a policy: attendance, grading, re-exam, hostel…"
                  value={policyQuery}
                  onChange={(e) => setPolicyQuery(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  <Search className="w-4 h-4" /> Search
                </button>
              </form>

              {policyResult && (
                <div className="glass-card p-6 card-reveal">
                  <div className="font-mono text-xs text-campus-accent mb-2">{policyResult.section}</div>
                  <p className="text-campus-text text-sm leading-relaxed whitespace-pre-wrap">{policyResult.content}</p>
                </div>
              )}

              {/* Common policy shortcuts */}
              <div>
                <p className="section-label mb-3">Common Queries</p>
                <div className="flex flex-wrap gap-2">
                  {["attendance requirements", "late submission policy", "re-examination rules", "grading system", "hostel rules", "placement eligibility"].map((q) => (
                    <button
                      key={q}
                      onClick={() => setPolicyQuery(q)}
                      className="px-3 py-1.5 rounded-full border border-campus-border hover:border-campus-accent text-campus-muted hover:text-campus-text text-sm transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
