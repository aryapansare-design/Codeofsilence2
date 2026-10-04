import labAsset from "@/assets/verma-lab.jpg.asset.json";
import serverAsset from "@/assets/verma-server.jpg.asset.json";
import coreAsset from "@/assets/verma-core.jpg.asset.json";
import suspectsAsset from "@/assets/verma-suspects.jpg.asset.json";

export const images = { lab: labAsset.url, server: serverAsset.url, core: coreAsset.url, suspects: suspectsAsset.url };

export type RoomKey = "verma" | "research" | "archive" | "server";
export type PuzzleKind =
  | "jigsaw" | "remote" | "laser" | "punch" | "text" | "packet" | "terminal" | "dials" | "orbit" | "logic"
  | "gates" | "voice" | "rings" | "caesar" | "uv" | "wires" | "keys" | "timeline" | "master";
export type Puzzle = { id: string; title: string; prompt: string; kind: PuzzleKind; answer?: string; success: string; needs?: string[] };
/** A scattered component the player must find before a puzzle can be attempted. */
export type ItemDef = { id: string; label: string; forPuzzle: string; found: string };
/** An interactive object in the 3D room. `position` is its invisible interaction area; proximity is measured on the floor plane.
 *  Nodes with `item` are search spots that hand over a scattered piece; others host puzzles. */
export type InteractionNodeDef = { id: string; label: string; position: [number, number, number]; radius: number; puzzles: Puzzle[]; item?: ItemDef };
export type CaseRoom = { key: RoomKey; name: string; code: string; image: string; intro: string; evidence: string; clue: string; nodes: InteractionNodeDef[] };

const spot = (id: string, label: string, position: [number, number, number], item: ItemDef, radius = 0.45): InteractionNodeDef => ({ id, label, position, radius, puzzles: [], item });

/** 12 puzzles in one sequential chain across the 4 rooms. Each needs scattered pieces found at search spots. */
export const caseRooms: CaseRoom[] = [
  {
    key: "verma", name: "01 / DR. VERMA'S OFFICE", code: "731", image: labAsset.url,
    intro: "This is where they found Verma. A torn photo is missing pieces — search the room and press E when close to something.",
    evidence: "The door log shows Verma let the visitor in himself. A drop of O+ blood under the desk isn't his. A six-sided print mark and wrist-tattoo ink were left on the door.",
    clue: "Office: The killer was someone Verma trusted — O+ blood, a hexagon print mark and a tattoo.",
    nodes: [
      { id: "verma-screen", label: "Inspect the desk", position: [-0.74, 2.7, -1.8], radius: 1.1, puzzles: [
        { id: "r1a", title: "The torn photograph", prompt: "You've gathered every scrap of the photo. Put it back together.", kind: "jigsaw", needs: ["photo-1", "photo-2", "photo-3"],
          success: "Someone scribbled on the photo.\nDigit 1 of the door code is:- 7\n\nNEXT: The back of the photo reads 'The light pipes under my desk still work — one mirror fell somewhere in this office.'" },
        { id: "r1c", title: "The light pipes", prompt: "The pipe grid under the desk is complete again. Route the beam to the sensor.", kind: "laser", needs: ["mirror"],
          success: "The sensor clicks and the drawer slides open — a punch card is inside.\nDigit 2 of the door code is:- 3\n\nNEXT: The card is useless without the printout it was punched for. Verma kept his printouts near the window." },
      ]},
      { id: "verma-paper", label: "Read the loose pages", position: [1.6, 2.2, 0.8], radius: 1.1, puzzles: [
        { id: "r1d", title: "The card", prompt: "Lay the punch card over the scrambled printout.", kind: "punch", needs: ["printout"],
          success: "BLOOD. That's what they were hiding.\nDigit 3 of the door code is:- 1\n\nNEXT: Pencilled on the printout: 'Wiped my files from the lab terminal. The recovery stick is taped under the bench by the front window of the server room.'" },
      ]},
      spot("verma-s1", "Check under the rug", [-1.5, 2.7, 1.8], { id: "photo-1", label: "Photo scrap (top)", forPuzzle: "r1a", found: "A torn scrap of photo — the top corner." }),
      spot("verma-s2", "Search the bookshelf", [1.4, 2.7, -1.4], { id: "photo-2", label: "Photo scrap (middle)", forPuzzle: "r1a", found: "Tucked between two books: another piece of the photo." }),
      spot("verma-s3", "Check the bin", [-1.5, 2.7, -0.2], { id: "photo-3", label: "Photo scrap (bottom)", forPuzzle: "r1a", found: "Crumpled in the bin: the last scrap of the photo." }),
      spot("verma-s4", "Look behind the table in Verma's office", [0.3, 2.7, 1.9], { id: "mirror", label: "Small mirror", forPuzzle: "r1c", found: "A small angled mirror — it fell out of the light pipes." }),
      spot("verma-s5", "Search by the window", [1.4, 2.7, 1.9], { id: "printout", label: "Scrambled printout", forPuzzle: "r1d", found: "A printout full of random letters. The punch card should fit over it." }),
    ],
  },
  {
    key: "research", name: "02 / SERVER ROOM", code: "406", image: serverAsset.url,
    intro: "Verma's computer was used after he died. His files were wiped — find the recovery stick — try the bench by the front window.",
    evidence: "Someone logged in from a desk inside the factory at 2:14 AM — Sahil's desk. The lab's transmitter called one number all night, saved as 'S. Mehra'.",
    clue: "Lab: The late-night login came from Sahil's desk, and the calls went to Sahil's phone.",
    nodes: [
      { id: "research-screen", label: "Use the lab terminal", position: [-1.8, 3.6, 6], radius: 1.1, puzzles: [
        { id: "r2c", title: "The recycle bin", prompt: "Plug in the recovery stick and restore what was deleted.", kind: "terminal", needs: ["usb"],
          success: "The deleted note is back.\nDigit 1 of the door code is:- 4\n\nNEXT: The note says 'The transmitter is humming on the wrong wave. Its two dial knobs were pulled off and hidden.'" },
      ]},
      { id: "research-paper", label: "Use the transmitter", position: [-1.59, 3.6, 4], radius: 1.1, puzzles: [
        { id: "r2d", title: "The humming dials", prompt: "Both knobs are back on. Tune the wave.", kind: "dials", needs: ["knob-1", "knob-2"],
          success: "The signal is clear now.\nDigit 2 of the door code is:- 0\n\nNEXT: The signal repeats: 'The dish weak point is marked on the chart by the back door. The firing controls are by the front window.'" },
      ]},
      { id: "research-dish", label: "Shoot the dish", position: [1.2, 3.6, 3], radius: 0.9, puzzles: [
        { id: "r2e", title: "The dish", prompt: "Use the chart to identify the weak point, then shoot the dish.", kind: "orbit", needs: ["dish-chart"],
          success: "Direct hit. The dish is disabled.\nDigit 3 of the door code is:- 6\n\nNEXT: The dish was pointed at the archive. Someone hid files there in three different drawers." },
      ]},
      spot("research-s1", "Search the lab bench", [1.4, 3.6, 2.6], { id: "usb", label: "Recovery stick", forPuzzle: "r2c", found: "A USB recovery stick taped under the bench." }, 0.7),
      spot("research-s2", "Check the supply shelf", [1.5, 3.6, 7.6], { id: "knob-1", label: "Dial knob A", forPuzzle: "r2d", found: "A transmitter knob, labelled A." }),
      spot("research-s3", "Look in the sink cabinet", [1.5, 3.6, 5.2], { id: "knob-2", label: "Dial knob B", forPuzzle: "r2d", found: "Another knob, labelled B." }),
      spot("research-s4", "Check by the back door", [0, 3.6, 7.9], { id: "dish-chart", label: "Dish target chart", forPuzzle: "r2e", found: "A technical chart circles the dish's vulnerable receiver." }),
    ],
  },
  {
    key: "archive", name: "03 / RESEARCH LAB", code: "198", image: coreAsset.url,
    intro: "Rows of filing cabinets. Three files were hidden in different drawers.",
    evidence: "A payment slip: a large sum sent to Sahil the day before the murder. The eye scanner was switched off with Sahil's card. Verma's hidden note reads 'S.M.'. Scratched marks: 'Lock mark 1: row 1, column 3' · 'Lock mark 2: row 2, column 1' · 'Lock mark 3: row 4, column 4'.",
    clue: "Archive: Sahil was paid, his card switched off the cameras, and Verma's note says 'S.M.' (Lock marks: r1c3, r2c1, r4c4)",
    nodes: [
      { id: "archive-screen", label: "Search the cabinets", position: [1.0, 2.7, 7.3], radius: 1.0, puzzles: [
        { id: "r3a", title: "Files A, B, C", prompt: "You have all three files. Put each back in its drawer.", kind: "logic", needs: ["file-a", "file-b", "file-c"],
          success: "Everything is back in its drawer.\nDigit 1 of the door code is:- 1\n\nNEXT: File C says the archive rack lost power — 'two fuses were removed and stashed nearby.'" },
        { id: "r3b", title: "The fuse box", prompt: "Both fuses are in. Get power to the rack.", kind: "gates", needs: ["fuse-1", "fuse-2"],
          success: "The rack hums to life.\nDigit 2 of the door code is:- 9\n\nNEXT: A locked box on the reading desk lights up. Its letter wheel is missing." },
      ]},
      { id: "archive-paper", label: "Inspect the locked box", position: [-1.2, 2.7, 4], radius: 1.0, puzzles: [
        { id: "r3e", title: "The shuffled name", prompt: "The letter wheel is back in place. Shuffle it until a name appears.", kind: "caesar", needs: ["wheel"],
          success: "The password was a name: SAHIL.\nDigit 3 of the door code is:- 8\n\nNEXT: Inside the box: 'Proof is in the server room. Bring light — the ink is invisible.'" },
      ]},
      spot("archive-s1", "Open drawer A", [1.0, 2.7, 3.9], { id: "file-a", label: "File A", forPuzzle: "r3a", found: "File A — payroll records." }),
      spot("archive-s2", "Open drawer B", [-1.3, 2.7, 7.3], { id: "file-b", label: "File B", forPuzzle: "r3a", found: "File B — security card logs." }),
      spot("archive-s3", "Open drawer C", [-1.3, 2.7, 5.6], { id: "file-c", label: "File C", forPuzzle: "r3a", found: "File C — a maintenance note about the power rack." }),
      spot("archive-s4", "Search the boxes", [1.0, 2.7, 5.6], { id: "fuse-1", label: "Fuse #1", forPuzzle: "r3b", found: "A glass fuse wrapped in tape." }),
      spot("archive-s5", "Check the floor vent", [-0.2, 2.7, 6.5], { id: "fuse-2", label: "Fuse #2", forPuzzle: "r3b", found: "The second fuse, hidden in the vent." }),
      spot("archive-s6", "Look on top of the cabinet", [0.0, 2.7, 7.4], { id: "wheel", label: "Letter wheel", forPuzzle: "r3e", found: "A brass letter wheel — it belongs on the locked box." }),
    ],
  },
  {
    key: "server", name: "04 / ARCHIVE ROOM", code: "246", image: serverAsset.url,
    intro: "The last room. Whatever happened, the proof is in here — but you'll need light to see it.",
    evidence: "A jacket with dried O+ blood on the cuff, name tag 'Sahil'. Emails prove the director paid Sahil to keep Verma quiet — and Sahil wrote 'It's done' that night.",
    clue: "Server: Sahil's jacket has blood on it, and he told the director 'It's done'.",
    nodes: [
      { id: "server-screen", label: "Inspect the blank page", position: [0.6, 2.8, 5.8], radius: 0.55, puzzles: [
        { id: "r4a", title: "Invisible ink", prompt: "You have the UV torch. Sweep it over the blank page.", kind: "uv", needs: ["uv-torch"],
          success: "Invisible ink!\nDigit 1 of the door code is:- 2\n\nNEXT: The ink says 'Printed emails were torn out of order — two pages are still missing.'" },
      ]},
      { id: "server-paper", label: "Read the printed emails", position: [0.1, 2.8, 4.1], radius: 0.55, puzzles: [
        { id: "r4d", title: "The jumbled emails", prompt: "All pages are here. Put the emails in order.", kind: "timeline", needs: ["email-1", "email-2"],
          success: "Now the story makes sense. Scrawled under the last email: 'Lock mark 4: row 3, column 2'.\nDigit 2 of the door code is:- 4\n\nNEXT: The vault panel is a grid of columns and rows. Press the four lock marks in order (check your Dossier)." },
        { id: "r4e", title: "Columns and rows", prompt: "A panel of sixteen buttons guards the vault. Use the four lock marks in order.", kind: "master",
          success: "The vault swings open.\nDigit 3 of the door code is:- 6" },
      ]},
      spot("server-s1", "Search the cable tray", [-0.4, 2.8, 4.5], { id: "uv-torch", label: "UV torch", forPuzzle: "r4a", found: "A small UV torch, still working." }, 0.35),
      spot("server-s2", "Check behind the rack", [-0.4, 2.8, 5.8], { id: "email-1", label: "Email page 1", forPuzzle: "r4d", found: "A crumpled email printout." }, 0.35),
      spot("server-s3", "Look in the printer tray", [0.6, 2.8, 4.5], { id: "email-2", label: "Email page 2", forPuzzle: "r4d", found: "Another email page, jammed in the printer." }, 0.35),
    ],
  },
];

/** Global puzzle order: each puzzle (and its scattered pieces) activates only once the previous one is solved. */
export const puzzleChain = ["r1a", "r1c", "r1d", "r2c", "r2d", "r2e", "r3a", "r3b", "r3e", "r4a", "r4d", "r4e"];
export const prevPuzzle = (id: string) => { const i = puzzleChain.indexOf(id); return i > 0 ? puzzleChain[i - 1]! : null; };
export const allItems = caseRooms.flatMap((r) => r.nodes.flatMap((n) => (n.item ? [n.item] : [])));
export const itemLabel = (id: string) => allItems.find((i) => i.id === id)?.label ?? id;

export const roomOrder: RoomKey[] = caseRooms.map((r) => r.key);
export const getRoom = (key: RoomKey) => caseRooms.find((r) => r.key === key)!;
export const allPuzzles = (room: CaseRoom) => room.nodes.flatMap((n) => n.puzzles);
export const findPuzzle = (id: string) => caseRooms.flatMap(allPuzzles).find((p) => p.id === id);

export const suspects = [
  { name: "Sahil Mehra", role: "Verma's best friend", blood: "O+", tattoo: "Yes", print: "Hexagon", pos: "0% 0%" },
  { name: "Anand Rao", role: "Verma's boss", blood: "AB−", tattoo: "No", print: "Triangle", pos: "100% 0%" },
  { name: "Soham Iyer", role: "Verma's coworker", blood: "B+", tattoo: "No", print: "Circle", pos: "0% 100%" },
  { name: "Raghav", role: "Facility caretaker", blood: "A+", tattoo: "Yes", print: "Square", pos: "100% 100%" },
];
export const KILLER = "Sahil Mehra";
