import { BlockPiece, ThemeType } from "./types";

// Raw coordinates mapping for various block shapes
export const BLOCK_TEMPLATES = [
  // 1x1 Dot
  {
    shape: [[1]],
    color: "pink",
  },
  // 1x2 Horizontal / Vertical
  {
    shape: [[1, 1]],
    color: "cyan",
  },
  {
    shape: [
      [1],
      [1]
    ],
    color: "cyan",
  },
  // 1x3 Horizontal / Vertical
  {
    shape: [[1, 1, 1]],
    color: "lime",
  },
  {
    shape: [
      [1],
      [1],
      [1]
    ],
    color: "lime",
  },
  // 1x4 Horizontal / Vertical
  {
    shape: [[1, 1, 1, 1]],
    color: "orange",
  },
  {
    shape: [
      [1],
      [1],
      [1],
      [1]
    ],
    color: "orange",
  },
  // 2x2 Square
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: "yellow",
  },
  // 3x3 Gigantic Square (Advanced Difficulty)
  {
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    color: "purple",
    isHard: true,
  },
  // L-shapes
  {
    shape: [
      [1, 0],
      [1, 0],
      [1, 1]
    ],
    color: "blue",
  },
  {
    shape: [
      [1, 1],
      [1, 0],
      [1, 0]
    ],
    color: "blue",
  },
  {
    shape: [
      [0, 1],
      [0, 1],
      [1, 1]
    ],
    color: "blue",
  },
  {
    shape: [
      [1, 1],
      [0, 1],
      [0, 1]
    ],
    color: "blue",
  },
  {
    shape: [
      [1, 1, 1],
      [1, 0, 0]
    ],
    color: "blue",
  },
  {
    shape: [
      [1, 1, 1],
      [0, 0, 1]
    ],
    color: "blue",
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: "blue",
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: "blue",
  },
  // T-Shapes
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    color: "teal",
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: "teal",
  },
  {
    shape: [
      [1, 0],
      [1, 1],
      [1, 0]
    ],
    color: "teal",
  },
  {
    shape: [
      [0, 1],
      [1, 1],
      [0, 1]
    ],
    color: "teal",
  },
  // Z-shapes & S-shapes
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: "rose",
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: "rose",
  },
  {
    shape: [
      [1, 0],
      [1, 1],
      [0, 1]
    ],
    color: "rose",
  },
  {
    shape: [
      [0, 1],
      [1, 1],
      [1, 0]
    ],
    color: "rose",
  },
  
  // Custom Hard shapes for higher levels
  {
    shape: [
      [1, 1, 1],
      [1, 0, 1]
    ],
    color: "violet",
    isHard: true,
  },
  {
    shape: [
      [1, 0],
      [1, 1],
      [1, 1]
    ],
    color: "violet",
    isHard: true,
  },
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0]
    ],
    color: "amber",
    isHard: true,
  }
];

// Aesthetic Themes Map matching Tailwind-friendly colors or clean HEX gradients
export const THEME_COLOR_MAP: Record<ThemeType, Record<string, string>> = {
  neon: {
    pink: "bg-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.7)] text-pink-500",
    cyan: "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)] text-cyan-400",
    lime: "bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.7)] text-lime-400",
    orange: "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.7)] text-orange-500",
    yellow: "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.7)] text-yellow-400",
    purple: "bg-violet-600 shadow-[0_0_12px_rgba(124,58,237,0.7)] text-violet-600",
    blue: "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.7)] text-blue-500",
    teal: "bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.7)] text-teal-400",
    rose: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.7)] text-rose-500",
    violet: "bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.7)] text-purple-500",
    amber: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.7)] text-amber-500"
  },
  retro: {
    pink: "bg-red-800 border-2 border-red-950 text-red-800",
    cyan: "bg-stone-500 border-2 border-stone-800 text-stone-500",
    lime: "bg-emerald-800 border-2 border-emerald-950 text-emerald-800",
    orange: "bg-amber-800 border-2 border-amber-950 text-amber-800",
    yellow: "bg-yellow-700 border-2 border-yellow-950 text-yellow-700",
    purple: "bg-purple-900 border-2 border-purple-950 text-purple-900",
    blue: "bg-teal-700 border-2 border-teal-950 text-teal-700",
    teal: "bg-slate-600 border-2 border-slate-900 text-slate-600",
    rose: "bg-rose-800 border-2 border-rose-950 text-rose-800",
    violet: "bg-zinc-700 border-2 border-zinc-950 text-zinc-700",
    amber: "bg-orange-800 border-2 border-orange-950 text-orange-800"
  },
  candy: {
    pink: "bg-pink-300 border border-white text-pink-300",
    cyan: "bg-sky-300 border border-white text-sky-300",
    lime: "bg-green-200 border border-white text-green-200",
    orange: "bg-orange-300 border border-white text-orange-300",
    yellow: "bg-yellow-200 border border-white text-yellow-200",
    purple: "bg-purple-300 border border-white text-purple-300",
    blue: "bg-indigo-300 border border-white text-indigo-300",
    teal: "bg-teal-200 border border-white text-teal-200",
    rose: "bg-red-300 border border-white text-red-300",
    violet: "bg-violet-300 border border-white text-violet-300",
    amber: "bg-amber-200 border border-white text-amber-200"
  },
  gem: {
    pink: "bg-radial from-rose-400 to-rose-700 border border-rose-900 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-rose-600",
    cyan: "bg-radial from-cyan-400 to-cyan-700 border border-cyan-900 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-cyan-600",
    lime: "bg-radial from-emerald-400 to-emerald-700 border border-emerald-950 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-emerald-600",
    orange: "bg-radial from-orange-400 to-orange-700 border border-orange-900 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-orange-600",
    yellow: "bg-radial from-amber-300 to-amber-600 border border-amber-800 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-amber-500",
    purple: "bg-radial from-violet-500 to-violet-800 border border-violet-950 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-violet-600",
    blue: "bg-radial from-blue-500 to-blue-800 border border-blue-900 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-blue-600",
    teal: "bg-radial from-teal-400 to-teal-700 border border-teal-900 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-teal-600",
    rose: "bg-radial from-pink-500 to-pink-800 border border-pink-900 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-pink-600",
    violet: "bg-radial from-purple-400 to-purple-700 border border-purple-900 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-purple-600",
    amber: "bg-radial from-amber-400 to-amber-700 border border-amber-900 shadow-[0_2px_6px_rgba(0,0,0,0.4)] text-amber-600"
  }
};

// Returns standard tailwind values to use as borders/text styling in non-block states
export const THEME_BG_CLASSES: Record<ThemeType, string> = {
  neon: "bg-slate-950 border-slate-800 text-slate-100",
  retro: "bg-[#e8dec9] border-[#c0b298] text-[#332211]",
  candy: "bg-pink-50 border-pink-150 text-pink-900",
  gem: "bg-indigo-950 border-indigo-900 text-indigo-50"
};

// Generates a brand new unique board piece based on current game level (difficulty scale)
export function getRandomPiece(level: number): BlockPiece {
  // Higher level -> higher chance of selecting hard shapes
  const hardShapeChance = Math.min(0.05 + level * 0.04, 0.45); // up to 45% chance
  const filterHard = Math.random() < hardShapeChance;

  let candidates = BLOCK_TEMPLATES.filter((template) => {
    if (filterHard) return true; // Can choose any, including hard
    return !template.isHard; // Filter out hard ones on easy/early levels
  });

  // Fallback in case list is empty
  if (candidates.length === 0) {
    candidates = BLOCK_TEMPLATES.filter((t) => !t.isHard);
  }

  const selectedTemplate = candidates[Math.floor(Math.random() * candidates.length)];
  const shape = selectedTemplate.shape;
  const height = shape.length;
  const width = shape[0].length;

  return {
    id: `piece_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
    shape,
    color: selectedTemplate.color,
    skinColor: "", // dynamically bound during rendering by active theme
    width,
    height,
  };
}

export function generateDockPieces(level: number): BlockPiece[] {
  return [
    getRandomPiece(level),
    getRandomPiece(level),
    getRandomPiece(level)
  ];
}
