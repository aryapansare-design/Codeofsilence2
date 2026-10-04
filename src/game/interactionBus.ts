import { useSyncExternalStore } from "react";

/** Tiny store bridging the 3D canvas (proximity checks) and the DOM puzzle overlay. */
type State = { nearNodeId: string | null; nearNodeIds: string[]; openNodeId: string | null; modalOpen: boolean };
let state: State = { nearNodeId: null, nearNodeIds: [], openNodeId: null, modalOpen: false };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const interactionBus = {
  get: () => state,
  setNear(ids: string[]) {
    const best = ids[0] ?? null;
    const same = ids.length === state.nearNodeIds.length && ids.every((id, i) => state.nearNodeIds[i] === id);
    if (!same) { state = { ...state, nearNodeIds: ids, nearNodeId: best }; emit(); }
  },
  open(id: string) { state = { ...state, openNodeId: id }; emit(); },
  close() { state = { ...state, openNodeId: null }; emit(); },
  setModalOpen(open: boolean) { if (state.modalOpen !== open) { state = { ...state, modalOpen: open }; emit(); } },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};

export const useInteraction = () => useSyncExternalStore(interactionBus.subscribe, interactionBus.get, interactionBus.get);
