import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { getRoom, type InteractionNodeDef, type RoomKey } from "@/game/caseData";
import { interactionBus, useInteraction } from "@/game/interactionBus";

/** Invisible hit area at the original marker coordinates. */
function Node({ node, showPrompt, isNearest }: { node: InteractionNodeDef; showPrompt: boolean; isNearest: boolean }) {
  return (
    <group>
      <mesh position={node.position} onClick={(event) => {
        event.stopPropagation();
        const state = interactionBus.get();
        if (!state.openNodeId && !state.modalOpen) interactionBus.open(node.id);
      }}>
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {showPrompt && (
        <Html position={[node.position[0], node.position[1] + 0.25, node.position[2]]} center zIndexRange={[40, 41]}>
          <button
            type="button"
            className="interact-prompt"
            onClick={(e) => {
              e.stopPropagation();
              const s = interactionBus.get();
              if (!s.openNodeId && !s.modalOpen) interactionBus.open(node.id);
            }}
          >
            {isNearest && <kbd>E</kbd>} {node.item ? "SEARCH" : "INSPECT"} · {node.label}
          </button>
        </Html>
      )}
    </group>
  );
}

/** Per-frame distance check between the player camera and every node in the room. */
export function InteractionNodes({ roomKey }: { roomKey: RoomKey }) {
  const room = getRoom(roomKey);
  const { camera } = useThree();
  const { nearNodeIds, openNodeId, modalOpen } = useInteraction();

  useFrame(() => {
    const inRange = room.nodes
      .map((n) => ({ id: n.id, d: Math.hypot(camera.position.x - n.position[0], camera.position.z - n.position[2]), r: n.radius }))
      .filter((n) => n.d <= n.r)
      .sort((a, b) => a.d - b.d)
      .map((n) => n.id);
    interactionBus.setNear(inRange);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyE") return;
      const s = interactionBus.get();
      if (s.openNodeId || !s.nearNodeId) return;
      interactionBus.open(s.nearNodeId);
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); interactionBus.setNear([]); interactionBus.close(); };
  }, []);

  return (
    <>
      {room.nodes.map((n) => (
        <Node key={n.id} node={n} showPrompt={nearNodeIds.includes(n.id) && !openNodeId && !modalOpen} isNearest={nearNodeIds[0] === n.id} />
      ))}
    </>
  );
}
