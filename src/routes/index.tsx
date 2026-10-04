import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TitleScreen } from "@/components/intro/TitleScreen";
import { LogoReveal } from "@/components/intro/LogoReveal";
import { TeamIdentification } from "@/components/intro/TeamIdentification";
import { InvestigationMap } from "@/components/intro/InvestigationMap";

type Phase = "title" | "logo" | "team" | "investigation";

export const Route = createFileRoute("/")({
  validateSearch: z.object({ skipIntro: z.boolean().optional() }),
  head: () => ({
    meta: [
      { title: "Code of Silence — The Verma Case" },
      { name: "description", content: "Walk through four 3D crime scenes, crack twenty puzzles and name Dr. Verma's killer." },
      { property: "og:title", content: "Code of Silence — The Verma Case" },
      { property: "og:description", content: "Four rooms. Twenty puzzles. One killer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { skipIntro } = Route.useSearch();
  const [phase, setPhase] = useState<Phase>(skipIntro ? "investigation" : "title");

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {phase === "title" && <TitleScreen onComplete={() => setPhase("logo")} />}
      {phase === "logo" && <LogoReveal onComplete={() => setPhase("team")} />}
      {phase === "team" && <TeamIdentification onComplete={() => setPhase("investigation")} />}
      {phase === "investigation" && <InvestigationMap />}
    </main>
  );
}
