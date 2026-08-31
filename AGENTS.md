# AGENTS.md — Marvel Heroes Interactive Scrollytelling

Welcome to the **Marvel Heroes** codebase. This file provides architectural rules, aesthetic constraints, design token definitions, and coding standards for all AI agents working on this project.

---

## 1. Project Overview & Aesthetic Direction

This application is a **high-impact, AAA-grade interactive scrollytelling web experience** dedicated to the Marvel Universe. Built with **React 19, Vite, Tailwind CSS, Lenis, and GSAP**, it blends photorealistic 3D canvas sequences with dynamic comic-book and sci-fi HUD aesthetics.

### 🚫 Strict Anti-"AI Slop" Design Rules
When building or modifying UI in this repository, **NEVER** use:
* Generic purple/indigo AI gradients (`from-indigo-500 to-purple-600`).
* Standard default Inter font with boring `rounded-xl bg-zinc-900` cards.
* Cookie-cutter SaaS landing page hero sections.

### ✨ Enforced Visual Directives
* **Spider-Man Universe (Parker Bio-Tech):** Comic book halftone dot matrices, high-contrast black shadows, vibrant Marvel Crimson (`#E23636`) + Web Sky Blue (`#00B4D8`) + Comic Gold (`#F3D403`), dynamic comic exclamation bursts ("THWIP!", "WHOOSH!"), and live telemetry overlays.
* **Iron Man Universe (Stark OS / JARVIS HUD):** Angular chamfered sci-fi glass panels (`clip-path`), Arc Reactor Cyan (`#38BDF8`) + Hot-Rod Crimson (`#B91C1C`) + Stark Gold (`#D4A22F`), holographic scanline reticles, and tactical diagnostic readouts.

---

## 2. Dynamic Superhero Design Tokens (OKLCH)

The application uses dynamic CSS custom properties driven by the root `[data-hero="..."]` attribute:

```css
[data-hero="spiderman"] {
  --hero-hue: 25;
  --hero-accent-hue: 195;
  --hero-primary: #E23636;
  --hero-secondary: #0B3C5D;
  --hero-accent: #00B4D8;
  --hero-glow: rgba(226, 54, 54, 0.6);
}

[data-hero="ironman"] {
  --hero-hue: 45;
  --hero-accent-hue: 185;
  --hero-primary: #D4A22F;
  --hero-secondary: #B91C1C;
  --hero-accent: #38BDF8;
  --hero-glow: rgba(212, 162, 47, 0.6);
}
```

Always utilize these tokens or semantic utility classes (`text-hero-primary`, `border-hero-accent`, `glow-hero`) rather than hardcoding static hex colors in components.

---

## 3. Architecture & Key Systems

### A. Scrollytelling Canvas Sequences
* 16:9 widescreen canvas rendering with `devicePixelRatio` scaling.
* Linear interpolation (`lerp`) and preloading of high-resolution frame sequences (`/frames/`, `/frames2/`, `/assets/`).
* Scroll damping managed via **Lenis** with continuous `requestAnimationFrame` ticking.

### B. Procedural Sound Engine (`src/services/soundEngine.ts`)
* Web Audio API synthesis without external audio file bloat.
* Includes: `playWebShoot()` ("THWIP!"), `playSpiderSense()` (harmonic chime), `playWhoosh()`, `playImpact()`, `playRepulsor()` (Iron Man blast), and `playHudClick()`.
* Must always respect global mute state (`soundEngine.getIsMuted()`).

### C. Component Organization
* `src/components/spiderman/`: Spider-Man 3D sequencers, dive chapters, and bio-tech systems.
* `src/components/ironman/`: Iron Man Mark LXXXV 3D flight sequences, unibeam cinematics, and armor diagnostics.
* `src/components/ui/`: Universal Navbar, Hero Selector modal, telemetry HUDs, and ambient particle backgrounds.

---

## 4. Verification & Testing
Before concluding any task:
1. Run `npm run build` to verify TypeScript compilation and Vite bundling pass without error.
2. Verify responsive layout across mobile and desktop viewports.
3. Test audio synthesis state and hero switching interactivity.
