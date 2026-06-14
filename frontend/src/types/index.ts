// ─── MCP Server Types ──────────────────────────────────────────────────────

export type MCPServerName = "library" | "cafeteria" | "events" | "academics";

export interface MCPServer {
  name: MCPServerName;
  label: string;
  description: string;
  url: string;
  icon: string;
  color: string;
  tools: MCPTool[];
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface MCPCallResult {
  server: MCPServerName;
  tool: string;
  data: unknown;
  error?: string;
  latencyMs: number;
}

// ─── Library Types ─────────────────────────────────────────────────────────

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  available: boolean;
  totalCopies: number;
  availableCopies: number;
  location: string;
  dueDate?: string;
  coverColor: string;
}

export interface LibrarySearchResult {
  books: LibraryBook[];
  total: number;
  query: string;
}

export interface LibraryHours {
  day: string;
  open: string;
  close: string;
  isToday: boolean;
}

// ─── Cafeteria Types ───────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  category: string;
  tags: string[];
  available: boolean;
  rating: number;
  isVeg: boolean;
}

export interface DailyMenu {
  date: string;
  meals: Record<MealType, MenuItem[]>;
}

export interface CafeteriaStatus {
  isOpen: boolean;
  currentMeal: MealType | null;
  nextMealTime: string;
  crowdLevel: "low" | "medium" | "high";
  waitTimeMinutes: number;
}

// ─── Events Types ──────────────────────────────────────────────────────────

export type EventCategory =
  | "academic"
  | "cultural"
  | "sports"
  | "technical"
  | "workshop"
  | "seminar"
  | "fest";

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  organizer: string;
  registrationRequired: boolean;
  registrationLink?: string;
  capacity?: number;
  registeredCount?: number;
  tags: string[];
  featured: boolean;
}

export interface EventsQuery {
  category?: EventCategory;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// ─── Academics Types ───────────────────────────────────────────────────────

export interface AcademicCalendarEntry {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: "exam" | "holiday" | "deadline" | "event" | "registration";
  description?: string;
}

export interface CourseSyllabus {
  courseCode: string;
  courseName: string;
  credits: number;
  instructor: string;
  schedule: string;
  topics: string[];
  textbooks: string[];
  gradingPolicy: Record<string, number>;
}

export interface ExamSchedule {
  courseCode: string;
  courseName: string;
  examDate: string;
  examTime: string;
  venue: string;
  duration: string;
  type: "mid-term" | "end-term" | "quiz" | "practical";
}

export interface PolicyQuery {
  section: string;
  content: string;
  source: string;
}

// ─── AI Chat Types ─────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface ToolCall {
  id: string;
  server: MCPServerName;
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "success" | "error";
  latencyMs?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  sources?: MCPServerName[];
}

// ─── Dashboard Types ───────────────────────────────────────────────────────

export interface ServerStatus {
  server: MCPServerName;
  isOnline: boolean;
  latencyMs?: number;
  lastChecked: Date;
}

export interface DashboardStats {
  availableBooks: number;
  todayEvents: number;
  nextMealIn: string;
  upcomingExams: number;
}
