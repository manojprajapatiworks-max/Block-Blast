import { BlockPiece, ThemeType } from "./types";

export interface Template {
  shape: number[][];
  color: string;
  difficulty: "easy" | "medium" | "hard";
}

// Coordinate configurations for modern, balanced block templates
export const BLOCK_TEMPLATES: Template[] = [
  // EASY: 1x1, 1x2, 1x3, small corners
  {
    shape: [[1]],
    color: "pink",
    difficulty: "easy"
  },
  {
    shape: [[1, 1]],
    color: "cyan",
    difficulty: "easy"
  },
  {
    shape: [
      [1],
      [1]
    ],
    color: "cyan",
    difficulty: "easy"
  },
  {
    shape: [[1, 1, 1]],
    color: "lime",
    difficulty: "easy"
  },
  {
    shape: [
      [1],
      [1],
      [1]
    ],
    color: "lime",
    difficulty: "easy"
  },
  {
    shape: [
      [1, 1],
      [1, 0]
    ],
    color: "blue",
    difficulty: "easy"
  },
  {
    shape: [
      [1, 1],
      [0, 1]
    ],
    color: "blue",
    difficulty: "easy"
  },

  // MEDIUM: 2x2 squares, standard L-shapes, T-shapes, S/Z-shapes
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: "yellow",
    difficulty: "medium"
  },
  {
    shape: [
      [1, 0],
      [1, 0],
      [1, 1]
    ],
    color: "blue",
    difficulty: "medium"
  },
  {
    shape: [
      [1, 1],
      [1, 0],
      [1, 0]
    ],
    color: "blue",
    difficulty: "medium"
  },
  {
    shape: [
      [0, 1],
      [0, 1],
      [1, 1]
    ],
    color: "blue",
    difficulty: "medium"
  },
  {
    shape: [
      [1, 1],
      [0, 1],
      [0, 1]
    ],
    color: "blue",
    difficulty: "medium"
  },
  {
    shape: [
      [1, 1, 1],
      [1, 0, 0]
    ],
    color: "blue",
    difficulty: "medium"
  },
  {
    shape: [
      [1, 1, 1],
      [0, 0, 1]
    ],
    color: "blue",
    difficulty: "medium"
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: "blue",
    difficulty: "medium"
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: "blue",
    difficulty: "medium"
  },
  // T-Shapes
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    color: "teal",
    difficulty: "medium"
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: "teal",
    difficulty: "medium"
  },
  {
    shape: [
      [1, 0],
      [1, 1],
      [1, 0]
    ],
    color: "teal",
    difficulty: "medium"
  },
  {
    shape: [
      [0, 1],
      [1, 1],
      [0, 1]
    ],
    color: "teal",
    difficulty: "medium"
  },
  // Z/S-Shapes (tactical diagonal placement builders)
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: "rose",
    difficulty: "medium"
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: "rose",
    difficulty: "medium"
  },
  {
    shape: [
      [1, 0],
      [1, 1],
      [0, 1]
    ],
    color: "rose",
    difficulty: "medium"
  },
  {
    shape: [
      [0, 1],
      [1, 1],
      [1, 0]
    ],
    color: "rose",
    difficulty: "medium"
  },

  // HARD / STRATEGIC: 1x4, big corners, U-shapes, giant squares
  {
    shape: [[1, 1, 1, 1]],
    color: "orange",
    difficulty: "hard"
  },
  {
    shape: [
      [1],
      [1],
      [1],
      [1]
    ],
    color: "orange",
    difficulty: "hard"
  },
  {
    shape: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    color: "purple",
    difficulty: "hard"
  },
  {
    shape: [
      [1, 1, 1],
      [1, 0, 1]
    ],
    color: "violet",
    difficulty: "hard"
  },
  {
    shape: [
      [1, 0],
      [1, 1],
      [1, 1]
    ],
    color: "violet",
    difficulty: "hard"
  },
  {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0]
    ],
    color: "amber",
    difficulty: "hard"
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

// Helper to convert template to typed block piece
function makePiece(selected: Template): BlockPiece {
  const shape = selected.shape;
  const height = shape.length;
  const width = shape[0].length;
  return {
    id: `piece_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
    shape,
    color: selected.color,
    skinColor: "",
    width,
    height
  };
}

// Smart, progressive generator that provides high strategic agency
export function generateDockPieces(level: number): BlockPiece[] {
  const easies = BLOCK_TEMPLATES.filter((t) => t.difficulty === "easy");
  const mediums = BLOCK_TEMPLATES.filter((t) => t.difficulty === "medium");
  const hards = BLOCK_TEMPLATES.filter((t) => t.difficulty === "hard");

  // Selection profiles based on level to scale gameplay smoothly
  let selection: Template[] = [];

  if (level <= 2) {
    // Early game: 2 Easies (enables combo setups) and 1 Medium template
    const easy1 = easies[Math.floor(Math.random() * easies.length)];
    const easy2 = easies[Math.floor(Math.random() * easies.length)];
    const medium1 = mediums[Math.floor(Math.random() * mediums.length)];
    selection = [easy1, easy2, medium1];
  } else if (level <= 5) {
    // Mid game balance: 1 Easy (tactical escape/snug helper), 1 Medium, 1 Hard
    const easy1 = easies[Math.floor(Math.random() * easies.length)];
    const medium1 = mediums[Math.floor(Math.random() * mediums.length)];
    const hard1 = hards[Math.floor(Math.random() * hards.length)];
    selection = [easy1, medium1, hard1];
  } else {
    // High difficulty: 1 Easy, 2 Medium/Hard mix
    const easy1 = easies[Math.floor(Math.random() * easies.length)];
    const roll1 = Math.random() < 0.4 ? mediums : hards;
    const item1 = roll1[Math.floor(Math.random() * roll1.length)];
    const roll2 = Math.random() < 0.3 ? mediums : hards;
    const item2 = roll2[Math.floor(Math.random() * roll2.length)];
    selection = [easy1, item1, item2];
  }

  // Shuffle pieces so they don't always appear in the same docket positions
  const shuffled = [...selection].sort(() => Math.random() - 0.5);

  return shuffled.map(makePiece);
}

// Fallback random retriever
export function getRandomPiece(level: number): BlockPiece {
  const templates = BLOCK_TEMPLATES;
  const idx = Math.floor(Math.random() * templates.length);
  return makePiece(templates[idx]);
}
