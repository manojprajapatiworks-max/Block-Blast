import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

// Storage Configuration
const LEADERBOARD_FILE = path.join(process.cwd(), "data_leaderboard.json");
const CLOUD_SAVES_FILE = path.join(process.cwd(), "data_cloud_saves.json");

interface LeaderboardEntry {
  username: string;
  score: number;
  level: number;
  blocksCleared: number;
  date: string;
}

interface CloudSave {
  userId: string;
  username: string;
  highScore: number;
  level: number;
  blocksCleared: number;
  skin: string;
  timestamp: number;
}

// In-Memory Fallbacks in case of disk write issues
let localLeaderboard: LeaderboardEntry[] = [
  { username: "NeonGrid", score: 12500, level: 12, blocksCleared: 450, date: "2026-05-25" },
  { username: "BlockMaster", score: 8700, level: 8, blocksCleared: 310, date: "2026-05-24" },
  { username: "PuzzleKing", score: 6200, level: 6, blocksCleared: 220, date: "2026-05-26" },
  { username: "TactileTracer", score: 4500, level: 5, blocksCleared: 160, date: "2026-05-23" },
  { username: "ComboCruiser", score: 3200, level: 3, blocksCleared: 110, date: "2026-05-21" }
];

let localCloudSaves: Record<string, CloudSave> = {};

// Load helper
function loadData() {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, "utf-8"));
      if (Array.isArray(parsed)) {
        localLeaderboard = parsed;
      }
    }
  } catch (err) {
    console.error("Error reading leaderboard file, using memory fallback", err);
  }

  try {
    if (fs.existsSync(CLOUD_SAVES_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(CLOUD_SAVES_FILE, "utf-8"));
      if (parsed && typeof parsed === "object") {
        localCloudSaves = parsed;
      }
    }
  } catch (err) {
    console.error("Error reading cloud saves file, using memory fallback", err);
  }
}

// Save helpers with robust try/catch
function saveLeaderboard() {
  try {
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(localLeaderboard, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write leaderboard data to disk", err);
  }
}

function saveCloudSaves() {
  try {
    fs.writeFileSync(CLOUD_SAVES_FILE, JSON.stringify(localCloudSaves, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write cloud saves data to disk", err);
  }
}

// Initialize persistence
loadData();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Leaderboard retrieval
  app.get("/api/leaderboard", (req, res) => {
    // Sort in descending order of score, slice top 20
    const sorted = [...localLeaderboard].sort((a, b) => b.score - a.score).slice(0, 20);
    res.json({ success: true, leaderboard: sorted });
  });

  // Leaderboard submission
  app.post("/api/leaderboard", (req, res) => {
    const { username, score, level, blocksCleared } = req.body;
    if (!username || typeof score !== "number") {
      res.status(400).json({ error: "Missing username or score" });
      return;
    }

    const cleanName = String(username).trim().substring(0, 15) || "Anonymous";
    
    const entry: LeaderboardEntry = {
      username: cleanName,
      score,
      level: Number(level) || 1,
      blocksCleared: Number(blocksCleared) || 0,
      date: new Date().toISOString().split("T")[0],
    };

    localLeaderboard.push(entry);
    localLeaderboard = localLeaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Keep top 50 in our database

    saveLeaderboard();
    res.json({ success: true, leaderboard: localLeaderboard.slice(0, 15) });
  });

  // Cloud Save - GET retrieve by username or userId
  app.get("/api/cloud-save", (req, res) => {
    const { userId, username } = req.query;
    
    if (userId) {
      const save = localCloudSaves[String(userId)];
      if (save) {
        res.json({ success: true, save });
        return;
      }
    }

    if (username) {
      // Find matching save by exact username
      const keyName = String(username).trim().toLowerCase();
      const save = Object.values(localCloudSaves).find(
        (s) => s.username.toLowerCase() === keyName
      );
      if (save) {
        res.json({ success: true, save });
        return;
      }
    }

    res.json({ success: false, message: "No save state found for given query." });
  });

  // Cloud Save - POST update save
  app.post("/api/cloud-save", (req, res) => {
    const { userId, username, highScore, level, blocksCleared, skin } = req.body;
    
    if (!userId || !username) {
      res.status(400).json({ error: "Missing userId or username" });
      return;
    }

    const cleanedUsername = String(username).trim().substring(0, 15) || "User";

    const save: CloudSave = {
      userId: String(userId),
      username: cleanedUsername,
      highScore: Number(highScore) || 0,
      level: Number(level) || 1,
      blocksCleared: Number(blocksCleared) || 0,
      skin: String(skin || "neon"),
      timestamp: Date.now(),
    };

    localCloudSaves[String(userId)] = save;
    saveCloudSaves();

    // Check if score is worthy of leaderboard sync
    const alreadyOnLeaderboard = localLeaderboard.find(
      (entry) => entry.username.toLowerCase() === cleanedUsername.toLowerCase()
    );

    if (save.highScore > 0) {
      if (!alreadyOnLeaderboard || save.highScore > alreadyOnLeaderboard.score) {
        // Update or insert into leaderboard
        if (alreadyOnLeaderboard) {
          alreadyOnLeaderboard.score = save.highScore;
          alreadyOnLeaderboard.level = Math.max(alreadyOnLeaderboard.level, save.level);
          alreadyOnLeaderboard.blocksCleared = Math.max(alreadyOnLeaderboard.blocksCleared, save.blocksCleared);
          alreadyOnLeaderboard.date = new Date().toISOString().split("T")[0];
        } else {
          localLeaderboard.push({
            username: cleanedUsername,
            score: save.highScore,
            level: save.level,
            blocksCleared: save.blocksCleared,
            date: new Date().toISOString().split("T")[0]
          });
        }
        localLeaderboard.sort((a, b) => b.score - a.score);
        saveLeaderboard();
      }
    }

    res.json({ success: true, save });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
