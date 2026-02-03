import { Activity, BoardsState } from "@/types/types";

export const initialBoards: BoardsState = {
  activeBoardId: "board-1",

  boards: {
    /* =====================================================
       BOARD 1 — PROJECT KAMPUS (18 TASK)
    ====================================================== */
    "board-1": {
      id: "board-1",
      title: "Project Kampus",
      tasks: {
        "1": {
          id: "1",
          title: "Proposal TA",
          tags: ["dokumen"],
          priority: "high",
        },
        "2": {
          id: "2",
          title: "Studi Literatur",
          tags: ["research"],
          priority: "medium",
        },
        "3": {
          id: "3",
          title: "ERD Database",
          tags: ["database"],
          priority: "high",
        },
        "4": {
          id: "4",
          title: "DFD System",
          tags: ["analysis"],
          priority: "medium",
        },
        "5": {
          id: "5",
          title: "Setup Repo Git",
          tags: ["setup"],
          priority: "medium",
        },
        "6": {
          id: "6",
          title: "Setup Environment",
          tags: ["setup"],
          priority: "medium",
        },
        "7": {
          id: "7",
          title: "UI Wireframe",
          tags: ["ui", "ux"],
          priority: "medium",
        },
        "8": {
          id: "8",
          title: "Implement Auth",
          tags: ["auth"],
          priority: "high",
        },
        "9": {
          id: "9",
          title: "CRUD Mahasiswa",
          tags: ["backend"],
          priority: "medium",
        },
        "10": {
          id: "10",
          title: "CRUD Dosen",
          tags: ["backend"],
          priority: "medium",
        },
        "11": {
          id: "11",
          title: "Role & Permission",
          tags: ["security"],
          priority: "high",
        },
        "12": {
          id: "12",
          title: "Unit Testing",
          tags: ["testing"],
          priority: "low",
        },
        "13": {
          id: "13",
          title: "Integrasi Frontend",
          tags: ["frontend"],
          priority: "medium",
        },
        "14": { id: "14", title: "Bug Fixing", tags: ["bug"], priority: "low" },
        "15": {
          id: "15",
          title: "Optimasi Query",
          tags: ["database"],
          priority: "medium",
        },
        "16": { id: "16", title: "Dokumentasi Sistem", priority: "low" },
        "17": { id: "17", title: "Persiapan Sidang", priority: "high" },
        "18": { id: "18", title: "Presentasi Dosen", priority: "high" },
      },
      columns: {
        backlog: {
          id: "backlog",
          title: "Backlog",
          taskIds: ["2", "12", "16"],
        },
        todo: { id: "todo", title: "Todo", taskIds: ["1", "3", "4", "5", "6"] },
        doing: { id: "doing", title: "Doing", taskIds: ["7", "8", "9", "10"] },
        review: { id: "review", title: "Review", taskIds: ["11", "13", "15"] },
        done: { id: "done", title: "Done", taskIds: ["14", "17", "18"] },
      },
      activityLogs: [
        {
          id: "log-001",
          actor: "You",
          taskId: "1",
          fromColumnId: "backlog",
          toColumnId: "todo",
          createdAt: "2026-01-29T08:00:00.000Z",
        },
        {
          id: "log-002",
          actor: "You",
          taskId: "2",
          fromColumnId: "backlog",
          toColumnId: "todo",
          createdAt: "2026-01-29T08:05:00.000Z",
        },
        {
          id: "log-003",
          actor: "You",
          taskId: "3",
          fromColumnId: "backlog",
          toColumnId: "doing",
          createdAt: "2026-01-29T08:10:00.000Z",
        },
        {
          id: "log-004",
          actor: "You",
          taskId: "1",
          fromColumnId: "todo",
          toColumnId: "doing",
          createdAt: "2026-01-29T08:30:00.000Z",
        },
        {
          id: "log-005",
          actor: "You",
          taskId: "1",
          fromColumnId: "doing",
          toColumnId: "review",
          createdAt: "2026-01-29T09:00:00.000Z",
        },
      ],
      columnOrder: ["backlog", "todo", "doing", "done"],
    },

    /* =====================================================
       BOARD 2 — FREELANCE APP (16 TASK)
    ====================================================== */
    "board-2": {
      id: "board-2",
      title: "Freelance App",
      tasks: {
        "1": { id: "1", title: "Client Brief", priority: "high" },
        "2": { id: "2", title: "Requirement List", priority: "high" },
        "3": {
          id: "3",
          title: "UI Design",
          tags: ["design"],
          priority: "medium",
        },
        "4": {
          id: "4",
          title: "Landing Page",
          tags: ["frontend"],
          priority: "medium",
        },
        "5": { id: "5", title: "Auth User", priority: "high" },
        "6": { id: "6", title: "Payment Gateway", priority: "high" },
        "7": { id: "7", title: "API Integration", priority: "medium" },
        "8": { id: "8", title: "Deploy Staging", priority: "medium" },
        "9": { id: "9", title: "Bug Fixing", priority: "low" },
        "10": { id: "10", title: "Client Revisi UI", priority: "medium" },
        "11": { id: "11", title: "Performance Check", priority: "low" },
        "12": { id: "12", title: "SEO Basic", priority: "low" },
        "13": { id: "13", title: "Deploy Production", priority: "high" },
        "14": { id: "14", title: "Invoice Client", priority: "medium" },
        "15": { id: "15", title: "Maintenance Plan", priority: "low" },
        "16": { id: "16", title: "Project Handover", priority: "high" },
      },
      columns: {
        backlog: {
          id: "backlog",
          title: "Backlog",
          taskIds: ["11", "12", "15"],
        },
        todo: { id: "todo", title: "Todo", taskIds: ["1", "2", "3", "4"] },
        doing: { id: "doing", title: "Doing", taskIds: ["5", "6", "7", "8"] },
        review: { id: "review", title: "Review", taskIds: ["9", "10"] },
        done: { id: "done", title: "Done", taskIds: ["13", "14", "16"] },
      },
      activityLogs: [],
      columnOrder: ["backlog", "todo", "doing", "done"],
    },

    /* =====================================================
       BOARD 3 — STARTUP MVP (20 TASK)
    ====================================================== */
    "board-3": {
      id: "board-3",
      title: "Startup MVP",
      tasks: {
        "1": { id: "1", title: "Problem Validation", priority: "high" },
        "2": { id: "2", title: "Market Research", priority: "high" },
        "3": { id: "3", title: "User Persona", priority: "medium" },
        "4": { id: "4", title: "User Flow", priority: "medium" },
        "5": { id: "5", title: "Tech Stack Decision", priority: "high" },
        "6": { id: "6", title: "System Architecture", priority: "high" },
        "7": { id: "7", title: "Auth System", priority: "high" },
        "8": { id: "8", title: "Core Feature A", priority: "high" },
        "9": { id: "9", title: "Core Feature B", priority: "high" },
        "10": { id: "10", title: "Dashboard Admin", priority: "medium" },
        "11": { id: "11", title: "Analytics Setup", priority: "medium" },
        "12": { id: "12", title: "Logging System", priority: "low" },
        "13": { id: "13", title: "Monitoring", priority: "medium" },
        "14": { id: "14", title: "Security Review", priority: "high" },
        "15": { id: "15", title: "Load Testing", priority: "medium" },
        "16": { id: "16", title: "Bug Fixing", priority: "low" },
        "17": { id: "17", title: "Beta Release", priority: "high" },
        "18": { id: "18", title: "User Feedback", priority: "medium" },
        "19": { id: "19", title: "Iteration Improvement", priority: "medium" },
        "20": { id: "20", title: "Public Launch", priority: "high" },
      },
      columns: {
        backlog: {
          id: "backlog",
          title: "Backlog",
          taskIds: ["12", "15", "16"],
        },
        todo: { id: "todo", title: "Todo", taskIds: ["1", "2", "3", "4", "5"] },
        doing: {
          id: "doing",
          title: "Doing",
          taskIds: ["6", "7", "8", "9", "10"],
        },
        review: { id: "review", title: "Review", taskIds: ["11", "13", "14"] },
        done: { id: "done", title: "Done", taskIds: ["17", "18", "19", "20"] },
      },
      columnOrder: ["backlog", "todo", "doing", "done"],
      activityLogs: [],
    },

    /* =====================================================
       BOARD 4 — PERSONAL TASKS (14 TASK)
    ====================================================== */
    "board-4": {
      id: "board-4",
      title: "Personal Tasks",
      tasks: {
        "1": { id: "1", title: "Workout", priority: "medium" },
        "2": { id: "2", title: "Morning Routine", priority: "low" },
        "3": { id: "3", title: "Read Book", priority: "low" },
        "4": { id: "4", title: "Update CV", priority: "high" },
        "5": { id: "5", title: "Apply Internship", priority: "high" },
        "6": { id: "6", title: "Learn Next.js", priority: "medium" },
        "7": { id: "7", title: "Practice Coding", priority: "medium" },
        "8": { id: "8", title: "Clean Workspace", priority: "low" },
        "9": { id: "9", title: "Financial Tracking", priority: "medium" },
        "10": { id: "10", title: "Side Project", priority: "medium" },
        "11": { id: "11", title: "Portfolio Update", priority: "high" },
        "12": { id: "12", title: "Networking", priority: "medium" },
        "13": { id: "13", title: "Rest Day", priority: "low" },
        "14": { id: "14", title: "Weekly Review", priority: "low" },
      },
      columns: {
        backlog: { id: "backlog", title: "Backlog", taskIds: ["3", "13"] },
        todo: { id: "todo", title: "Todo", taskIds: ["4", "5", "6", "7"] },
        doing: { id: "doing", title: "Doing", taskIds: ["1", "10"] },
        review: { id: "review", title: "Review", taskIds: ["14"] },
        done: {
          id: "done",
          title: "Done",
          taskIds: ["2", "8", "9", "11", "12"],
        },
      },
      activityLogs: [],
      columnOrder: ["backlog", "todo", "doing", "done"],
    },

    /* =====================================================
       BOARD 5 — RESEARCH (15 TASK)
    ====================================================== */
    "board-5": {
      id: "board-5",
      title: "Research",
      tasks: {
        "1": {
          id: "1",
          title: "Define Topic",
          priority: "high",
          tags: ["planning", "research"],
        },
        "2": {
          id: "2",
          title: "Literature Review",
          priority: "high",
          tags: ["reading", "analysis"],
        },
        "3": {
          id: "3",
          title: "Research Question",
          priority: "high",
          tags: ["planning", "critical-thinking"],
        },
        "4": {
          id: "4",
          title: "Methodology Design",
          priority: "high",
          tags: ["methodology", "design"],
        },
        "5": {
          id: "5",
          title: "Data Collection",
          priority: "medium",
          tags: ["data", "fieldwork"],
        },
        "6": {
          id: "6",
          title: "Data Cleaning",
          priority: "medium",
          tags: ["data", "preprocessing"],
        },
        "7": {
          id: "7",
          title: "Data Analysis",
          priority: "high",
          tags: ["analysis", "statistics"],
        },
        "8": {
          id: "8",
          title: "Visualization",
          priority: "medium",
          tags: ["visualization", "report"],
        },
        "9": {
          id: "9",
          title: "Discussion",
          priority: "medium",
          tags: ["writing", "analysis"],
        },
        "10": {
          id: "10",
          title: "Conclusion",
          priority: "medium",
          tags: ["writing"],
        },
        "11": {
          id: "11",
          title: "Draft Paper",
          priority: "high",
          tags: ["writing", "draft"],
        },
        "12": {
          id: "12",
          title: "Peer Review",
          priority: "medium",
          tags: ["review", "feedback"],
        },
        "13": {
          id: "13",
          title: "Revision",
          priority: "medium",
          tags: ["editing", "revision"],
        },
        "14": {
          id: "14",
          title: "Final Paper",
          priority: "high",
          tags: ["final", "submission"],
        },
        "15": {
          id: "15",
          title: "Submit Journal",
          priority: "high",
          tags: ["submission"],
        },
      },
      columns: {
        backlog: { id: "backlog", title: "Backlog", taskIds: ["12"] },
        todo: { id: "todo", title: "Todo", taskIds: ["1", "2", "3", "4"] },
        doing: { id: "doing", title: "Doing", taskIds: ["5", "6", "7", "8"] },
        review: {
          id: "review",
          title: "Review",
          taskIds: ["9", "10", "11", "13"],
        },
        done: { id: "done", title: "Done", taskIds: ["14", "15"] },
      },
      activityLogs: [],
      columnOrder: ["backlog", "todo", "doing", "done"],
    },
  },
};

export const activityData: Activity[] = [
  {
    id: 1,
    actor: "Anda",
    task: "Analisis Kebutuhan",
    status: "Review",
    timeAgo: "12 menit lalu",
    accentColor: "#FF5FB7",
  },
  {
    id: 2,
    actor: "Anda",
    task: "Analisis Kebutuhan",
    status: "Review",
    timeAgo: "25 menit lalu",
    accentColor: "#8B9BFF",
  },
  {
    id: 3,
    actor: "Budi",
    task: "Desain UI",
    status: "In Progress",
    timeAgo: "1 jam lalu",
    accentColor: "#FDBA74",
  },
  {
    id: 4,
    actor: "Siti",
    task: "Setup Backend",
    status: "Done",
    timeAgo: "2 jam lalu",
    accentColor: "#4ADE80",
  },
  {
    id: 5,
    actor: "Anda",
    task: "Testing API",
    status: "Review",
    timeAgo: "3 jam lalu",
    accentColor: "#A78BFA",
  },
  {
    id: 6,
    actor: "Rina",
    task: "Dokumentasi",
    status: "In Progress",
    timeAgo: "5 jam lalu",
    accentColor: "#60A5FA",
  },
  {
    id: 7,
    actor: "Anda",
    task: "Deploy Aplikasi",
    status: "Done",
    timeAgo: "1 hari lalu",
    accentColor: "#34D399",
  },
];
