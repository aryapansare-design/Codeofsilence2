import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SolveProps = { onSolve: () => void };
const later = (fn: () => void, ms = 800) => window.setTimeout(fn, ms);

/* ---------- Room 4A: connection list ---------- */
const CONNECTIONS = [
  { ip: "82.14.9.201", place: "Coffee shop wifi" }, { ip: "10.0.4.17", place: "A desk inside the factory" },
  { ip: "203.0.113.5", place: "Somewhere overseas" }, { ip: "91.200.7.66", place: "Public library" },
  { ip: "172.58.1.9", place: "Mobile phone tower" }, { ip: "45.33.12.80", place: "Hotel lobby" },
];
export function PacketPuzzle({ onSolve }: SolveProps) {
  const [removed, setRemoved] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  function drop(ip: string) {
    if (ip.startsWith("10.0.")) { setMsg("Wait — that one came from inside the factory. Keep it."); return; }
    const next = [...removed, ip]; setRemoved(next); setMsg("");
    if (next.length === CONNECTIONS.length - 1) later(onSolve);
  }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Someone logged into Verma's computer that night. Throw out every connection from outside. Factory computers always start with 10.0.</p>
    <div className="mp-list">{CONNECTIONS.filter((c) => !removed.includes(c.ip)).map((c) => <button key={c.ip} className="mp-row" onClick={() => drop(c.ip)}><strong>{c.ip}</strong><span>{c.place}</span><em>Throw out</em></button>)}</div>
    {msg && <p className="form-error">{msg}</p>}
  </div>;
}

/* ---------- Room 4B: old command screen ---------- */
export function TerminalPuzzle({ onSolve }: SolveProps) {
  const [lines, setLines] = useState<string[]>(["Old office computer. Type 'help' to see what you can do."]);
  const [cmd, setCmd] = useState("");
  function run() {
    const c = cmd.trim().toLowerCase(); setCmd("");
    let out = "I don't know that one. Try 'help'.";
    if (c === "help") out = "Commands: help · list bin · restore <file name>";
    else if (c === "list bin") out = "Deleted files: shopping.txt · note_v.txt";
    else if (c === "restore shopping.txt") out = "Milk, bread, eggs. Nothing useful.";
    else if (c === "restore note_v.txt") { out = "Restored! The note reads: 'Code piece: 5A-H1L'. Someone tried to delete this."; later(onSolve, 1400); }
    setLines((l) => [...l, `> ${c}`, out]);
  }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">A file was deleted from this computer. Get it back.</p>
    <div className="mp-terminal">{lines.map((l, i) => <p key={i}>{l}</p>)}</div>
    <div className="puzzle-answer"><Input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="Type a command" onKeyDown={(e) => e.key === "Enter" && run()} autoFocus /><Button variant="terminal" onClick={run}>Run</Button></div>
  </div>;
}

/* ---------- shared wave drawing ---------- */
function wavePath(height: number, speed: number, shift: number) {
  let d = "";
  for (let x = 0; x <= 300; x += 4) { const y = 60 - height * 9 * Math.sin((x / 300) * Math.PI * 2 * speed + shift * 0.8); d += `${x === 0 ? "M" : "L"}${x},${y.toFixed(1)} `; }
  return d;
}
function Slider({ label, value, set, disabled }: { label: string; value: number; set: (v: number) => void; disabled?: boolean }) {
  return <label className="mp-slider"><span>{label}: {value}</span><input type="range" min={1} max={5} value={value} disabled={disabled} onChange={(e) => set(Number(e.target.value))} /></label>;
}

/* ---------- Room 5A: tuning dials ---------- */
export function DialsPuzzle({ onSolve }: SolveProps) {
  const target = { h: 4, s: 2, p: 3 };
  const [v, setV] = useState({ h: 1, s: 4, p: 1 });
  const done = v.h === target.h && v.s === target.s && v.p === target.p;
  function set(k: keyof typeof v, n: number) { const next = { ...v, [k]: n }; setV(next); if (next.h === target.h && next.s === target.s && next.p === target.p) later(onSolve); }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Turn the three dials until your wave (bright) sits exactly on top of the dotted one.</p>
    <svg className={`mp-wave ${done ? "is-done" : ""}`} viewBox="0 0 300 120"><path className="target" d={wavePath(target.h, target.s, target.p)} /><path className="mine" d={wavePath(v.h, v.s, v.p)} /></svg>
    <div className="mp-sliders"><Slider label="Height" value={v.h} set={(n) => set("h", n)} disabled={done} /><Slider label="Waves" value={v.s} set={(n) => set("s", n)} disabled={done} /><Slider label="Shift" value={v.p} set={(n) => set("p", n)} disabled={done} /></div>
  </div>;
}

/* ---------- Room 5B: shoot the dish ---------- */
export function OrbitPuzzle({ onSolve }: SolveProps) {
  const [isShot, setIsShot] = useState(false);
  function shoot() {
    if (isShot) return;
    setIsShot(true);
    later(onSolve);
  }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">The chart marks the dish's weak point. Put it in the crosshair and fire.</p>
    <svg className={`mp-shoot-range ${isShot ? "is-shot" : ""}`} viewBox="0 0 300 200" role="img" aria-label={isShot ? "Satellite dish hit" : "Satellite dish in crosshair"}>
      <path className="range-grid" d="M0 50H300M0 100H300M0 150H300M75 0V200M150 0V200M225 0V200" />
      <g className="dish-target">
        <path d="M112 70 Q150 132 188 70 Q153 92 112 70" />
        <path d="M150 96V142M129 142H171" />
        <circle cx="150" cy="89" r="7" />
      </g>
      <g className="crosshair">
        <circle cx="150" cy="89" r="34" />
        <path d="M150 42V67M150 111V136M103 89H128M172 89H197" />
      </g>
      {isShot && <g className="impact"><circle cx="150" cy="89" r="17" /><path d="M150 59V119M120 89H180M129 68L171 110M171 68L129 110" /></g>}
    </svg>
    <Button variant="terminal" onClick={shoot} disabled={isShot}>{isShot ? "TARGET HIT" : "SHOOT"}</Button>
  </div>;
}

/* ---------- Room 6A: which drawer ---------- */
const DRAWERS = ["Drawer A", "Drawer B", "Drawer C"];
export function LogicGridPuzzle({ onSolve }: SolveProps) {
  const [pick, setPick] = useState<Record<string, string>>({ Users: "", Logs: "", Keys: "" });
  const [msg, setMsg] = useState("");
  function check() { if (pick["Users"] === "Drawer A" && pick["Logs"] === "Drawer B" && pick["Keys"] === "Drawer C") { setMsg(""); onSolve(); } else setMsg("That doesn't fit all the notes. Read them again."); }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Three folders — Users, Logs and Keys — go in three drawers. Notes on the cabinet:<br/>1. Keys isn't in drawer A or B.<br/>2. Logs isn't in drawer A.</p>
    <div className="mp-grid3">{Object.keys(pick).map((f) => <label key={f}><span>{f}</span><select value={pick[f]} onChange={(e) => setPick({ ...pick, [f]: e.target.value })}><option value="">Choose…</option>{DRAWERS.map((d) => <option key={d}>{d}</option>)}</select></label>)}</div>
    <Button variant="terminal" onClick={check}>Put them away</Button>
    {msg && <p className="form-error">{msg}</p>}
  </div>;
}

/* ---------- Room 6B: power switches ---------- */
export function GatesPuzzle({ onSolve }: SolveProps) {
  const [sw, setSw] = useState([false, false, false]);
  const [a, b, c] = sw as [boolean, boolean, boolean];
  const g1 = a !== b, g2 = b && c, out = g1 && g2;
  function flip(i: number) { if (out) return; const next = sw.map((v, j) => (j === i ? !v : v)); setSw(next); const [x, y, z] = next as [boolean, boolean, boolean]; if (x !== y && y && z) later(onSolve); }
  const Lamp = ({ on, label }: { on: boolean; label: string }) => <div className={`mp-lamp ${on ? "on" : ""}`}><i />{label}</div>;
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Flip the switches to power the server rack.<br/>"ONE ONLY" lights when exactly one of its switches is on. "BOTH" lights when both are on. The rack needs both lights.</p>
    <div className="mp-switches">{["A", "B", "C"].map((l, i) => <Button key={l} variant={sw[i] ? "terminal" : "outline"} onClick={() => flip(i)}>Switch {l}: {sw[i] ? "ON" : "OFF"}</Button>)}</div>
    <div className="mp-switches"><Lamp on={g1} label="ONE ONLY (A, B)" /><Lamp on={g2} label="BOTH (B, C)" /><Lamp on={out} label="SERVER RACK" /></div>
  </div>;
}

/* ---------- Room 7A: voice match ---------- */
export function VoicePuzzle({ onSolve }: SolveProps) {
  const [p, setP] = useState(1); const [s, setS] = useState(5);
  const done = p === 3 && s === 2;
  function upd(np: number, ns: number) { setP(np); setS(ns); if (np === 3 && ns === 2) later(onSolve); }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">A voice note got scrambled. Fix the pitch and speed until your wave matches the dotted one.</p>
    <svg className={`mp-wave ${done ? "is-done" : ""}`} viewBox="0 0 300 120"><path className="target" d={wavePath(3, 2, 0)} /><path className="mine" d={wavePath(p, s, 0)} /></svg>
    <div className="mp-sliders"><Slider label="Pitch" value={p} set={(n) => upd(n, s)} disabled={done} /><Slider label="Speed" value={s} set={(n) => upd(p, n)} disabled={done} /></div>
    {done && <p className="puzzle-success">"...Sahil, don't do this. We can talk..."</p>}
  </div>;
}

/* ---------- Room 7B: eye scanner rings ---------- */
export function RingsPuzzle({ onSolve }: SolveProps) {
  const [rot, setRot] = useState([3, 5, 2]);
  const done = rot.every((r) => r === 0);
  function turn(i: number) { if (done) return; const next = rot.map((r, j) => (j === i ? (r + 1) % 8 : r)); setRot(next); if (next.every((r) => r === 0)) later(onSolve); }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Tap a ring to turn it. Line up all three bright marks at the top to fool the eye scanner.</p>
    <svg className={`mp-rings ${done ? "is-done" : ""}`} viewBox="0 0 200 200">
      {[80, 58, 36].map((r, i) => <g key={r} transform={`rotate(${rot[i]! * 45} 100 100)`} onClick={() => turn(i)} className={`ring ring-${i}`}><circle cx="100" cy="100" r={r} /><circle cx="100" cy={100 - r} r="7" className="mark" /></g>)}
      <circle cx="100" cy="100" r="12" className="pupil" />
    </svg>
  </div>;
}

/* ---------- Room 8A: letter wheel ---------- */
const CIPHER = "VDKLO";
export function CaesarPuzzle({ onSolve }: SolveProps) {
  const [shift, setShift] = useState(0);
  const [guess, setGuess] = useState(""); const [msg, setMsg] = useState("");
  const decoded = CIPHER.split("").map((ch) => String.fromCharCode(((ch.charCodeAt(0) - 65 - shift + 26) % 26) + 65)).join("");
  function check() { if (guess.trim().toUpperCase() === "SAHIL") { setMsg(""); onSolve(); } else setMsg("The lock stays shut."); }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Every letter of the password was moved along the alphabet. Turn the wheel until it becomes a real name, then type it.</p>
    <div className="mp-wheel"><Button variant="outline" onClick={() => setShift((s) => (s + 25) % 26)}>◀</Button><div><small>Turned {shift}</small><strong>{decoded}</strong></div><Button variant="outline" onClick={() => setShift((s) => (s + 1) % 26)}>▶</Button></div>
    <div className="puzzle-answer"><Input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Password" onKeyDown={(e) => e.key === "Enter" && check()} /><Button variant="terminal" onClick={check}>Try it</Button></div>
    {msg && <p className="form-error">{msg}</p>}
  </div>;
}

/* ---------- Room 8B: UV torch ---------- */
const MARKS_UV = [{ x: 18, y: 25, s: "⬡" }, { x: 72, y: 20, s: "O+" }, { x: 40, y: 65, s: "✎" }, { x: 80, y: 75, s: "S.M." }];
export function UVPuzzle({ onSolve }: SolveProps) {
  const [light, setLight] = useState({ x: -50, y: -50 });
  const [found, setFound] = useState<number[]>([]);
  function move(e: ReactPointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
    setLight({ x, y });
    MARKS_UV.forEach((m, i) => { if (!found.includes(i) && Math.hypot(m.x - x, m.y - y) < 9) { const next = [...found, i]; setFound(next); if (next.length === MARKS_UV.length) later(onSolve, 1200); } });
  }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">This page looks blank. Move the UV torch over it to find the four hidden marks.</p>
    <div className="mp-uv" onPointerMove={move} onPointerDown={move} style={{ ["--lx" as string]: `${light.x}%`, ["--ly" as string]: `${light.y}%` }}>
      <p>Monthly supply order. Nothing to see here.</p>
      {MARKS_UV.map((m, i) => <span key={i} className={found.includes(i) ? "found" : ""} style={{ left: `${m.x}%`, top: `${m.y}%` }}>{m.s}</span>)}
    </div>
    <p className="puzzle-hint">Found {found.length}/4</p>
  </div>;
}

/* ---------- Room 9A: wires ---------- */
const WIRES = [{ c: "Red", t: 3 }, { c: "Blue", t: 1 }, { c: "Green", t: 4 }, { c: "Yellow", t: 2 }];
export function WiresPuzzle({ onSolve }: SolveProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [links, setLinks] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState("");
  function plug(t: number) {
    if (!picked) return;
    const next = { ...links, [picked]: t }; setLinks(next); setPicked(null);
    if (Object.keys(next).length === 4) { if (WIRES.every((w) => next[w.c] === w.t)) later(onSolve); else setMsg("Sparks! Something's wrong. Check the note."); }
  }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Note taped to the board: "Red to 3. Blue to 1. Green to 4. Yellow to 2."<br/>Tap a wire, then tap a slot.</p>
    <div className="mp-wires">
      <div>{WIRES.map((w) => <Button key={w.c} variant={picked === w.c ? "terminal" : "outline"} className={`wire-${w.c.toLowerCase()}`} onClick={() => { setPicked(w.c); setMsg(""); }}>{w.c}{links[w.c] ? ` → ${links[w.c]}` : ""}</Button>)}</div>
      <div>{[1, 2, 3, 4].map((t) => <Button key={t} variant="outline" onClick={() => plug(t)}>Slot {t}</Button>)}</div>
    </div>
    {msg && <><p className="form-error">{msg}</p><Button variant="ghost" onClick={() => { setLinks({}); setMsg(""); }}>Pull all wires out</Button></>}
  </div>;
}

/* ---------- Room 9B: pile of keys ---------- */
const LOCK = [3, 1, 4, 2];
function KeyShape({ teeth }: { teeth: number[] }) {
  const pts = teeth.map((t, i) => `${40 + i * 14},20 ${40 + i * 14 + 7},${20 + t * 5}`).join(" ");
  return <svg viewBox="0 0 110 50"><circle cx="18" cy="20" r="12" /><polyline points={`30,20 ${pts} 100,20`} /><line x1="30" y1="14" x2="100" y2="14" /></svg>;
}
export function KeysPuzzle({ onSolve }: SolveProps) {
  const keys = useMemo(() => {
    let seed = 11; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const list: number[][] = [];
    while (list.length < 14) { const k = Array.from({ length: 4 }, () => 1 + Math.floor(rnd() * 4)); if (k.join() !== LOCK.join()) list.push(k); }
    list.splice(9, 0, LOCK); return list;
  }, []);
  const [msg, setMsg] = useState("");
  return <div className="puzzle-stage">
    <p className="puzzle-hint">The lock drawing is on top. Find the one key whose teeth match it exactly.</p>
    <div className="mp-key-target"><KeyShape teeth={LOCK} /></div>
    <div className="mp-keys">{keys.map((k, i) => <button key={i} onClick={() => { if (k.join() === LOCK.join()) { setMsg(""); later(onSolve, 500); } else setMsg("It won't turn."); }}><KeyShape teeth={k} /></button>)}</div>
    {msg && <p className="form-error">{msg}</p>}
  </div>;
}

/* ---------- Room 10A: emails in order ---------- */
const EMAILS = [
  { id: 1, text: "Verma to Sahil: 'I found something awful in the lab. Can we talk?'" },
  { id: 2, text: "Sahil to Director: 'Verma knows. What do I do?'" },
  { id: 3, text: "Director to Sahil: 'Money is sent. Keep him quiet.'" },
  { id: 4, text: "Verma to a reporter: 'Meet me tomorrow. I have proof.'" },
  { id: 5, text: "Sahil to Director: 'It's done. He won't be meeting anyone.'" },
];
export function TimelinePuzzle({ onSolve }: SolveProps) {
  const [order, setOrder] = useState([3, 5, 1, 4, 2]);
  const [msg, setMsg] = useState("");
  function moveUp(i: number) { if (i === 0) return; const n = [...order]; [n[i - 1], n[i]] = [n[i]!, n[i - 1]!]; setOrder(n); }
  function check() { if (order.join() === "1,2,3,4,5") { setMsg(""); onSolve(); } else setMsg("That order doesn't make sense yet."); }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Five emails got jumbled. Put them in the order they were sent. Tap ▲ to move one up.</p>
    <div className="mp-list">{order.map((id, i) => <div key={id} className="mp-row"><span>{EMAILS.find((e) => e.id === id)!.text}</span><Button variant="ghost" size="sm" onClick={() => moveUp(i)} disabled={i === 0}>▲</Button></div>)}</div>
    <Button variant="terminal" onClick={check}>This is the order</Button>
    {msg && <p className="form-error">{msg}</p>}
  </div>;
}

/* ---------- Room 10B: master lock ---------- */
const SEQUENCE = [2, 4, 15, 9];
export function MasterLockPuzzle({ onSolve }: SolveProps) {
  const [step, setStep] = useState(0); const [msg, setMsg] = useState("");
  function press(i: number) {
    if (step >= SEQUENCE.length) return;
    if (SEQUENCE[step] === i) { const n = step + 1; setStep(n); setMsg(""); if (n === SEQUENCE.length) later(onSolve); }
    else { setStep(0); setMsg("Wrong button. The lock resets."); }
  }
  return <div className="puzzle-stage">
    <p className="puzzle-hint">Press four buttons in the right order. Columns and rows: the four lock marks you found tell you which (open your Dossier if you forgot).</p>
    <div className="mp-master">{Array.from({ length: 16 }, (_, i) => <button key={i} className={SEQUENCE.slice(0, step).includes(i) ? "on" : ""} onClick={() => press(i)} aria-label={`Row ${Math.floor(i / 4) + 1}, column ${(i % 4) + 1}`} />)}</div>
    <p className="puzzle-hint">Pressed {step}/4</p>
    {msg && <p className="form-error">{msg}</p>}
  </div>;
}
