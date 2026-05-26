import React from "react";
import { GameStats, ThemeType } from "../types";
import { THEME_BG_CLASSES } from "../shapes";
import { Flame, Star, Trophy, ArrowUpRight, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StatsPanelProps {
  stats: GameStats;
  theme: ThemeType;
}

export default function StatsPanel({ stats, theme }: StatsPanelProps) {
  // Compute percentage progress to next level (every 1,000 pts triggers difficulty levels)
  const nextLevelThreshold = stats.level * 1500;
  const prevLevelThreshold = (stats.level - 1) * 1500;
  const levelProgress = Math.min(
    100,
    Math.max(
      0,
      ((stats.score - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100
    )
  );

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* SCORE CARD */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono uppercase tracking-wider">Score</span>
          <Star className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
        </div>
        <div className="mt-2">
          <motion.h3
            id="current-score"
            key={stats.score}
            initial={{ scale: 1.15, textShadow: "0 0 10px rgba(34,211,238,0.5)" }}
            animate={{ scale: 1, textShadow: "none" }}
            className="text-2xl font-bold font-sans text-cyan-400"
          >
            {stats.score.toLocaleString()}
          </motion.h3>
          <p className="text-[10px] font-mono text-slate-500">
            next level in {Math.max(0, nextLevelThreshold - stats.score).toLocaleString()}
          </p>
        </div>
      </div>

      {/* HIGH SCORE CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono uppercase tracking-wider">High Score</span>
          <Trophy className="w-4 h-4 text-amber-500 fill-amber-500/20" />
        </div>
        <div className="mt-2">
          <h3 className="text-2xl font-bold font-sans text-amber-500">
            {stats.highScore.toLocaleString()}
          </h3>
          <p className="text-[10px] font-mono text-slate-500">Global Personal Best</p>
        </div>
      </div>

      {/* DIFFICULTY LEVEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono uppercase tracking-wider">Difficulty</span>
          <span className="text-[10px] bg-purple-900/40 text-purple-300 font-mono px-1.5 py-0.2 rounded border border-purple-800/40">
            Lv. {stats.level}
          </span>
        </div>
        <div className="mt-3 flex-1 flex flex-col justify-end">
          <div className="text-[10px] font-mono text-slate-400 flex justify-between mb-1">
            <span>Progress</span>
            <span>{Math.round(levelProgress)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-750">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full"
              style={{ width: `${levelProgress}%` }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* STATS COUNT */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Streak / Combos</span>
          <div className="flex items-center gap-1 text-orange-500 animate-bounce">
            <Flame className="w-4 h-4 fill-orange-500/10" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <AnimatePresence mode="wait">
              <motion.span
                key={stats.combo}
                initial={{ opacity: 0, scale: 1.3, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                className={`text-2xl font-bold font-mono ${
                  stats.combo > 0 ? "text-orange-500 font-extrabold" : "text-slate-400"
                }`}
              >
                {stats.combo > 0 ? `${stats.combo}x` : "0"}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] font-mono text-slate-500 block">Combo Multiplier</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
            💥 {stats.blocksCleared} blocks
          </p>
        </div>
      </div>
    </div>
  );
}
