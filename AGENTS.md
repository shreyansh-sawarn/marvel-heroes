# AGENTS.md — Spider-Verse & Symbiote Nexus Interactive Scrollytelling

Welcome to the **Spider-Verse & Symbiote Nexus** codebase. This file provides architectural rules, aesthetic constraints, design token definitions, and coding standards for all AI agents working on this project.

---

## 1. Project Overview & Aesthetic Direction

This application is a **high-impact, AAA-grade interactive scrollytelling web experience** dedicated exclusively to **Spider-Man and Symbiote** lore across the multiverse. Built with **React 19, Vite, Tailwind CSS, Lenis, and GSAP**, it blends photorealistic 3D canvas sequences with dynamic comic-book, cybernetic, pulp noir, and living organic symbiote fluid physics.

### 🚫 Strict Anti-"AI Slop" Design Rules
When building or modifying UI in this repository, **NEVER** use:
* Generic purple/indigo AI gradients (`from-indigo-500 to-purple-600`).
* Standard default Inter font with boring `rounded-xl bg-zinc-900` cards.
* Cookie-cutter SaaS landing page hero sections.

### ✨ Enforced Visual Directives
* **Peter Parker (Earth-616):** Comic halftone dot matrices, Marvel Crimson (`#E23636`) + Web Sky Blue (`#00B4D8`) + Comic Gold (`#F3D403`), dynamic comic exclamation bursts ("THWIP!", "WHOOSH!"), and Parker Bio-Tech telemetry.
* **Miles Morales (Earth-1610):** Voltaic Yellow (`#FACC15`) + Electric Crimson (`#EF4444`) + Cyan arcs (`#06B6D4`), hold-to-charge Bio-Electric lightning discharges, and photonic camouflage stealth shaders.
* **Spider-Gwen (Earth-65):** Neon Magenta (`#F43F5E`) + Balletic Teal (`#2DD4BF`) + Ghost White (`#F8FAFC`), Mary Janes rhythm drum-line audio and watercolor pulses.
* **Spider-Man 2099 (Earth-928):** Cyber Red (`#FF0055`) + Neon Cyan (`#00F0FF`) + Nueva Dark Navy (`#050B1E`), temporal frequency calibrators and hard-light laser webbing.
* **Spider-Man Noir (Earth-90214):** 1933 Great Depression chiaroscuro, Trenchcoat Charcoal (`#18181B`) + Detective Amber (`#F59E0B`), match-strike shadow reveal, and typewriter journaling SFX.
* **Venom & Carnage (Klyntar Symbiote Hive):** Living organic fluid simulation (`LivingSymbioteCanvas.tsx`), viscous obsidian tendril mesh tracking cursor and audio frequencies, and acoustic tuning fork resonance test.
* **Spider-Punk (Earth-138):** Anarchy Pink (`#EC4899`) + Zine Yellow (`#EAB308`), 15,000-watt overdriven guitar distortion fuzz pedal and paper-rip borders.

---

## 2. Dynamic Superhero Design Tokens (OKLCH / CSS Variables)

The application uses dynamic CSS custom properties driven by root attributes:
- `[data-hero="spiderman" | "miles" | "gwen" | "spider2099" | "spidernoir" | "venom" | "carnage" | "spiderpunk"]`
- `[data-symbiote="true" | "false"]` (Global Klyntar Infection Surge)

Always utilize semantic tokens (`text-hero-primary`, `border-hero-accent`, `glow-hero`, `symbiote-vignette`) rather than hardcoding static hex colors in components.

---

## 3. Architecture & Key Systems

### A. Scrollytelling Canvas Sequences (`src/components/spiderman/SpiderUniverseHero.tsx`)
* Sticky 100dvh viewport rendering with responsive `devicePixelRatio` scaling.
* 3D gyroscopic mouse parallax and linear interpolation (`lerp`).
* Stage progression (Rooftop Perch, High-Altitude Dive, Manhattan Arc Swing) and live velocity/altitude/G-force telemetry.

### B. Procedural Sound Engine (`src/services/soundEngine.ts`)
* Zero-dependency Web Audio API procedural synthesis.
* Includes: `playWebShoot()` ("THWIP!"), `playSpiderSense()`, `playVenomBlast()`, `playCamouflage()`, `playGwenBeat()`, `play2099Glitch()`, `playNoirTypewriter()`, `playNoirMatchStrike()`, `playSymbioteTendril()`, `playSymbioteRoar()`, `playSonicScreech()`, and `playPunkDistortion()`.

### C. Component Organization
* `src/components/spiderman/`:
  - `SpiderUniverseHero.tsx`: Flagship scrollytelling canvas with 3D tilt.
  - `LivingSymbioteCanvas.tsx`: Interactive living alien symbiote fluid & tendril physics simulator.
  - `WebShooterPhysicsPlayground.tsx`: Elastic web-line tension & ballistics simulator.
  - `VenomBlastShockwave.tsx`: Miles Morales bio-electric capacitor & camouflage.
  - `SpiderGwenRhythmStage.tsx`: Drum-line beat pads and audio shockwaves.
  - `Spider2099GlitchNexus.tsx`: Alchemax temporal anomaly stabilizer.
  - `SpiderNoirDetectiveOffice.tsx`: 1933 Great Depression pulp dossiers & typewriter.
  - `SpiderPunkAnarchyStage.tsx`: 15,000-watt guitar fuzz pedal & zine shredder.
  - `MultiverseMap.tsx`: The Web of Life & Destiny interactive cosmic node constellation.
  - `SpiderSuitDiagnostics.tsx`: Dynamic suit blueprint and bio-engineering telemetry.
* `src/components/ui/`:
  - `SpiderNavbar.tsx`: Multiverse navigation bar with Symbiote Surge toggle and sound controls.
  - `MultiverseSelectorModal.tsx`: Full-screen reality selector with live stat radars and Symbiote Codex previews.
  - `HeroTransitionCurtain.tsx`: Cinematic dimensional warp curtain.
  - `BackgroundParticles.tsx`: Ambient universe-specific spores and embers.

---

## 4. Verification & Testing
Before concluding any task:
1. Run `npm run build` to verify TypeScript compilation and Vite bundling pass without error.
2. Verify responsive layout across mobile and desktop viewports.
3. Test audio synthesis state, hero switching, and Symbiote Surge interactivity.
