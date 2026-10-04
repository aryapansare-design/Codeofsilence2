# Replace the Server Room dish puzzle with shooting

## Scope
- Use the uploaded game project as the app source.
- Change only the third Server Room puzzle (`r2e` / `orbit`).
- Replace dish dragging and three-position tracking with a stationary dish target and a shooting interaction.
- Preserve the existing `orbit` puzzle kind, `r2e` identifier, `onSolve` callback, room sequence, navigation, and component props.
- Update only the puzzle-specific wording and styling needed for the shooting interaction.

## Implementation
- Replace position, drag, and hit-array state with a single shot/target-hit state.
- Render an accessible target area with a crosshair and shoot control; a successful shot calls the existing delayed `onSolve` callback once.
- Keep all other puzzle implementations untouched.
- Verify the app builds and test the changed interaction in the preview without changing other game flows.
