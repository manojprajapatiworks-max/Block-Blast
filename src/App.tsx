import React, { useState, useEffect, useRef } from "react";
import { Board, BlockPiece, ThemeType, GameStats, CellState } from "./types";
import { getRandomPiece, generateDockPieces, THEME_COLOR_MAP, THEME_BG_CLASSES } from "./shapes";
import {
  playTap,
  playPlace,
  playClear,
  playCombo,
  playGameOver,
  playLevelUp,
  setSoundEnabled,
  isSoundEnabled,
  triggerHaptic
} from "./sound";
import StatsPanel from "./components/StatsPanel";
import Leaderboard from "./components/Leaderboard";
import {
  Trophy,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RotateCcw,
  Zap,
  Disc,
  Info,
  Smartphone,
  Sparkles,
  CloudLightning,
  CheckCircle2,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Initial empty 8x8 board grid helper
const createEmptyBoard = (): Board =>
  Array(8)
    .fill(null)
    .map(() =>
      Array(8)
        .fill(null)
        .map(() => ({ filled: false, color: "slate" }))
    );

export default function App() {
  // Game state
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [dockPieces, setDockPieces] = useState<BlockPiece[]>(() => generateDockPieces(1));
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    level: 1,
    combo: 0,
    blocksCleared: 0,
    linesCleared: 0,
  });

  // Config and visual controls
  const [theme, setTheme] = useState<ThemeType>("neon");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  // Profile data
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("BlastPlayer");
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"idle" | "synced" | "saving" | "offline">("idle");

  // Dragging mechanics state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [previewCell, setPreviewCell] = useState<{ row: number; col: number } | null>(null);
  const [previewValid, setPreviewValid] = useState(false);
  const [measuredCellWidth, setMeasuredCellWidth] = useState(48);

  // References for drag bounds calculation
  const boardRef = useRef<HTMLDivElement>(null);
  const activeDragRef = useRef<HTMLDivElement>(null);

  // Dynamically track exact grid tile cell size with high fidelity to prevent drag-drift
  useEffect(() => {
    if (!boardRef.current) return;
    
    const updateSize = () => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (rect) {
        // Precise size of individual cell in 8x8 layout (board grid column size)
        setMeasuredCellWidth(rect.width / 8);
      }
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(boardRef.current);

    window.addEventListener("resize", updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Setup user identifiers & restore high score on load
  useEffect(() => {
    // Unique user device ID
    let storedId = localStorage.getItem("block_blast_userId");
    if (!storedId) {
      storedId = `blast_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString().substring(8)}`;
      localStorage.setItem("block_blast_userId", storedId);
    }
    setUserId(storedId);

    // Profile username
    const storedName = localStorage.getItem("block_blast_username");
    if (storedName) {
      setUsername(storedName);
    } else {
      localStorage.setItem("block_blast_username", "BlastPlayer");
    }

    // High score recovery
    const localHighScore = localStorage.getItem("block_blast_high_score");
    if (localHighScore) {
      setStats((prev) => ({ ...prev, highScore: Number(localHighScore) }));
    }

    // Sync from Cloud Save if possible
    fetchCloudBackup(storedId);
  }, []);

  // Sync sound controller helper
  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  // Document-level class binding to coordinate accessible theme colors
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Fetch cloud backup state
  const fetchCloudBackup = async (uid: string) => {
    if (!uid) return;
    try {
      setCloudSyncStatus("saving");
      const resp = await fetch(`/api/cloud-save?userId=${uid}`);
      const data = await resp.json();
      if (data.success && data.save) {
        setStats((prev) => {
          const higherScore = Math.max(prev.highScore, data.save.highScore);
          localStorage.setItem("block_blast_high_score", String(higherScore));
          return {
            ...prev,
            highScore: higherScore,
          };
        });
        if (data.save.username) {
          setUsername(data.save.username);
        }
        setCloudSyncStatus("synced");
      } else {
        setCloudSyncStatus("offline");
      }
    } catch {
      setCloudSyncStatus("offline");
    }
  };

  // Push score and metrics to system cloud save
  const triggerCloudSave = async (scoreToSync: number, forceUsername?: string) => {
    const activeName = forceUsername || username;
    if (!userId) return;

    try {
      setCloudSyncStatus("saving");
      const savedScore = Math.max(stats.highScore, scoreToSync);
      const resp = await fetch("/api/cloud-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          username: activeName,
          highScore: savedScore,
          level: stats.level,
          blocksCleared: stats.blocksCleared,
          skin: theme,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setCloudSyncStatus("synced");
      } else {
        setCloudSyncStatus("offline");
      }
    } catch {
      setCloudSyncStatus("offline");
    }
  };

  const handleUpdateUsername = (newName: string) => {
    setUsername(newName);
    localStorage.setItem("block_blast_username", newName);
    triggerCloudSave(stats.score, newName);
  };

  // Deep clone of board grid helper
  const cloneBoard = (b: Board): Board => b.map((row) => row.map((cell) => ({ ...cell })));

  // Level checking logic
  const checkLevelUp = (score: number) => {
    const nextLevel = Math.floor(score / 1500) + 1;
    if (nextLevel > stats.level) {
      playLevelUp();
      setStats((prev) => ({ ...prev, level: nextLevel }));
    }
  };

  // Placed check helper inside bounds
  const isPositionValid = (piece: BlockPiece, startRow: number, startCol: number, currentBoard: Board): boolean => {
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (piece.shape[r][c] === 1) {
          const targetRow = startRow + r;
          const targetCol = startCol + c;

          // Out of bounds check
          if (targetRow < 0 || targetRow >= 8 || targetCol < 0 || targetCol >= 8) {
            return false;
          }
          // Overlap check
          if (currentBoard[targetRow][targetCol].filled) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // Scan board for any valid placement for all remaining dock pieces to decide Game Over
  const checkGameOver = (pieces: BlockPiece[], currentBoard: Board): boolean => {
    // If no pieces remain in dock, they can still place new ones once generated, so not over
    if (pieces.filter((p) => p !== null).length === 0) return false;

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];
      if (!piece) continue;

      const rows = piece.shape.length;
      const cols = piece.shape[0].length;

      // Try every spot on 8x8 grid
      for (let r = 0; r <= 8 - rows; r++) {
        for (let c = 0; c <= 8 - cols; c++) {
          if (isPositionValid(piece, r, c, currentBoard)) {
            return false; // Valid placement found, game goes on!
          }
        }
      }
    }
    return true; // No moves anywhere, you are blocked!
  };

  // Start new game setup
  const handleRestart = () => {
    setBoard(createEmptyBoard());
    const startingPieces = generateDockPieces(1);
    setDockPieces(startingPieces);
    setStats((prev) => ({
      ...prev,
      score: 0,
      level: 1,
      combo: 0,
      linesCleared: 0,
    }));
    setIsGameOver(false);
    playTap();
  };

  // Drag initiation handler (Pointer API covers mobile and mouse in one go!)
  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    pieceIndex: number,
    piece: BlockPiece
  ) => {
    if (isGameOver) return;
    
    // Prevent document scrolling defaults for mobile
    e.preventDefault();
    playTap();

    // Store dimensions and relative click position
    const itemRect = e.currentTarget.getBoundingClientRect();
    const cursorOffsetX = e.clientX - itemRect.left;
    const cursorOffsetY = e.clientY - itemRect.top;

    setDraggedIdx(pieceIndex);
    setPointerPos({ x: e.clientX, y: e.clientY });

    // Lift offset so block stays clearly visible ABOVE finger target on mobile, and doesn't hide behind the touch cursor or pointer.
    const isTouch = e.pointerType === "touch";
    const liftOffset = isTouch ? -100 : -85; // significant upward shift so blocks are fully visible and comfortable to drag
    setDragOffset({
      x: cursorOffsetX,
      y: cursorOffsetY - liftOffset,
    });

    // Capture pointers sequentially
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Movement coordinates updates and preview cells calculation
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggedIdx === null) return;
    e.preventDefault();

    const curX = e.clientX;
    const curY = e.clientY;
    setPointerPos({ x: curX, y: curY });

    if (!boardRef.current) return;

    // Calculate nearest cell row & index relative to board
    const boardRect = boardRef.current.getBoundingClientRect();
    const cellWidth = boardRect.width / 8;

    const piece = dockPieces[draggedIdx];
    if (!piece) return;

    // Calculate virtual Top-Left screen coordinates of piece being dragged
    const virtualLeft = curX - dragOffset.x;
    const virtualTop = curY - dragOffset.y;

    // Relative offset to board top-left
    const boardRelX = virtualLeft - boardRect.left;
    const boardRelY = virtualTop - boardRect.top;

    // Map to 8x8 indexes
    const colIndex = Math.round(boardRelX / cellWidth);
    const rowIndex = Math.round(boardRelY / cellWidth);

    // Verify if place is valid
    if (
      colIndex >= 0 &&
      colIndex <= 8 - piece.shape[0].length &&
      rowIndex >= 0 &&
      rowIndex <= 8 - piece.shape.length
    ) {
      const valid = isPositionValid(piece, rowIndex, colIndex, board);
      setPreviewCell({ row: rowIndex, col: colIndex });
      setPreviewValid(valid);
    } else {
      setPreviewCell(null);
      setPreviewValid(false);
    }
  };

  // Pointer Up finishes block drag & drop
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>, pieceIndex: number) => {
    if (draggedIdx === null) return;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const piece = dockPieces[pieceIndex];
    if (piece && previewCell && previewValid) {
      // Place piece code!
      const nextBoard = cloneBoard(board);
      const rows = piece.shape.length;
      const cols = piece.shape[0].length;
      let cellsPlaced = 0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (piece.shape[r][c] === 1) {
            nextBoard[previewCell.row + r][previewCell.col + c] = {
              filled: true,
              color: piece.color,
            };
            cellsPlaced++;
          }
        }
      }

      // Check for row/column clear combos
      const rowsToClear: number[] = [];
      const colsToClear: number[] = [];

      // Check rows completion
      for (let r = 0; r < 8; r++) {
        if (nextBoard[r].every((c) => c.filled)) {
          rowsToClear.push(r);
        }
      }

      // Check col completion
      for (let c = 0; c < 8; c++) {
        let colFull = true;
        for (let r = 0; r < 8; r++) {
          if (!nextBoard[r][c].filled) {
            colFull = false;
            break;
          }
        }
        if (colFull) {
          colsToClear.push(c);
        }
      }

      const linesCount = rowsToClear.length + colsToClear.length;
      let clearScore = cellsPlaced * 10; // 10 pts per block placed
      let nextCombo = stats.combo;

      if (linesCount > 0) {
        // Clear filled slots
        rowsToClear.forEach((r) => {
          for (let c = 0; c < 8; c++) {
            nextBoard[r][c] = { filled: false, color: "slate" };
          }
        });

        colsToClear.forEach((c) => {
          for (let r = 0; r < 8; r++) {
            nextBoard[r][c] = { filled: false, color: "slate" };
          }
        });

        nextCombo += 1; // Increment combo
        
        // Polished Score math: 100 for 1 row, 300 for 2, 600 for 3, 1000 for 4+ as combo multiplier
        const lineBasePoints = linesCount === 1 ? 100 : linesCount === 2 ? 300 : linesCount === 3 ? 600 : 1000;
        clearScore += lineBasePoints * nextCombo;

        playClear(linesCount);
        if (nextCombo > 1) {
          playCombo(nextCombo);
        }
      } else {
        // No line cleared resets/lowers combos to 0
        nextCombo = 0;
        playPlace();
      }

      const newScore = stats.score + clearScore;
      const newHighScore = Math.max(stats.highScore, newScore);

      // Mutate remaining dock pieces
      const updatedDock = [...dockPieces];
      updatedDock[pieceIndex] = null as any;

      // Handle Dock Refills
      const activePiecesLeft = updatedDock.filter((p) => p !== null).length;
      let finalDockPieces = updatedDock;
      if (activePiecesLeft === 0) {
        // Refill completely with 3 new shapes based on current game level difficulty
        finalDockPieces = generateDockPieces(stats.level);
      }

      // Local storage high score sync
      if (newHighScore > stats.highScore) {
        localStorage.setItem("block_blast_high_score", String(newHighScore));
      }

      setBoard(nextBoard);
      setDockPieces(finalDockPieces);
      setStats((prev) => ({
        ...prev,
        score: newScore,
        highScore: newHighScore,
        combo: nextCombo,
        blocksCleared: prev.blocksCleared + cellsPlaced,
        linesCleared: prev.linesCleared + linesCount,
      }));

      // Immediate Level Ups validation
      checkLevelUp(newScore);

      // Game Over validation
      const gameIsOver = checkGameOver(finalDockPieces, nextBoard);
      if (gameIsOver) {
        setIsGameOver(true);
        playGameOver();
        // Submit high scores into rankings automatically
        triggerCloudSave(newScore);
      } else {
        // Backup save in real-time
        triggerCloudSave(newScore);
      }
    } else {
      // Put block back with soft feedback vibration if it was invalid
      if (previewCell) {
        triggerHaptic(20);
      }
    }

    // Reset dragging identifiers
    setDraggedIdx(null);
    setPreviewCell(null);
    setPreviewValid(false);
  };

  return (
    <div
      className={`min-h-screen py-4 px-3 flex flex-col justify-between font-sans transition-colors duration-200 select-none overflow-x-hidden ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
      style={{ touchAction: "none" }} // completely disables safari double-tap zooming on games
    >
      {/* HEADER CONTROLS BAR */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between py-2 border-b border-slate-800/20 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl text-black shadow-md">
            <Sparkles className="w-5 h-5 fill-black/10 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              BLOCK BLAST
            </h1>
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold block">
              100% Tactile Arcade
            </span>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex items-center gap-1.5">
          {/* Cloud Saving light Indicator */}
          <button
            onClick={() => fetchCloudBackup(userId)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 cursor-pointer"
            title="Cloud status tracker"
          >
            {cloudSyncStatus === "saving" ? (
              <Disc className="w-4 h-4 text-purple-400 animate-spin" />
            ) : cloudSyncStatus === "synced" ? (
              <CloudLightning className="w-4 h-4 text-emerald-400" />
            ) : (
              <CloudLightning className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Sound Control */}
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 cursor-pointer"
            title="Toggle synthesized audio effects"
            id="toggle-sound-btn"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          {/* Color Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 cursor-pointer"
            title="Switch color mode scheme"
            id="toggle-color-mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Info Instructions Modal */}
          <button
            onClick={() => setShowHowTo(!showHowTo)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 cursor-pointer"
            title="How to Play Guidelines"
            id="help-btn"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Leaderboard launcher */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 text-black font-semibold flex items-center gap-1 cursor-pointer"
            id="leaderboard-btn"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* STATS PANEL DISPLAY */}
      <div className="w-full max-w-lg mx-auto">
        <StatsPanel stats={stats} theme={theme} />
      </div>

      {/* AD-FREE GUARANTEE BADGE */}
      <div className="w-full max-w-lg mx-auto py-1 flex items-center justify-center">
        <div className="bg-emerald-500/10 border border-emerald-950/40 rounded-full px-3 py-0.5 text-[9px] font-mono text-emerald-400 flex items-center gap-1 shadow-sm mt-2">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Fully Ad-Free Gameplay • Immersive Focus Mode
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-2 w-full max-w-[490px] mx-auto mt-4">
        {/* SKIN/THEME SELECTOR RAIL */}
        <div className="w-full flex justify-center gap-2 mb-4 bg-slate-900/60 border border-slate-800 p-1.5 rounded-2xl max-w-[490px]">
          {(["neon", "retro", "candy", "gem"] as ThemeType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                playTap();
              }}
              className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                theme === t
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md border border-indigo-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t} theme
            </button>
          ))}
        </div>

        {/* 8x8 CORE PLAY BOARD */}
        <div className="relative w-full max-w-[490px] aspect-square bg-slate-900 border-2 border-slate-800 rounded-3xl p-3 shadow-2xl overflow-hidden min-h-[300px]">
          {/* Subtle Grid Backdrop for aesthetic neon vibes */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

          <div
            ref={boardRef}
            id="game-board"
            className="w-full h-full grid grid-cols-8 grid-rows-8 gap-1 p-0.5 relative rounded-2xl touch-none"
          >
            {board.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                // Determine layout active color
                let cellClass = isDarkMode ? "bg-slate-950/70 border-slate-900" : "bg-slate-200 border-slate-300";
                
                // Color override if filled
                if (cell.filled) {
                  const skinColorClass = THEME_COLOR_MAP[theme][cell.color] || "bg-cyan-500";
                  cellClass = skinColorClass;
                }

                // Temporary placement shadow preview overlay rendering style
                let isHoveredPreview = false;
                if (draggedIdx !== null && previewCell) {
                  const piece = dockPieces[draggedIdx];
                  if (piece) {
                    const relativeRow = rIdx - previewCell.row;
                    const relativeCol = cIdx - previewCell.col;
                    if (
                      relativeRow >= 0 &&
                      relativeRow < piece.shape.length &&
                      relativeCol >= 0 &&
                      relativeCol < piece.shape[0].length
                    ) {
                      if (piece.shape[relativeRow][relativeCol] === 1) {
                        isHoveredPreview = true;
                      }
                    }
                  }
                }

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`relative aspect-square rounded-lg border transition-all duration-100 flex items-center justify-center overflow-hidden ${cellClass}`}
                  >
                    {/* Hover guide highlight animation overlays */}
                    <AnimatePresence>
                      {isHoveredPreview && (
                        <motion.div
                          initial={{ scale: 0.82, opacity: 0.2 }}
                          animate={{ scale: 1.0, opacity: 0.85 }}
                          exit={{ opacity: 0 }}
                          className={`absolute inset-0.5 rounded-md ${
                            previewValid
                              ? THEME_COLOR_MAP[theme][dockPieces[draggedIdx!]?.color] || "bg-cyan-400"
                              : "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                          } opacity-60 flex items-center justify-center`}
                        >
                          {!previewValid && <span className="text-white text-[10px] font-bold">✕</span>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}

            {/* SCREEN-WIDE BLOCK INHIBITOR OVERLAYS FOR GAME OVER VIEW */}
            <AnimatePresence>
              {isGameOver && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="p-4 bg-rose-500/10 border border-rose-900/60 rounded-3xl mb-4 text-rose-500 flex justify-center"
                  >
                    <Trophy className="w-10 h-10 text-rose-400 animate-bounce" />
                  </motion.div>
                  <em className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold block mb-1">
                    Game Over
                  </em>
                  <h3 className="text-3xl font-black text-rose-500 tracking-tight leading-none mb-2">
                    BLOCKED BLAST!
                  </h3>
                  <p className="text-slate-300 text-sm max-w-xs mb-4">
                    Excellent tactical placement. You reached rank stats of level {stats.level} score!
                  </p>

                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl mb-6 w-full max-w-xs flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Run Score:</span>
                      <span className="font-mono font-bold text-cyan-300">{stats.score.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Blocks Cleared:</span>
                      <span className="font-mono text-white">{stats.blocksCleared}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRestart}
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-95 text-black font-extrabold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Blast Again
                    </button>
                    <button
                      onClick={() => setIsLeaderboardOpen(true)}
                      className="bg-slate-800 hover:bg-slate-755 text-white px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      Rankings
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTTOM DOCK PIECE OPTIONS (THREE STORAGE LANES) */}
        <div className="w-full max-w-[490px] bg-slate-900/40 p-3 rounded-3xl border border-slate-800/40 shadow-inner mt-4">
          <p className="text-[10px] text-center font-mono text-slate-500 mb-2.5 tracking-wider uppercase">
            Drag & place blocks onto the blast boards above
          </p>

          <div className="grid grid-cols-3 gap-3 min-h-[110px] items-center">
            {dockPieces.map((piece, pIdx) => {
              if (!piece) {
                return (
                  <div
                    key={`empty-${pIdx}`}
                    className="aspect-square flex items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl opacity-20 min-h-[90px]"
                  >
                    <span className="text-slate-600 text-[18px]">✓</span>
                  </div>
                );
              }

              // Determine layout size of cell width inside dock visual spaces
              const skinColor = THEME_COLOR_MAP[theme][piece.color] || "bg-cyan-500";
              const cols = piece.shape[0].length;
              const rows = piece.shape.length;

              // Grid scale calculation: scale down dynamically to fit neatly inside layout borders
              const scaleFactor = cols > 3 || rows > 3 ? "scale-75" : "scale-90 md:scale-100";

              // Check if currently dragged this specific dock cell
              const isBeingDragged = draggedIdx === pIdx;

              return (
                <div
                  key={piece.id}
                  className="flex items-center justify-center relative select-none w-full h-full min-h-[95px]"
                  style={{ touchAction: "none" }}
                >
                  <div
                    onPointerDown={(e) => handlePointerDown(e, pIdx, piece)}
                    onPointerMove={isBeingDragged ? handlePointerMove : undefined}
                    onPointerUp={isBeingDragged ? (e) => handlePointerUp(e, pIdx) : undefined}
                    className={`relative cursor-grab active:cursor-grabbing transition-transform touch-none flex flex-col justify-center items-center ${scaleFactor} ${
                      isBeingDragged ? "opacity-0 scale-50" : "opacity-100"
                    }`}
                    style={{ touchAction: "none" }}
                  >
                    {/* The physical block matrix display inside dock lane */}
                    <div
                      className="grid gap-[2px] items-center justify-center"
                      style={{
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        width: `${cols * 22}px`,
                        height: `${rows * 22}px`,
                      }}
                    >
                      {piece.shape.map((rowArr, r) =>
                        rowArr.map((cellVal, c) => (
                          <div
                            key={`${r}-${c}`}
                            className={`w-[20px] h-[20px] rounded-sm transition-colors duration-100 ${
                              cellVal === 1 ? skinColor : "bg-transparent border-0"
                            }`}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* RENDER THE FLOATING PREVIEW PIECE DIALOG DURING ACTIVE POSITION DRAGS */}
      {draggedIdx !== null && dockPieces[draggedIdx] && (
        <div
          ref={activeDragRef}
          className="fixed pointer-events-none z-50 origin-center select-none"
          style={{
            left: `${pointerPos.x - dragOffset.x}px`,
            top: `${pointerPos.y - dragOffset.y}px`,
            opacity: 0.96,
          }}
        >
          <div
            className="grid gap-[2.5px]"
            style={{
              gridTemplateColumns: `repeat(${dockPieces[draggedIdx]!.shape[0].length}, minmax(0, 1fr))`,
              width: `${dockPieces[draggedIdx]!.shape[0].length * measuredCellWidth}px`,
            }}
          >
            {dockPieces[draggedIdx]!.shape.map((rowArr, rIdx) =>
              rowArr.map((cellVal, cIdx) => {
                const skinColorClass = THEME_COLOR_MAP[theme][dockPieces[draggedIdx!]!.color] || "bg-cyan-500";
                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`rounded-lg border shadow-lg ${
                      cellVal === 1
                        ? `${skinColorClass} border-white/20 shadow-md`
                        : "bg-transparent border-transparent"
                    }`}
                    style={{
                      width: `${measuredCellWidth - 2}px`,
                      height: `${measuredCellWidth - 2}px`,
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ACCESSIBLE HOW-TO GUIDE INSTRUCTIONS POPOVER */}
      <AnimatePresence>
        {showHowTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-slate-900 border border-slate-750 p-6 rounded-2xl w-full max-w-sm text-slate-100 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-cyan-400">
                <Smartphone className="w-5 h-5 text-cyan-400" /> Block Blast Rules
              </h3>
              <div className="space-y-3.5 text-xs text-slate-300 font-sans leading-relaxed">
                <p>
                  &bull; <strong className="text-white">Drag & Drop:</strong> Select a piece from the dock and drag it onto the board.
                </p>
                <p>
                  &bull; <strong className="text-white">Fit & Pack:</strong> Place the shape into empty coordinates on the 8x8 squares board.
                </p>
                <p>
                  &bull; <strong className="text-white">Clear Rows & Cols:</strong> Fill full lines (horizontally or vertically) to clear them and trigger satisfying score bursts!
                </p>
                <p>
                  &bull; <strong className="text-white">Combos:</strong> Clear lines with consecutive placements to amplify your combo score (1x, 2x, 3x multipliers).
                </p>
                <p>
                  &bull; <strong className="text-white">Difficulty Levels:</strong> Your speed and shape complexity increase every 1,500 points.
                </p>
              </div>

              <button
                onClick={() => setShowHowTo(false)}
                className="w-full mt-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 active:scale-[0.98] text-black font-extrabold rounded-xl text-xs transition-transform cursor-pointer"
              >
                Let's Blast Blocks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER DYNAMIC COMPONENT LEADERBOARDS & CLOUD SYNC SERVICES */}
      <AnimatePresence>
        {isLeaderboardOpen && (
          <Leaderboard
            currentScore={stats.score}
            currentLevel={stats.level}
            blocksCleared={stats.blocksCleared}
            onClose={() => setIsLeaderboardOpen(false)}
            userId={userId}
            username={username}
            onUpdateUsername={handleUpdateUsername}
            onRefreshCloudSave={() => fetchCloudBackup(userId)}
          />
        )}
      </AnimatePresence>

      {/* BOTTOM IMMERSIVE DESIGN FOOTER CREDITS */}
      <footer className="w-full max-w-lg mx-auto py-2 flex items-center justify-between text-[10px] font-mono text-slate-500 mt-4 border-t border-slate-800/10 whitespace-nowrap">
        <span>Tactile Arcade Engine v1.4.0</span>
        <button
          onClick={handleRestart}
          className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Hard Reset
        </button>
      </footer>
    </div>
  );
}
