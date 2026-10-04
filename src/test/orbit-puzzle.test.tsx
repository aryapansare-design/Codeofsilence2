import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrbitPuzzle } from "@/components/game/MorePuzzles";

describe("Server Room dish puzzle", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("completes through the existing callback when the dish is shot", () => {
    vi.useFakeTimers();
    const onSolve = vi.fn();

    render(<OrbitPuzzle onSolve={onSolve} />);
    fireEvent.click(screen.getByRole("button", { name: "SHOOT" }));

    expect(screen.getByRole("button", { name: "TARGET HIT" })).toBeDisabled();
    expect(screen.getByRole("img", { name: "Satellite dish hit" })).toBeInTheDocument();
    expect(onSolve).not.toHaveBeenCalled();

    vi.advanceTimersByTime(800);
    expect(onSolve).toHaveBeenCalledTimes(1);
  });
});