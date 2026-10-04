import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, FolderLock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/contexts/GameContext";
import { images, KILLER, suspects } from "@/game/caseData";

export const Route = createFileRoute("/verdict")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "The Final Question — Code of Silence" },
      { name: "description", content: "Review your evidence and name the person who killed Dr. Verma." },
      { property: "og:title", content: "The Final Question — Code of Silence" },
      { property: "og:description", content: "You only get one chance to name the killer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Verdict,
});

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function Verdict() {
  const { caseReady, clues, verdict, setVerdict, timeRemaining, resetGame } = useGame();
  const navigate = useNavigate();

  if (!caseReady) {
    return (
      <main className="outcome-screen">
        <span>CASE INCOMPLETE</span>
        <h1>NOT YET</h1>
        <p>Clear all four rooms before you name the killer.</p>
        <Link to="/" search={{ skipIntro: true }}><Button variant="terminal" size="terminal">Back to the map <ChevronRight /></Button></Link>
      </main>
    );
  }

  if (verdict) {
    const success = verdict === "resolved";
    return (
      <main className={`outcome-screen outcome-story ${success ? "success" : "failure"}`} style={{ backgroundImage: `linear-gradient(0deg, var(--background), transparent), url(${success ? images.suspects : images.lab})` }}>
        <span>{success ? "CASE CLOSED" : "CASE UNSOLVED"}</span>
        <h1>{success ? "SAHIL MEHRA" : "WRONG ARREST"}</h1>
        <p>{success ? "Verma's best friend. Sahil killed him before he could tell anyone what the factory was building." : "The real killer is still free."}</p>
        <div className="outcome-time"><small>TIME LEFT</small><strong>{fmt(timeRemaining)}</strong></div>
        <Button variant={success ? "terminal" : "danger"} size="terminal" onClick={() => { resetGame(); navigate({ to: "/" }); }}>Play again <ChevronRight /></Button>
      </main>
    );
  }

  return (
    <section className="accusation-screen">
      <div className="accusation-heading">
        <span>THE FINAL QUESTION</span>
        <h1>WHO KILLED<br />VERMA?</h1>
        <p>Think back over what you found. You only get one chance to name the killer.</p>
        <div className="clue-log"><span><FolderLock className="inline w-3" /> EVIDENCE</span>{clues.map((c) => <p key={c}>— {c}</p>)}</div>
      </div>
      <div className="suspect-grid">
        {suspects.map((s) => (
          <article key={s.name} className="suspect-card">
            <div className="suspect-photo" style={{ backgroundImage: `url(${images.suspects})`, backgroundPosition: s.pos }} />
            <div className="suspect-info">
              <span>{s.role}</span><h3>{s.name}</h3>
              <dl><div><dt>BLOOD</dt><dd>{s.blood}</dd></div><div><dt>TATTOO</dt><dd>{s.tattoo}</dd></div><div><dt>PRINT</dt><dd>{s.print}</dd></div></dl>
              <Button variant="danger" onClick={() => setVerdict(s.name === KILLER ? "resolved" : "failed")}><ShieldAlert /> Accuse</Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
