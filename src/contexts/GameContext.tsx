import { type Context, createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { prevPuzzle, roomOrder, type RoomKey } from "@/game/caseData";

interface GameContextType {
  timeRemaining: number;
  // Case progress (10rooms puzzles mapped onto the 4 rooms)
  solvedPuzzles: string[];
  markPuzzleSolved: (id: string) => void;
  clues: string[];
  items: string[];
  collectItem: (id: string) => void;
  isPuzzleActive: (id: string) => boolean;
  addClue: (clue: string) => void;
  unlockedCount: number; // how many rooms (in order) are open
  isRoomUnlocked: (key: RoomKey) => boolean;
  isRoomCleared: (key: RoomKey) => boolean;
  clearRoom: (key: RoomKey) => void;
  caseReady: boolean; // all rooms cleared -> accusation available
  verdict: "resolved" | "failed" | null;
  setVerdict: (v: "resolved" | "failed") => void;
  resetGame: () => void;
}

// Reuse one context object across hot reloads so the provider and consumers never get out of sync.
const g = globalThis as unknown as { __gameCtx?: Context<GameContextType | undefined> };
const GameContext = g.__gameCtx ?? (g.__gameCtx = createContext<GameContextType | undefined>(undefined));

const GAME_DURATION = 3600; // 60 minutes in seconds

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameStartTime, setGameStartTime] = useState<number>(() => Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(GAME_DURATION);
  const [solvedPuzzles, setSolved] = useState<string[]>([]);
  const [clues, setClues] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [cleared, setCleared] = useState<RoomKey[]>([]);
  const [verdict, setVerdict] = useState<"resolved" | "failed" | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeRemaining(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStartTime]);

  const markPuzzleSolved = useCallback((id: string) => setSolved((s) => (s.includes(id) ? s : [...s, id])), []);
  const addClue = useCallback((c: string) => setClues((s) => (s.includes(c) ? s : [...s, c])), []);
  const collectItem = useCallback((id: string) => setItems((s) => (s.includes(id) ? s : [...s, id])), []);
  const isPuzzleActive = useCallback((id: string) => { const p = prevPuzzle(id); return !p || solvedPuzzles.includes(p); }, [solvedPuzzles]);
  const clearRoom = useCallback((k: RoomKey) => setCleared((s) => (s.includes(k) ? s : [...s, k])), []);

  const unlockedCount = Math.min(roomOrder.length, cleared.length + 1);
  const isRoomUnlocked = useCallback((k: RoomKey) => roomOrder.indexOf(k) < unlockedCount, [unlockedCount]);
  const isRoomCleared = useCallback((k: RoomKey) => cleared.includes(k), [cleared]);

  const resetGame = useCallback(() => {
    setGameStartTime(Date.now());
    setTimeRemaining(GAME_DURATION);
    setSolved([]); setClues([]); setItems([]); setCleared([]); setVerdict(null);
  }, []);

  return (
    <GameContext.Provider value={{
      timeRemaining, solvedPuzzles, markPuzzleSolved, clues, addClue, items, collectItem, isPuzzleActive, unlockedCount, isRoomUnlocked, isRoomCleared,
      clearRoom, caseReady: cleared.length === roomOrder.length, verdict, setVerdict, resetGame,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error("useGame must be used within a GameProvider");
  return context;
};
