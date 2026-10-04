# Focus Mode UI

Bug Fix: Hide the interaction hint popup (e.g., [E] INSPECT THE DESK & TV) whenever a puzzle modal or inspection overlay is open.

Instructions:

Locate the component rendering the 3D interaction prompt (the [E] INSPECT... UI element).

Check the global/parent state for when a puzzle or modal is active (e.g., isPuzzleOpen, activeModal, or active inspection mode).

Conditionally hide or unmount the [E] INSPECT... hint when any puzzle overlay is open. It should only be visible when the player is freely exploring in the 3D view.

Do not modify any other code: Keep all 3D canvas settings, puzzle logic, layouts, styles, and existing functionality completely unchanged.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://interaction-hideaway.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c8ea41e7-cfb8-47db-aec5-02e42de0e776).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
