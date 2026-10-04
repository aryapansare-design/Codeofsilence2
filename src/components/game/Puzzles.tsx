import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SolveProps = { onSolve: () => void };

/* ---------- Room 1A: torn photograph jigsaw ---------- */
const JIG = 3;
const TORN = [
  "polygon(0 2%,30% 0,62% 3%,100% 0,98% 34%,100% 70%,97% 100%,60% 97%,28% 100%,0 98%,3% 60%,0 30%)",
  "polygon(2% 0,40% 3%,72% 0,100% 2%,97% 40%,100% 74%,98% 100%,66% 98%,34% 100%,0 97%,2% 64%,0 28%)",
  "polygon(0 0,35% 2%,68% 0,98% 3%,100% 36%,97% 66%,100% 98%,70% 100%,36% 97%,3% 100%,0 70%,2% 36%)",
];

export function JigsawPuzzle({ image, secret, onSolve }: SolveProps & { image: string; secret: string }) {
  const [order, setOrder] = useState<number[]>(() => {
    const a = Array.from({ length: JIG * JIG }, (_, i) => i);
    do { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } } while (a.every((v, i) => v === i));
    return a;
  });
  const [picked, setPicked] = useState<number | null>(null);
  const dragFrom = useRef<number | null>(null);
  const done = order.every((v, i) => v === i);

  function swap(a: number, b: number) {
    if (a === b || done) return;
    const next = [...order]; [next[a], next[b]] = [next[b]!, next[a]!]; setOrder(next); setPicked(null);
    if (next.every((v, i) => v === i)) window.setTimeout(onSolve, 900);
  }

  return <div className="puzzle-stage">
    <p className="puzzle-hint">Drag the torn pieces (or tap two pieces) to swap them until the photo is whole.</p>
    <div className={`jigsaw-board ${done ? "is-done" : ""}`}>
      {order.map((piece, slot) => {
        const r = Math.floor(piece / JIG), c = piece % JIG;
        return <div key={slot} className={`jigsaw-piece ${picked === slot ? "is-picked" : ""} ${piece === slot ? "is-right" : ""}`}
          style={{ clipPath: done ? "none" : TORN[piece % TORN.length] }}
          draggable={!done}
          onDragStart={() => { dragFrom.current = slot; }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { if (dragFrom.current !== null) swap(dragFrom.current, slot); dragFrom.current = null; }}
          onClick={() => (picked === null ? setPicked(slot) : swap(picked, slot))}>
          <div className="jigsaw-inner" style={{ left: `${-c * 100}%`, top: `${-r * 100}%`, backgroundImage: `url(${image})` }}>
            <span className="jigsaw-secret">{secret}</span>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

/* ---------- Room 1B: CRT TV remote ---------- */
const MARKS = [
  { sym: "👁", n: 3 }, { sym: "✋", n: 5 }, { sym: "✕", n: 2 },
];
export function RemotePuzzle({ image, onSolve }: SolveProps & { image: string }) {
  const code = MARKS.map((m) => m.n).join("");
  const [entry, setEntry] = useState("");
  const [msg, setMsg] = useState("");
  const spots = useMemo(() => {
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    return MARKS.flatMap((m) => Array.from({ length: m.n }, () => ({ sym: m.sym, x: 8 + rnd() * 80, y: 10 + rnd() * 75 })));
  }, []);
  function press(k: string) {
    setMsg("");
    if (k === "C") return setEntry("");
    if (k === "OK") { if (entry === code) { setMsg("Channel found."); window.setTimeout(onSolve, 600); } else { setMsg("Just static. Count again."); setEntry(""); } return; }
    setEntry((e) => (e + k).slice(0, 3));
  }
  return <div className="puzzle-stage remote-layout">
    <div className="crt-tv" style={{ backgroundImage: `url(${image})` }}>
      <div className="crt-static" />
      {spots.map((s, i) => <span key={i} className="crt-mark" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${i * 0.37}s` }}>{s.sym}</span>)}
      <div className="crt-channel">CH {entry.padEnd(3, "-")}</div>
    </div>
    <div className="tv-remote">
      <p className="puzzle-hint">Count the eyes, then the hands, then the crosses on the screen. Punch the counts in that order and press OK.</p>
      <div className="remote-pad">{["1","2","3","4","5","6","7","8","9","C","0","OK"].map((k) => <Button key={k} variant="outline" onClick={() => press(k)}>{k}</Button>)}</div>
      {msg && <p className="form-error">{msg}</p>}
    </div>
  </div>;
}

/* ---------- Room 2A: laser mirrors ---------- */
type Tile = { kind: "straight" | "corner" | "empty"; rot: number };
const N = 4;
// solution path: enters (0,0) from the left, leaves (3,3) to the right
const SOLUTION: Record<string, Tile> = {
  "0,0": { kind: "straight", rot: 0 }, "0,1": { kind: "corner", rot: 2 }, "1,1": { kind: "corner", rot: 0 },
  "1,2": { kind: "corner", rot: 2 }, "2,2": { kind: "straight", rot: 1 }, "3,2": { kind: "corner", rot: 0 }, "3,3": { kind: "straight", rot: 0 },
};
const openings = (t: Tile) => (t.kind === "empty" ? [] : (t.kind === "straight" ? [1, 3] : [0, 1]).map((d) => (d + t.rot) % 4));
const DR = [-1, 0, 1, 0], DC = [0, 1, 0, -1];

function trace(grid: Tile[][]) {
  const lit = new Set<string>(); let r = 0, c = 0, from = 3;
  for (let steps = 0; steps < 40; steps++) {
    const t = grid[r]?.[c]; if (!t) return { lit, exited: false };
    const o = openings(t); if (!o.includes(from)) return { lit, exited: false };
    lit.add(`${r},${c}`);
    const out = o.find((d) => d !== from)!;
    if (r === N - 1 && c === N - 1 && out === 1) return { lit, exited: true };
    r += DR[out]!; c += DC[out]!; from = (out + 2) % 4;
  }
  return { lit, exited: false };
}

export function LaserPuzzle({ onSolve }: SolveProps) {
  const [grid, setGrid] = useState<Tile[][]>(() => Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    const s = SOLUTION[`${r},${c}`];
    const kind = s?.kind ?? (Math.random() < 0.5 ? "corner" : "straight");
    return { kind, rot: (s ? s.rot + 1 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 4)) % 4 } as Tile;
  })));
  const { lit, exited } = trace(grid);
  function rotate(r: number, c: number) {
    if (exited) return;
    const next = grid.map((row) => row.map((t) => ({ ...t })));
    next[r]![c]!.rot = (next[r]![c]!.rot + 1) % 4; setGrid(next);
    if (trace(next).exited) window.setTimeout(onSolve, 900);
  }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Tap a mirror to turn it. Guide the beam from the left emitter to the sensor on the right.</p>
    <div className={`laser-wrap ${exited ? "is-done" : ""}`}>
      <span className="laser-emitter" /><span className="laser-sensor" />
      <div className="laser-grid">
        {grid.map((row, r) => row.map((t, c) => {
          const on = lit.has(`${r},${c}`);
          return <button key={`${r}-${c}`} className={`laser-cell ${on ? "is-lit" : ""}`} onClick={() => rotate(r, c)} aria-label={`Mirror ${r + 1}-${c + 1}`}>
            <svg viewBox="0 0 100 100">{openings(t).map((d) => <line key={d} x1="50" y1="50" x2={50 + DC[d]! * 50} y2={50 + DR[d]! * 50} />)}<circle cx="50" cy="50" r="8" /></svg>
          </button>;
        }))}
      </div>
    </div>
  </div>;
}

/* ---------- Room 2B: punch card ---------- */
const COLS = 9, ROWS = 6, CELL = 38;
const HOLES: [number, number][] = [[0, 0], [2, 0], [1, 1], [3, 1], [2, 2]]; // [col,row] reading order
const TARGET = { c: 4, r: 2 };
const WORD = "BLOOD";
export function PunchCardPuzzle({ onSolve }: SolveProps) {
  const letters = useMemo(() => {
    const filler = "QZXMWKRTVJHNPYGFCUSEALIDOB".split("");
    const g = Array.from({ length: ROWS * COLS }, (_, i) => filler[(i * 7 + 3) % filler.length]!);
    HOLES.forEach(([c, r], i) => { g[(TARGET.r + r) * COLS + TARGET.c + c] = WORD[i]!; });
    return g;
  }, []);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const [guess, setGuess] = useState("");
  const [msg, setMsg] = useState("");
  const maxX = (COLS - 4) * CELL, maxY = (ROWS - 3) * CELL;

  const down = (e: ReactPointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }; };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => { const d = drag.current; if (!d) return; setPos({ x: Math.min(maxX, Math.max(0, d.ox + e.clientX - d.sx)), y: Math.min(maxY, Math.max(0, d.oy + e.clientY - d.sy)) }); };
  const up = () => { drag.current = null; setPos((p) => ({ x: Math.round(p.x / CELL) * CELL, y: Math.round(p.y / CELL) * CELL })); };
  function check() { if (guess.trim().toUpperCase() === WORD) { setMsg(""); onSolve(); } else setMsg("That word doesn't open anything."); }

  return <div className="puzzle-stage">
    <p className="puzzle-hint">Slide the punch card over the scrambled printout. When the holes line up just right, they spell a word.</p>
    <div className="punch-sheet" style={{ width: COLS * CELL, height: ROWS * CELL }}>
      {letters.map((l, i) => <span key={i} style={{ width: CELL, height: CELL }}>{l}</span>)}
      <div className="punch-card" style={{ width: 4 * CELL, height: 3 * CELL, transform: `translate(${pos.x}px, ${pos.y}px)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {HOLES.map(([c, r], i) => <i key={i} style={{ left: c * CELL + 5, top: r * CELL + 5, width: CELL - 10, height: CELL - 10 }} />)}
      </div>
    </div>
    <div className="puzzle-answer"><Input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="The word is…" onKeyDown={(e) => e.key === "Enter" && check()} /><Button variant="terminal" onClick={check}>Try it</Button></div>
    {msg && <p className="form-error">{msg}</p>}
  </div>;
}

/* ---------- Room 3: typed answers ---------- */
export function TextPuzzle({ prompt, answer, onSolve }: SolveProps & { prompt: string; answer: string }) {
  const [guess, setGuess] = useState(""); const [msg, setMsg] = useState("");
  function check() { if (guess.trim().toLowerCase() === answer.toLowerCase()) onSolve(); else setMsg("Not quite. Take another look."); }
  return <div className="puzzle-stage"><p className="puzzle-hint">{prompt}</p>
    <div className="puzzle-answer"><Input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Your answer" onKeyDown={(e) => e.key === "Enter" && check()} autoFocus /><Button variant="terminal" onClick={check}>Check</Button></div>
    {msg && <p className="form-error">{msg}</p>}</div>;
}
