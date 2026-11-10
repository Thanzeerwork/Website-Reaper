# AGENTS.md — Universal AI Agent Guidelines

This file defines the agent behavior, rules, and skills for **Google Antigravity (AGY)**, **Codex / OpenAI**, **Cursor**, and **Claude Code**.

---

## 🌟 Available Skills

### `web-clone-architect`
An autonomous, user-driven website cloner and modern framework conversion architect.
- **Skill Path**: `skills/web-clone-architect/SKILL.md` (Global: `~/.gemini/config/skills/web-clone-architect/SKILL.md`)
- **Capabilities**:
  - Ingests raw HTML, live URLs, or Website-Reaper clone archives.
  - Deconstructs DOM into semantic sections (`Hero`, `Features`, `Pricing`, `Testimonials`, `FAQ`, `Footer`).
  - Extracts design tokens (colors, fonts, radius) into `tailwind.config.ts`.
  - Converts components to **Next.js 15 (App Router)**, **Vite + React (TypeScript)**, **Nuxt 3 / Vue 3**, **SvelteKit / Svelte 5**, or **Astro 5**.
  - Modernizes animations with **Framer Motion** and embeds 3D WebGL via **React Three Fiber** or **Spline**.

---

## ⚡ Strict Operational Protocol: User-Driven Step-by-Step Execution

Whenever executing website cloning or framework conversion, the agent **MUST NEVER** generate a monolithic codebase without user alignment. The agent must proceed through **6 interactive decision gates**:

1. **Gate 1: Ingestion & Inspection**
   - Present discovered pages, sections, design tokens, and media.
   - **Ask user**: Select which pages and sections to convert.
2. **Gate 2: Target Framework Selection**
   - **Ask user**: Choose framework (Next.js 15, Vite React TS, Nuxt 3, Svelte 5, Astro 5) and package manager.
3. **Gate 3: Component Granularity Strategy**
   - **Ask user**: Atomic UI primitives (`Button`, `Card`, `Badge`) vs Section-level files.
4. **Gate 4: Asset, SVG & 3D Strategy**
   - **Ask user**: Map inline SVGs to Lucide Icons? Configure React Three Fiber / Spline for 3D models?
5. **Gate 5: Animation & Interactive State**
   - **Ask user**: Framer Motion declarative scroll reveals vs Tailwind arbitrary classes?
   - Wire up live state: navigation drawer, pricing monthly/annual toggle, accordion collapse, theme toggle.
6. **Gate 6: Incremental Code Generation & Verification**
   - Generate code module by module.
   - Review each milestone with the user.
   - Run build check (`npm run build`) and dev server (`npm run dev`).

---

## 🛠️ CLI Helper Scripts

- **HTML to JSX Converter**:
  ```bash
  node skills/web-clone-architect/scripts/html-to-jsx.js <input.html> [output.tsx]
  ```
- **Design Token Extractor**:
  ```bash
  node skills/web-clone-architect/scripts/token-extractor.js
  ```
