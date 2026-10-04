<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep puzzle overlays and the 3D interaction hint synchronized through the shared interaction bus so prompts appear only during free exploration.
- Keep interaction hit areas invisible at their existing room coordinates and use the shared interaction bus for both clicks and proximity; this keeps puzzles discoverable without visual markers.
- Preserve puzzle IDs, kinds, and `onSolve` wiring when changing puzzle interactions so the room sequence remains compatible.
