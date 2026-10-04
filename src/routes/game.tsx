import { Suspense, lazy } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const RoomOne = lazy(() => import("@/components/rooms/RoomOne"));
const RoomTwo = lazy(() => import("@/components/rooms/RoomTwo"));
const RoomThree = lazy(() => import("@/components/rooms/RoomThree"));
const RoomFour = lazy(() => import("@/components/rooms/RoomFour"));

export const Route = createFileRoute("/game")({
  ssr: false,
  validateSearch: z.object({ room: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Crime Scene — Code of Silence" },
      { name: "description", content: "Investigate the crime scene in first person and solve the puzzles hidden inside." },
      { property: "og:title", content: "Crime Scene — Code of Silence" },
       { property: "og:description", content: "Walk the scene, discover hidden clues, crack the door code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

function Game() {
  const { room = "" } = Route.useSearch();
  const key = room.toLowerCase();
  const Room = key === "research" ? RoomTwo : key === "archive" ? RoomThree : key === "server" ? RoomFour : RoomOne;
  const title = key === "research" ? "Server Room" : key === "archive" ? "Research Lab" : key === "server" ? "Archive Room" : "Dr. Verma's Office";

  return (
    <div className="min-h-screen bg-black relative">
      <Link to="/" search={{ skipIntro: true }} className="fixed top-8 left-8 z-50">
        <Button variant="outline" className="h-12 px-6 font-display font-bold bg-black/80 border-red-900/70 text-white hover:bg-red-900/20 hover:border-red-600">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </Link>
      <Suspense fallback={
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
          <div className="w-20 h-20 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin mb-8" />
          <div className="text-red-600 text-3xl font-display font-bold mb-2 animate-pulse">{title}</div>
          <div className="text-white/60 text-lg font-display">Loading 3D Environment...</div>
        </div>
      }>
        <Room />
      </Suspense>
    </div>
  );
}
