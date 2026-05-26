export type CellState = {
  filled: boolean;
  color: string; // Tailwind class background prefix or color hex code
  id?: string;
};

export type Board = CellState[][]; // 8x8 grid

export interface BlockPiece {
  id: string; // unique identification for dock piece instances
  shape: number[][]; // 2D layout matrix, e.g. [[1,1], [1,0]]
  color: string; // color name identifier
  skinColor: string; // hex or specialized Tailwind color class
  width: number;
  height: number;
}

export type ThemeType = "neon" | "retro" | "candy" | "gem";

export interface GameStats {
  score: number;
  highScore: number;
  level: number;
  combo: number;
  blocksCleared: number;
  linesCleared: number;
}

export interface CloudSaveData {
  userId: string;
  username: string;
  highScore: number;
  level: number;
  blocksCleared: number;
  skin: ThemeType;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  level: number;
  blocksCleared: number;
  date: string;
}
