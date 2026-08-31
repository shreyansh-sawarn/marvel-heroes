# CLAUDE.md — Marvel Heroes Scrollytelling Guidelines

This repository contains the interactive **Marvel Heroes 3D Scrollytelling Experience**.

---

## 🦸‍♂️ Design System & Theme Directives

<always_use_marvel_aesthetic>
Always design components using authentic Marvel Universe aesthetics:
- **Spider-Man (Parker Tech):** Comic halftone dots (`.comic-halftone`), speed lines, Bangers typography (`font-comic`), Marvel Red (`#E23636`) + Web Cyan (`#00B4D8`) + Comic Gold (`#F3D403`).
- **Iron Man (Stark OS / JARVIS):** Chamfered HUD corners (`.tactical-hud-panel`), glowing holographic borders (`.glow-hero`), Stark Gold (`#D4A22F`) + Crimson Red (`#B91C1C`) + Arc Cyan (`#38BDF8`).
- **No Generic AI Slop:** Never use standard purple-indigo gradients or generic corporate cards.
</always_use_marvel_aesthetic>

---

## 🛠️ Commands & Scripts

- `npm run dev` — Starts Vite local dev server at `http://localhost:5173`.
- `npm run build` — Typechecks with `tsc` and compiles bundle with Vite.
- `npm run preview` — Previews production build locally.

---

## 🎨 Color Tokens & OKLCH Theme Architecture

Dynamic superhero styling is driven by the root `[data-hero="..."]` attribute:
- `--hero-primary` / `--hero-secondary` / `--hero-accent` / `--hero-glow`
- Hero IDs: `spiderman`, `ironman`, `blackwidow`, `captainamerica`, `hulk`, `thor`.

---

## 🔊 Procedural Web Audio Engine

All sound effects are synthesized dynamically via `src/services/soundEngine.ts`:
- `soundEngine.playWebShoot()` — Snappy pneumatic web release
- `soundEngine.playSpiderSense()` — Eerie harmonic tingle chime
- `soundEngine.playRepulsor()` — High-energy Stark repulsor beam blast
- `soundEngine.playHudClick()` — Tactical UI interface click
- `soundEngine.playWhoosh()` / `soundEngine.playImpact()`

Always check `soundEngine.getIsMuted()` and handle audio context resumption safely on user gestures.
