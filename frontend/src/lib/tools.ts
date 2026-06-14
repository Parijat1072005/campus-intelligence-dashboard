// OpenAI-compatible tool definitions for Grok (xAI)
// Grok uses the same function-calling format as OpenAI

export interface GrokTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export const CAMPUS_TOOLS: GrokTool[] = [
  // ── Library Tools ──────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "library__search_books",
      description:
        "Search for books in the campus library by title, author, subject, or ISBN. Returns availability, location, and copy counts.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search term: book title, author name, ISBN, or subject",
          },
          available_only: {
            type: "boolean",
            description: "If true, return only books currently available for checkout",
          },
          genre: {
            type: "string",
            description:
              "Filter by genre: fiction, non-fiction, science, engineering, arts, history",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "library__get_hours",
      description:
        "Get library opening hours for the week, including today's hours and any holiday closures.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "library__check_book_availability",
      description:
        "Check if a specific book (by title or ISBN) is available right now, and when it will be returned if not.",
      parameters: {
        type: "object",
        properties: {
          book_id: { type: "string", description: "Book ID from search results" },
          title: { type: "string", description: "Book title to look up" },
        },
      },
    },
  },

  // ── Cafeteria Tools ────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "cafeteria__get_todays_menu",
      description:
        "Get today's cafeteria menu for breakfast, lunch, dinner, or all meals. Includes prices, calories, and dietary tags.",
      parameters: {
        type: "object",
        properties: {
          meal: {
            type: "string",
            enum: ["breakfast", "lunch", "dinner", "snacks", "all"],
            description: "Which meal to get the menu for",
          },
          veg_only: {
            type: "boolean",
            description: "If true, return only vegetarian items",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cafeteria__get_status",
      description:
        "Get the current status of the cafeteria: open/closed, crowd level, estimated wait time, and next meal time.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cafeteria__get_weekly_menu",
      description:
        "Get the cafeteria menu for the entire week to plan meals in advance.",
      parameters: {
        type: "object",
        properties: {
          meal: {
            type: "string",
            enum: ["breakfast", "lunch", "dinner", "all"],
          },
        },
      },
    },
  },

  // ── Events Tools ───────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "events__get_upcoming",
      description:
        "Get upcoming campus events. Can filter by category, date range, or search term. Returns event details, venue, and registration info.",
      parameters: {
        type: "object",
        properties: {
          days_ahead: {
            type: "number",
            description: "Number of days ahead to look (default: 7)",
          },
          category: {
            type: "string",
            enum: [
              "academic",
              "cultural",
              "sports",
              "technical",
              "workshop",
              "seminar",
              "fest",
            ],
            description: "Filter by event category",
          },
          search: {
            type: "string",
            description: "Search events by keyword",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "events__get_today",
      description: "Get all events happening today on campus.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "events__get_featured",
      description:
        "Get featured/highlighted campus events like major fests, important seminars, or flagship workshops.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },

  // ── Academics Tools ────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "academics__get_exam_schedule",
      description:
        "Get the upcoming exam schedule. Can filter by course code or exam type (mid-term, end-term, quiz).",
      parameters: {
        type: "object",
        properties: {
          course_code: {
            type: "string",
            description: "Filter by specific course code e.g. CS301",
          },
          exam_type: {
            type: "string",
            enum: ["mid-term", "end-term", "quiz", "practical"],
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "academics__get_calendar",
      description:
        "Get the academic calendar with important dates: exam periods, holidays, registration deadlines, and semester dates.",
      parameters: {
        type: "object",
        properties: {
          month: {
            type: "string",
            description: "Filter by month name e.g. July, August",
          },
          type: {
            type: "string",
            enum: ["exam", "holiday", "deadline", "event", "registration"],
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "academics__get_course_info",
      description:
        "Get syllabus, schedule, instructor, and grading policy for a course.",
      parameters: {
        type: "object",
        properties: {
          course_code: {
            type: "string",
            description: "Course code e.g. CS301, MA201",
          },
          course_name: {
            type: "string",
            description: "Course name to search for",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "academics__query_policy",
      description:
        "Query the academic handbook for policies on attendance, grading, examinations, placements, hostel rules, etc.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description:
              "Policy topic to look up e.g. attendance requirements, late submission, re-examination",
          },
        },
        required: ["topic"],
      },
    },
  },
];

export function parseToolName(name: string): { server: string; tool: string } {
  const [server, ...toolParts] = name.split("__");
  return { server, tool: toolParts.join("__") };
}
