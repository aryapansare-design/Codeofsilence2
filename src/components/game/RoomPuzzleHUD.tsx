import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AudioLines, ChevronRight, DoorOpen, FolderLock, LockKeyhole, ScanEye, UserRoundSearch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGame } from "@/contexts/GameContext";
import { allPuzzles, findPuzzle, getRoom, images, itemLabel, prevPuzzle, puzzleChain, roomOrder, suspects, type CaseRoom, type Puzzle, type PuzzleKind, type RoomKey } from "@/game/caseData";
import { interactionBus, useInteraction } from "@/game/interactionBus";
import { JigsawPuzzle, LaserPuzzle, PunchCardPuzzle, RemotePuzzle, TextPuzzle } from "./Puzzles";
import { CaesarPuzzle, DialsPuzzle, GatesPuzzle, KeysPuzzle, LogicGridPuzzle, MasterLockPuzzle, OrbitPuzzle, PacketPuzzle, RingsPuzzle, TerminalPuzzle, TimelinePuzzle, UVPuzzle, VoicePuzzle, WiresPuzzle } from "./MorePuzzles";

type Modal = "evidence" | "keypad" | "dossier" | null;
const puzzleLabel = (id: string) => `Puzzle ${puzzleChain.indexOf(id) + 1}`;

function PuzzleBody({ puzzle, room, onSolve }: { puzzle: Puzzle; room: CaseRoom; onSolve: () => void }) {
  const digits = puzzle.success.match(/:-\s*(\d+)/)?.[1] ?? "";
  if (puzzle.kind === "jigsaw") return <JigsawPuzzle image={room.image} secret={digits} onSolve={onSolve} />;
  if (puzzle.kind === "remote") return <RemotePuzzle image={images.server} onSolve={onSolve} />;
  if (puzzle.kind === "laser") return <LaserPuzzle onSolve={onSolve} />;
  if (puzzle.kind === "punch") return <PunchCardPuzzle onSolve={onSolve} />;
  const more: Partial<Record<PuzzleKind, (p: { onSolve: () => void }) => ReactElement>> = { packet: PacketPuzzle, terminal: TerminalPuzzle, dials: DialsPuzzle, orbit: OrbitPuzzle, logic: LogicGridPuzzle, gates: GatesPuzzle, voice: VoicePuzzle, rings: RingsPuzzle, caesar: CaesarPuzzle, uv: UVPuzzle, wires: WiresPuzzle, keys: KeysPuzzle, timeline: TimelinePuzzle, master: MasterLockPuzzle };
  const Extra = more[puzzle.kind];
  if (Extra) return <Extra onSolve={onSolve} />;
  return <TextPuzzle prompt="Type your answer below." answer={puzzle.answer ?? ""} onSolve={onSolve} />;
}

export function RoomPuzzleHUD({ roomKey }: { roomKey: RoomKey }) {
  const room = getRoom(roomKey);
  const navigate = useNavigate();
  const { openNodeId } = useInteraction();
  const { solvedPuzzles, markPuzzleSolved, clues, addClue, items, collectItem, isPuzzleActive, isRoomCleared, clearRoom, isRoomUnlocked } = useGame();
  const [modal, setModal] = useState<Modal>(null);
  const [step, setStep] = useState(0);
  const [justSolved, setJustSolved] = useState<string | null>(null);
  const [keypad, setKeypad] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    interactionBus.setModalOpen(modal !== null);
    return () => interactionBus.setModalOpen(false);
  }, [modal]);

  const puzzles = allPuzzles(room);
  const solvedHere = puzzles.filter((p) => solvedPuzzles.includes(p.id)).length;
  const roomSolved = solvedHere === puzzles.length;
  const cleared = isRoomCleared(roomKey);
  const node = room.nodes.find((n) => n.id === openNodeId) ?? null;

  // Sealed room guard: send the player back to the map
  useEffect(() => { if (!isRoomUnlocked(roomKey)) navigate({ to: "/", search: { skipIntro: true } }); }, [isRoomUnlocked, roomKey, navigate]);

  // Open a node at its first unsolved puzzle
  useEffect(() => {
    if (!node) return;
    const first = node.puzzles.findIndex((p) => !solvedPuzzles.includes(p.id));
    setStep(first === -1 ? 0 : first); setJustSolved(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNodeId]);

  const current = node?.puzzles[step];
  const nextPuzzle = current ? puzzleChain[puzzleChain.indexOf(current.id) + 1] : null;
  const reviewing = !!current && solvedPuzzles.includes(current.id);
  const active = !!current && isPuzzleActive(current.id);
  const missing = current?.needs?.filter((i) => !items.includes(i)) ?? [];
  const prev = current ? prevPuzzle(current.id) : null;
  const searchItem = node?.item;
  const searchActive = !!searchItem && isPuzzleActive(searchItem.forPuzzle);
  const alreadyHad = !!searchItem && items.includes(searchItem.id);
  const piecesHere = room.nodes.filter((n) => n.item).length;
  const foundHere = room.nodes.filter((n) => n.item && items.includes(n.item.id)).length;

  // Collect a piece when its search spot is opened and active
  useEffect(() => {
    if (searchItem && searchActive && !items.includes(searchItem.id)) collectItem(searchItem.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNodeId]);

  function solve(p: Puzzle) {
    markPuzzleSolved(p.id);
    setJustSolved(p.id);
  }

  function nextStep() {
    if (!node) return;
    setJustSolved(null);
    if (step < node.puzzles.length - 1) { setStep(step + 1); return; }
    interactionBus.close();
    const nowSolved = puzzles.every((pz) => solvedPuzzles.includes(pz.id));
    if (nowSolved && !clues.includes(room.clue)) setModal("evidence");
  }

  function submitCode() {
    if (keypad !== room.code) { setError("INVALID CODE"); return; }
    setError(""); setKeypad(""); setModal(null); clearRoom(roomKey);
    const idx = roomOrder.indexOf(roomKey);
    if (idx === roomOrder.length - 1) navigate({ to: "/verdict" });
    else navigate({ to: "/", search: { skipIntro: true } });
  }

  return (
    <div className="case-hud">
      <div className="hud-room">
        <span>ACTIVE SCENE</span>
        <strong>{room.name}</strong>
        <small>{solvedHere}/{puzzles.length} puzzles · {foundHere}/{piecesHere} pieces · {clues.length}/4 evidence</small>
      </div>
      <div className="hud-actions">
        <Button variant="terminal" size="sm" onClick={() => setModal("dossier")}><UserRoundSearch /> Dossier</Button>
        {roomSolved && clues.includes(room.clue) && <Button variant="terminal" size="sm" onClick={() => setModal("evidence")}><FolderLock /> Evidence</Button>}
        <Button variant={roomSolved ? "terminal" : "ghost"} size="sm" disabled={!roomSolved || cleared} onClick={() => { setError(""); setModal("keypad"); }}>
          {roomSolved ? <DoorOpen /> : <LockKeyhole />} {cleared ? "UNLOCKED" : roomSolved ? "EXIT KEYPAD" : "SEALED"}
        </Button>
      </div>


      {node && current && (
        <div className="modal-backdrop" role="presentation">
          <section className="game-modal" role="dialog" aria-modal="true" aria-label={`${puzzleLabel(current.id)}: ${current.title}`}>
            <Button variant="ghost" size="icon" className="modal-close" onClick={() => interactionBus.close()} aria-label="Close"><X /></Button>
            <div className="modal-kicker"><AudioLines /> {node.label.toUpperCase()} · {step + 1}/{node.puzzles.length}</div>
            <h2>{puzzleLabel(current.id)}: {current.title}</h2>
            {reviewing ? (
              <>
                <p className="puzzle-success">{current.success}</p>
                {nextPuzzle && <p>Next: {puzzleLabel(nextPuzzle)}.</p>}
                <Button variant="terminal" onClick={nextStep}>{step < node.puzzles.length - 1 ? "Next" : "Done"} <ChevronRight /></Button>
              </>
            ) : !active ? (
              <>
                <p>Nothing responds yet. Something else needs to be solved first{prev ? ` — follow the hint from "${findPuzzle(prev)?.title}" (${puzzleLabel(prev)})` : ""}. This clue is for {puzzleLabel(current.id)} — come back later.</p>
                <Button variant="ghost" onClick={() => interactionBus.close()}>Back away</Button>
              </>
            ) : missing.length ? (
              <>
                <p>Clue for {puzzleLabel(current.id)}: {current.prompt.split(".")[0]}… but pieces are missing. Search the room for:</p>
                <ul className="clue-log">{current.needs!.map((i) => <p key={i}>{items.includes(i) ? "✓" : "—"} {itemLabel(i)}{!items.includes(i) && room.nodes.find((n) => n.item?.id === i) ? ` (try: ${room.nodes.find((n) => n.item?.id === i)!.label})` : ""}</p>)}</ul>
                <Button variant="ghost" onClick={() => interactionBus.close()}>Keep searching</Button>
              </>
            ) : (
              <>
                <p>Clue for {puzzleLabel(current.id)}: {current.prompt}</p>
                <PuzzleBody key={current.id} puzzle={current} room={room} onSolve={() => solve(current)} />
              </>
            )}
          </section>
        </div>
      )}

      {node && searchItem && (
        <div className="modal-backdrop" role="presentation">
          <section className="game-modal" role="dialog" aria-modal="true" aria-label={`${node.label} — ${puzzleLabel(searchItem.forPuzzle)}`}>
            <Button variant="ghost" size="icon" className="modal-close" onClick={() => interactionBus.close()} aria-label="Close"><X /></Button>
            <div className="modal-kicker"><ScanEye /> {node.label.toUpperCase()}</div>
            {searchActive ? <>
              <h2>{alreadyHad ? "Already searched" : "Found: " + searchItem.label}</h2>
               <p className="puzzle-success">Clue for {puzzleLabel(searchItem.forPuzzle)}: {searchItem.found}</p>
            </> : <>
              <h2>Nothing useful… yet</h2>
              <p>You get the feeling this spot will matter later.</p>
               <p>This item isn't useful yet — save it for {puzzleLabel(searchItem.forPuzzle)}.</p>
            </>}
            <Button variant="terminal" onClick={() => interactionBus.close()}>OK <ChevronRight /></Button>
          </section>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" role="presentation">
          <section className="game-modal" role="dialog" aria-modal="true">
            <Button variant="ghost" size="icon" className="modal-close" onClick={() => setModal(null)} aria-label="Close"><X /></Button>
            {modal === "evidence" && <>
              <div className="modal-kicker"><FolderLock /> FOUND EVIDENCE</div>
              <h2>EVIDENCE / {room.name.slice(0, 2)}</h2>
              <div className="evidence-paper"><span>VERMA CASE · KEEP THIS</span><p>{room.evidence}</p><strong>{room.clue}</strong></div>
              <Button variant="terminal" onClick={() => { addClue(room.clue); setModal(null); }}>Keep this clue</Button>
            </>}
            {modal === "keypad" && <>
              <div className="modal-kicker"><LockKeyhole /> LOCKED DOOR</div>
              <h2>ENTER {room.code.length}-DIGIT CODE</h2>
              <Input className="keypad-input" inputMode="numeric" value={keypad} onChange={(e) => setKeypad(e.target.value.replace(/\D/g, "").slice(0, room.code.length))} onKeyDown={(e) => e.key === "Enter" && submitCode()} placeholder={"•".repeat(room.code.length)} autoFocus />
              <Button variant="terminal" onClick={submitCode}>Unlock door</Button>
              {error && <p className="form-error">{error}</p>}
            </>}
            {modal === "dossier" && <>
              <div className="modal-kicker"><UserRoundSearch /> ACTIVE SUSPECT DOSSIER</div>
              <h2>PERSONS OF INTEREST</h2>
              <div className="dossier-list">{suspects.map((s) => <div key={s.name}><strong>{s.name}</strong><span>{s.blood} · {s.tattoo === "Yes" ? "TATTOO" : "NO TATTOO"} · {s.print}</span></div>)}</div>
              <div className="clue-log"><span>COLLECTED EVIDENCE</span>{clues.length ? clues.map((c) => <p key={c}>— {c}</p>) : <p>— No evidence logged.</p>}</div>
            </>}
          </section>
        </div>
      )}
    </div>
  );
}
