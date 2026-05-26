import React, { useState, useEffect } from "react";
import { LeaderboardEntry } from "../types";
import { Trophy, Star, Shield, RefreshCw, Globe, Home, User, Server } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LeaderboardProps {
  currentScore: number;
  currentLevel: number;
  blocksCleared: number;
  onClose: () => void;
  userId: string;
  username: string;
  onUpdateUsername: (newName: string) => void;
  onRefreshCloudSave: () => void;
}

export default function Leaderboard({
  currentScore,
  currentLevel,
  blocksCleared,
  onClose,
  userId,
  username,
  onUpdateUsername,
  onRefreshCloudSave,
}: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"local" | "cloud">("local");
  const [localScores, setLocalScores] = useState<LeaderboardEntry[]>([]);
  const [cloudScores, setCloudScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [tempName, setTempName] = useState(username);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({
    text: "",
    type: "",
  });

  // Load local leaderboards from localStorage
  useEffect(() => {
    const loaded = localStorage.getItem("block_blast_local_leaderboard");
    if (loaded) {
      try {
        setLocalScores(JSON.parse(loaded));
      } catch (e) {
        console.error("Failed to parse local scores", e);
      }
    } else {
      // Mock starting local scores for friendly competition
      const defaultLocal: LeaderboardEntry[] = [
        { username: "PlayerOne", score: 5000, level: 5, blocksCleared: 150, date: "2026-05-25" },
        { username: "ArcadeNinja", score: 3500, level: 4, blocksCleared: 120, date: "2026-05-24" },
        { username: "PuzzleMaster", score: 2000, level: 2, blocksCleared: 80, date: "2026-05-26" },
      ];
      localStorage.setItem("block_blast_local_leaderboard", JSON.stringify(defaultLocal));
      setLocalScores(defaultLocal);
    }
  }, []);

  // Fetch cloud leaderboard from API
  const fetchCloudLeaderboard = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/leaderboard");
      const data = await resp.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setCloudScores(data.leaderboard);
      } else {
        setMessage({ text: "Failed to reload cloud scorecard.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Network offline or server loaded locally.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "cloud") {
      fetchCloudLeaderboard();
    }
  }, [activeTab]);

  // Handle local username update & submit score
  const handleSaveUsername = () => {
    const clean = tempName.trim().substring(0, 15);
    if (!clean) return;
    onUpdateUsername(clean);
    setMessage({ text: "Profile name updated locally and ready to sync!", type: "success" });
    
    // Auto clear msg
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Submit current session score to the local leaderboard
  const submitToLocal = () => {
    if (currentScore <= 0) {
      setMessage({ text: "Please play a game to set a record high score!", type: "error" });
      return;
    }

    const entry: LeaderboardEntry = {
      username: username || "Anonymous",
      score: currentScore,
      level: currentLevel,
      blocksCleared,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [...localScores, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 15); // Top 15 local list

    setLocalScores(updated);
    localStorage.setItem("block_blast_local_leaderboard", JSON.stringify(updated));
    setMessage({ text: "Successfully posted to your local device board!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Submit current high score / state to cloud
  const submitToCloud = async () => {
    if (currentScore <= 0) {
      setMessage({ text: "Play a game first to register on the Global Arena!", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username || "Anonymous",
          score: currentScore,
          level: currentLevel,
          blocksCleared: blocksCleared,
        }),
      });
      const resData = await response.json();
      if (resData.success) {
        setCloudScores(resData.leaderboard);
        setMessage({ text: "Blast score posted globally in the cloud!", type: "success" });
        onRefreshCloudSave(); // also updates cloud backup
      } else {
        setMessage({ text: "Server rejected score submission.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "No internet or local offline mode.", type: "error" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md overflow-hidden bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header Section */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-500 animate-pulse" />
            <div>
              <h2 className="text-xl font-sans font-bold tracking-tight text-white">Scoreboards</h2>
              <p className="text-xs font-mono text-slate-400">Tactile Arena Rankings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            id="close-leaderboard-btn"
          >
            ✕
          </button>
        </div>

        {/* Profile / Saved Name Sync bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-850 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Player Profile
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full">
              ID: {userId.substring(0, 8)}...
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Set your name..."
              className="flex-1 bg-slate-900 border border-slate-750 px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 font-sans"
              maxLength={15}
            />
            <button
              onClick={handleSaveUsername}
              className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-black font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Set Name
            </button>
          </div>
        </div>

        {/* Dynamic score reporter & Submissions */}
        {currentScore > 0 && (
          <div className="px-5 py-3.5 bg-cyan-950/30 border-b border-cyan-900/40 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-cyan-400">Current Unsubmitted Run</p>
              <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
                {currentScore} pts <span className="text-xs text-slate-400 font-normal">({blocksCleared} blocks)</span>
              </h4>
            </div>
            <div className="flex gap-2">
              <button
                onClick={submitToLocal}
                className="bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Home className="w-3 h-3 text-emerald-400" /> Local Submit
              </button>
              <button
                disabled={submitting}
                onClick={submitToCloud}
                className="bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3 h-3 text-cyan-300" /> Cloud Sync
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Tabs Toggle */}
        <div className="flex bg-slate-950/70 p-1.5 border-b border-slate-850">
          <button
            onClick={() => setActiveTab("local")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              activeTab === "local"
                ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Local Scoreboard
          </button>
          <button
            onClick={() => setActiveTab("cloud")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono rounded-lg transition-all cursor-pointer ${
              activeTab === "cloud"
                ? "bg-slate-800 text-purple-300 border border-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-3.5 h-3.5" /> Global Cloud Sync
          </button>
        </div>

        {/* Global info alerts */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-5 py-2 text-xs font-sans text-center text-medium ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border-b border-emerald-950/50"
                  : "bg-rose-500/10 text-rose-400 border-b border-rose-950/50"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scores content lists */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-purple-500" />
              <p className="text-xs font-mono">Fetching Live Rankings...</p>
            </div>
          ) : (
            <>
              {activeTab === "local" ? (
                localScores.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No high scores registered yet on this device.
                  </div>
                ) : (
                  localScores.map((entry, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                        entry.username.toLowerCase() === username.toLowerCase()
                          ? "bg-cyan-950/20 border-cyan-800/40"
                          : "bg-slate-900/60 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full font-mono text-xs font-bold ${
                            index === 0
                              ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                              : index === 1
                                ? "bg-slate-300 text-black"
                                : index === 2
                                  ? "bg-amber-700 text-white"
                                  : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-sans font-semibold text-white flex items-center gap-1.5">
                            {entry.username}
                            {entry.username.toLowerCase() === username.toLowerCase() && (
                              <span className="text-[9px] font-mono bg-cyan-900 text-cyan-300 px-1.5 py-0.2 rounded-full border border-cyan-700/50">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Lv. {entry.level} &bull; {entry.blocksCleared} Blocks
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-cyan-300 text-sm">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500">
                          {entry.date}
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : cloudScores.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Global server empty or in local mode.
                </div>
              ) : (
                cloudScores.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      entry.username.toLowerCase() === username.toLowerCase()
                        ? "bg-purple-950/20 border-purple-800/40 shadow-[0_0_8px_rgba(168,85,247,0.1)]"
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full font-mono text-xs font-bold ${
                          index === 0
                            ? "bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            : index === 1
                              ? "bg-slate-300 text-black"
                              : index === 2
                                ? "bg-amber-700 text-white"
                                : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-sans font-semibold text-white flex items-center gap-1.5">
                          {entry.username}
                          {entry.username.toLowerCase() === username.toLowerCase() && (
                            <span className="text-[9px] font-mono bg-purple-900 text-purple-300 px-1.5 py-0.2 rounded-full border border-purple-700/50 animate-pulse">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Lv. {entry.level} &bull; {entry.blocksCleared} blocks
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-purple-300 text-sm">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        {entry.date}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer info/Sync controls info */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/50 flex align-center justify-between gap-4 text-[10px] text-slate-400 font-mono">
          <p>Scores are stored on device & synced with online arena server.</p>
          {activeTab === "cloud" && (
            <button
              onClick={fetchCloudLeaderboard}
              className="text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
