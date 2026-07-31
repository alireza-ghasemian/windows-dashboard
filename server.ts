import express from "express";
import path from "path";
import fs from "fs/promises";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

const FILE_PATH = path.join(DATA_DIR, "budget_data.json");
const TRADING_FILE_PATH = path.join(DATA_DIR, "trading_data.json");
const COUNTDOWN_FILE_PATH = path.join(DATA_DIR, "countdown_data.json");
const HABITS_FILE_PATH = path.join(DATA_DIR, "habits_data.json");
const REMINDERS_FILE_PATH = path.join(DATA_DIR, "reminders_data.json");
const STUDY_FILE_PATH = path.join(DATA_DIR, "study_data.json");
const NOTES_FILE_PATH = path.join(DATA_DIR, "notes_data.json");
const FITNESS_FILE_PATH = path.join(DATA_DIR, "fitness_data.json");

// Helper function to safely check if file exists using fs.access
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Function to migrate any existing root JSON files to the new data/ folder
async function migrateLegacyFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  
  const legacyFiles = [
    { name: "budget_data.json", newPath: FILE_PATH },
    { name: "trading_data.json", newPath: TRADING_FILE_PATH },
    { name: "countdown_data.json", newPath: COUNTDOWN_FILE_PATH },
    { name: "habits_data.json", newPath: HABITS_FILE_PATH },
    { name: "reminders_data.json", newPath: REMINDERS_FILE_PATH },
    { name: "study_data.json", newPath: STUDY_FILE_PATH },
    { name: "notes_data.json", newPath: NOTES_FILE_PATH },
    { name: "fitness_data.json", newPath: FITNESS_FILE_PATH }
  ];

  for (const item of legacyFiles) {
    const legacyPath = path.join(process.cwd(), item.name);
    try {
      const hasLegacy = await fileExists(legacyPath);
      const hasNew = await fileExists(item.newPath);

      if (hasLegacy) {
        if (!hasNew) {
          await fs.rename(legacyPath, item.newPath);
          console.log(`Migrated ${item.name} to data/ folder.`);
        } else {
          // Both exist, so delete the legacy one to avoid root clutter
          await fs.unlink(legacyPath);
          console.log(`Removed duplicate legacy file: ${item.name}`);
        }
      }
    } catch (err) {
      console.error(`Migration error for ${item.name}:`, err);
    }
  }
}

async function startServer() {
  // Ensure data directory exists and migrate files
  await migrateLegacyFiles();

  const app = express();
  const PORT = 3000;

  // Setup JSON body parsing with reasonable size limit
  app.use(express.json({ limit: "20mb" }));

  // API Route to load budget data from JSON file
  app.get("/api/budget", async (req, res) => {
    try {
      // Check if file exists
      try {
        await fs.access(FILE_PATH);
      } catch {
        return res.json({ exists: false });
      }

      const content = await fs.readFile(FILE_PATH, "utf-8");
      const data = JSON.parse(content);
      return res.json({ exists: true, data });
    } catch (error) {
      console.error("Failed to load budget data from JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to save budget data to JSON file
  app.post("/api/budget", async (req, res) => {
    try {
      const { archives, monthsData, currentMonthKey, suggestions } = req.body;
      const payload = {
        archives: archives || [],
        monthsData: monthsData || {},
        currentMonthKey: currentMonthKey || "",
        suggestions: suggestions || [],
      };

      await fs.writeFile(FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to save budget data to JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to load trading journal data from JSON file
  app.get("/api/trading", async (req, res) => {
    try {
      try {
        await fs.access(TRADING_FILE_PATH);
      } catch {
        return res.json({ exists: false });
      }

      const content = await fs.readFile(TRADING_FILE_PATH, "utf-8");
      const data = JSON.parse(content);
      return res.json({ exists: true, data });
    } catch (error) {
      console.error("Failed to load trading data from JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to save trading journal data to JSON file
  app.post("/api/trading", async (req, res) => {
    try {
      const {
        journalCurrency,
        initialBalance,
        trades,
        quickCalcBalance,
        riskPresets,
        forexLeverages,
        cryptoLeverages,
      } = req.body;

      const payload = {
        journalCurrency,
        initialBalance,
        trades,
        quickCalcBalance,
        riskPresets,
        forexLeverages,
        cryptoLeverages,
      };

      await fs.writeFile(TRADING_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to save trading data to JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to load countdown timer data from JSON file
  app.get("/api/countdown", async (req, res) => {
    try {
      try {
        await fs.access(COUNTDOWN_FILE_PATH);
      } catch {
        return res.json({ exists: false });
      }

      const content = await fs.readFile(COUNTDOWN_FILE_PATH, "utf-8");
      const data = JSON.parse(content);
      return res.json({ exists: true, data });
    } catch (error) {
      console.error("Failed to load countdown data from JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to save countdown timer data to JSON file
  app.post("/api/countdown", async (req, res) => {
    try {
      const {
        startDateStr,
        targetDateStr,
        mainTitle,
        mainSubtitle,
        trackerTitle,
        calendarType,
      } = req.body;

      const payload = {
        startDateStr,
        targetDateStr,
        mainTitle,
        mainSubtitle,
        trackerTitle,
        calendarType,
      };

      await fs.writeFile(COUNTDOWN_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to save countdown data to JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to load habits data from JSON file
  app.get("/api/habits", async (req, res) => {
    try {
      try {
        await fs.access(HABITS_FILE_PATH);
      } catch {
        return res.json({ exists: false });
      }

      const content = await fs.readFile(HABITS_FILE_PATH, "utf-8");
      const data = JSON.parse(content);
      return res.json({ exists: true, data });
    } catch (error) {
      console.error("Failed to load habits data from JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to save habits data to JSON file
  app.post("/api/habits", async (req, res) => {
    try {
      const { activeTab, habits, dragLocked, calendarType } = req.body;
      const payload = { activeTab, habits, dragLocked, calendarType };
      await fs.writeFile(HABITS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to save habits data to JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to load reminders data from JSON file
  app.get("/api/reminders", async (req, res) => {
    try {
      try {
        await fs.access(REMINDERS_FILE_PATH);
      } catch {
        return res.json({ exists: false });
      }

      const content = await fs.readFile(REMINDERS_FILE_PATH, "utf-8");
      const data = JSON.parse(content);
      return res.json({ exists: true, data });
    } catch (error) {
      console.error("Failed to load reminders data from JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to save reminders data to JSON file
  app.post("/api/reminders", async (req, res) => {
    try {
      const { reminders, pastReminders, dragLocked } = req.body;
      const payload = { reminders, pastReminders, dragLocked };
      await fs.writeFile(REMINDERS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to save reminders data to JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to load study planner data from JSON file
  app.get("/api/study", async (req, res) => {
    try {
      try {
        await fs.access(STUDY_FILE_PATH);
      } catch {
        return res.json({ exists: false });
      }

      const content = await fs.readFile(STUDY_FILE_PATH, "utf-8");
      const data = JSON.parse(content);
      return res.json({ exists: true, data });
    } catch (error) {
      console.error("Failed to load study planner data from JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to save study planner data to JSON file
  app.post("/api/study", async (req, res) => {
    try {
      const {
        userName,
        schedule,
        studyDragLocked,
        deadlineDragLocked,
        tasks,
        studyDuration,
        shortBreakDuration,
        longBreakDuration,
        totalSessions,
        longBreakEnabled,
        loopEnabled,
        alarmSound,
        customSoundUrl,
        pomoHistory,
        deadlines,
      } = req.body;

      const payload = {
        userName,
        schedule,
        studyDragLocked,
        deadlineDragLocked,
        tasks,
        studyDuration,
        shortBreakDuration,
        longBreakDuration,
        totalSessions,
        longBreakEnabled,
        loopEnabled,
        alarmSound,
        customSoundUrl,
        pomoHistory,
        deadlines,
      };

      await fs.writeFile(STUDY_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to save study planner data to JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to load notes data from JSON file
  app.get("/api/notes", async (req, res) => {
    try {
      try {
        await fs.access(NOTES_FILE_PATH);
      } catch {
        return res.json({ exists: false });
      }

      const content = await fs.readFile(NOTES_FILE_PATH, "utf-8");
      const data = JSON.parse(content);
      return res.json({ exists: true, data });
    } catch (error) {
      console.error("Failed to load notes data from JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to save notes data to JSON file
  app.post("/api/notes", async (req, res) => {
    try {
      const { notes, dragLocked, availableTags } = req.body;
      const payload = { notes, dragLocked, availableTags };
      await fs.writeFile(NOTES_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to save notes data to JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to load fitness data from JSON file
  app.get("/api/fitness", async (req, res) => {
    try {
      try {
        await fs.access(FITNESS_FILE_PATH);
      } catch {
        return res.json({ exists: false });
      }

      const content = await fs.readFile(FITNESS_FILE_PATH, "utf-8");
      const data = JSON.parse(content);
      return res.json({ exists: true, data });
    } catch (error) {
      console.error("Failed to load fitness data from JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // API Route to save fitness data to JSON file
  app.post("/api/fitness", async (req, res) => {
    try {
      const { profile, dailyLogs, measurementLogs, profileLocked } = req.body;
      const payload = { profile, dailyLogs, measurementLogs, profileLocked };
      await fs.writeFile(FITNESS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Failed to save fitness data to JSON file:", error);
      return res.status(500).json({ success: false, error: String(error) });
    }
  });

  // Comprehensive Database Sync status API Route
  app.get("/api/sync-status", async (req, res) => {
    const files = [
      { id: "budget", name: "budget_data.json", path: FILE_PATH, titleFa: "بودجه جاری و ماهانه", titleEn: "Monthly Budget" },
      { id: "trading", name: "trading_data.json", path: TRADING_FILE_PATH, titleFa: "ژورنال معامله‌گری", titleEn: "Trading Journal" },
      { id: "countdown", name: "countdown_data.json", path: COUNTDOWN_FILE_PATH, titleFa: "شمارش معکوس اهداف", titleEn: "Goal Countdown" },
      { id: "habits", name: "habits_data.json", path: HABITS_FILE_PATH, titleFa: "عادت‌های روزانه", titleEn: "Habits Tracker" },
      { id: "reminders", name: "reminders_data.json", path: REMINDERS_FILE_PATH, titleFa: "یادآوری‌های فعال", titleEn: "Active Reminders" },
      { id: "study", name: "study_data.json", path: STUDY_FILE_PATH, titleFa: "برنامه‌ریز درسی و پومودورو", titleEn: "Study Planner & Pomodoro" },
      { id: "notes", name: "notes_data.json", path: NOTES_FILE_PATH, titleFa: "دفترچه یادداشت دیجیتال", titleEn: "Digital Notes" },
      { id: "fitness", name: "fitness_data.json", path: FITNESS_FILE_PATH, titleFa: "ردیاب تناسب اندام", titleEn: "Fitness Tracker" }
    ];

    const results = [];

    for (const f of files) {
      try {
        await fs.access(f.path);
        const stats = await fs.stat(f.path);
        const fileContent = await fs.readFile(f.path, "utf-8");
        let itemCount = 0;
        try {
          const parsed = JSON.parse(fileContent);
          if (f.id === "budget") {
            itemCount = Object.keys(parsed.monthsData || {}).length; // months tracked
          } else if (f.id === "trading") {
            itemCount = (parsed.trades || []).length; // trades logged
          } else if (f.id === "countdown") {
            itemCount = parsed.targetDateStr ? 1 : 0; // goal targets
          } else if (f.id === "habits") {
            itemCount = (parsed.habits || []).length; // habits tracked
          } else if (f.id === "reminders") {
            itemCount = (parsed.reminders || []).length; // reminders scheduled
          } else if (f.id === "study") {
            itemCount = (parsed.tasks || []).length; // study tasks
          } else if (f.id === "notes") {
            itemCount = (parsed.notes || []).length; // notes counted
          } else if (f.id === "fitness") {
            itemCount = (parsed.dailyLogs || []).length; // daily logs
          }
        } catch {
          // ignore parsing error for count
        }

        results.push({
          id: f.id,
          name: f.name,
          titleFa: f.titleFa,
          titleEn: f.titleEn,
          exists: true,
          sizeBytes: stats.size,
          sizeFormatted: stats.size > 1024 ? `${(stats.size / 1024).toFixed(2)} KB` : `${stats.size} B`,
          lastUpdated: stats.mtime.toISOString(),
          itemCount
        });
      } catch {
        results.push({
          id: f.id,
          name: f.name,
          titleFa: f.titleFa,
          titleEn: f.titleEn,
          exists: false,
          sizeBytes: 0,
          sizeFormatted: "0 B",
          lastUpdated: null,
          itemCount: 0
        });
      }
    }

    res.json({ success: true, files: results });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/*_data.json']
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = process.env.STATIC_DIR || path.join(process.cwd(), "dist");
    
    // Robust ASAR-safe custom static file serving using standard fs.readFile
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }

      let safePath = path.join(distPath, req.path);
      
      try {
        const stat = await fs.stat(safePath);
        if (stat.isDirectory()) {
          safePath = path.join(safePath, "index.html");
        }
      } catch {
        safePath = path.join(distPath, "index.html");
      }

      try {
        const content = await fs.readFile(safePath);
        const ext = path.extname(safePath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
          ".ico": "image/x-icon",
          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".ttf": "font/ttf",
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        return res.send(content);
      } catch (err) {
        console.error("Failed to serve static file inside ASAR:", safePath, err);
        return res.status(500).send("Internal Server Error");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
