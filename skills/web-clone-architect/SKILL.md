---
name: web-clone-architect
description: Autonomous, user-driven website cloner and modern framework conversion architect. Interactively guides users step-by-step through inspecting any website (live URL, HTML dump, or cloned archive), deconstructing its DOM, extracting design tokens & animations, and converting it into production-grade Next.js (App Router), React + Vite, Vue 3 / Nuxt, Svelte 5 / SvelteKit, or Astro components with Tailwind CSS, TypeScript, and Framer Motion. Use whenever cloning, scraping, migrating, or converting websites to modern component frameworks.
argument-hint: "[target url or local path]"
license: MIT
metadata:
  author: Thanzeer
  version: "2.0.0"
---

# Web Clone Architect (Universal Framework Converter)

An expert, user-driven website cloner and architectural converter. It takes raw cloned websites, HTML/CSS archives, or live URLs, intelligently deconstructs them, and converts them into production-ready, clean, idiomatic modern component frameworks (**Next.js App Router, Vite + React, Nuxt 3 / Vue, SvelteKit, Astro**) with full TypeScript, Tailwind CSS, Lucide icons, Framer Motion animations, and WebGL 3D model preservation.

---

## ⚡ Core Philosophy: User-Driven Step-by-Step Execution

> [!IMPORTANT]
> **Strict Operational Rule**: Never execute an uncontrolled, monolithic conversion all at once.
> You must operate as an interactive pair-programmer. At **each step of the 6-phase protocol**, you must:
> 1. Present your architectural findings.
> 2. Present structured, clear options to the user with recommendations.
> 3. Ask the user for their decision and wait for their confirmation before proceeding to code generation.
> 4. Generate components incrementally (one logical module at a time), verifying quality at each checkpoint.

---

## 🛠️ The 6-Phase User-Driven Interactive Protocol

```text
Target (URL / Folder / HTML)
        │
        ▼
[Phase 1: Ingestion & Inspection] ────► Ask: Pages & Sections Scope?
        │
        ▼
[Phase 2: Target Framework]       ────► Ask: Next.js / Vite / Nuxt / Svelte / Astro?
        │
        ▼
[Phase 3: Component Granularity]  ────► Ask: Atomic vs Section Components?
        │
        ▼
[Phase 4: Asset & 3D Strategy]    ────► Ask: SVG/Lucide & 3D R3F/Spline setup?
        │
        ▼
[Phase 5: Animation & State]      ────► Ask: Framer Motion vs Tailwind classes?
        │
        ▼
[Phase 6: Incremental Generation] ────► Code generation & live verification
```

---

### Phase 1: Ingestion & Architecture Inspection

#### What the Agent Analyzes:
1. **Source Discovery**: Ingests the provided target (live URL, Website-Reaper clone directory in `storage/clones/`, ZIP, or raw HTML).
2. **DOM Hierarchy**: Identifies distinct visual sections:
   - `<header>` / Navigation drawer
   - `#hero` / Hero Banner
   - `#features` / Features Matrix
   - `#pricing` / Pricing Grid
   - `#testimonials` / Review Cards
   - `#faq` / Accordion sections
   - `<footer>` / Links & copyright
3. **Design Tokens & Fonts**: Inspects CSS stylesheets to extract primary/secondary colors, font families (Google Fonts / custom web fonts), border radii, and shadows.
4. **Media & 3D Assets**: Detects images (SVG, WebP), video tags, and 3D WebGL assets (`.glb`, `.gltf`, `.wasm`, `.splinecode`).
5. **Interactive Elements**: Detects menus, modals, tabs, accordions, carousels, and theme toggle buttons.

#### Mandatory User Gate 1:
Output a structured summary table and ask:
> "I have analyzed the target website. Here is the architectural breakdown:
> - **Pages**: [List of discovered pages]
> - **Inner Sections**: [List of identified sections: Hero, Features, Pricing, etc.]
> - **Design Tokens**: Primary [Color], Font [Font Name], Radius [X px]
> - **3D / Media**: [Count of SVGs, WebGL Canvases, 3D Models]
>
> **Which pages and sections would you like to clone and convert?**
> - **Option 1 (Recommended)**: Convert entire landing page and all primary sections.
> - **Option 2**: Select specific sections only (e.g. Hero + Features + Pricing).
> - **Option 3**: Multi-page complete web app conversion."

---

### Phase 2: Target Framework & Toolchain Decision

#### What the Agent Evaluates:
Evaluate which framework best suits the target application:
- **Next.js 15 (App Router)**: Best for SEO, full-stack web applications, landing pages, dynamic server rendering.
- **Vite + React (TypeScript)**: Best for single-page apps (SPAs), dashboards, developer tools, rapid prototyping.
- **Nuxt 3 / Vue 3**: Best for Vue developers needing clean single-file components (`<script setup lang="ts">`).
- **SvelteKit / Svelte 5**: Best for minimal bundle size and ultra-fast reactive runes (`$state()`).
- **Astro 5**: Best for content-heavy sites needing zero client-side JavaScript by default with interactive islands.
- **Modern Componentized HTML5**: Pure Tailwind v4 + Alpine.js or vanilla TypeScript.

#### Mandatory User Gate 2:
Present the framework choices and ask:
> "Which modern target framework and toolchain would you like to build with?
> 1. **Next.js 15 (App Router + React 19 + TypeScript + Tailwind v4 + Framer Motion)** *(Recommended for production web apps)*
> 2. **Vite + React (TypeScript + Tailwind CSS + Lucide Icons + Shadcn/ui)** *(Recommended for fast SPAs)*
> 3. **Nuxt 3 / Vue 3 (TypeScript + Composition API + Tailwind CSS)**
> 4. **SvelteKit / Svelte 5 (Runes + Tailwind CSS)**
> 5. **Astro 5 (Island Architecture + Tailwind CSS)**
> 6. **Clean Semantic HTML5 + Tailwind v4 + Alpine.js**
>
> *Also, let me know your preferred package manager (`pnpm`, `npm`, `bun`, `yarn`).*"

---

### Phase 3: Component Granularity & Styling System

#### What the Agent Proposes:
Propose the exact component tree structure:
- **Layout Components**: `Navbar.tsx`, `Footer.tsx`, `MobileDrawer.tsx`
- **Section Components**: `Hero.tsx`, `FeaturesGrid.tsx`, `PricingTable.tsx`, `FaqAccordion.tsx`, `Testimonials.tsx`
- **UI Primitives**: `Button.tsx`, `Card.tsx`, `Badge.tsx`, `ThemeToggle.tsx`
- **Design Tokens**: Configuration in `tailwind.config.ts` and `globals.css` using CSS custom properties (`--primary`, `--background`, `--card`).

#### Mandatory User Gate 3:
Ask:
> "How granular should we break down the components?
> - **Option A (Atomic Architecture - Recommended)**: Extract shared UI primitives (`Button`, `Card`, `Badge`) used across modular section components (`Hero`, `Features`, `Pricing`).
> - **Option B (Section-Level Components)**: Self-contained section files (`Hero.tsx`, `Features.tsx`) for maximum simplicity and copy-paste portability.
> - **Option C (Custom Split)**: Specify your preferred folder structure."

---

### Phase 4: Asset, Media & 3D WebGL Strategy

#### What the Agent Prepares:
- **Icons**:
  - Replace raw inline SVGs with clean, typed Lucide icons (`lucide-react`, `lucide-vue-next`).
  - Keep brand logos (company logos, social icons) as dedicated clean SVG components.
- **Images**:
  - Convert standard `<img>` tags to framework-native image optimizers (e.g. Next.js `<Image src="..." width={...} height={...} alt="..." />`).
- **3D Models & Spline Scenes**:
  - If `.glb` / `.gltf`: Wrap inside **React Three Fiber (R3F)** (`<Canvas><Model /></Canvas>`).
  - If `.splinecode`: Wrap inside `@splinetool/react-spline`.

#### Mandatory User Gate 4:
Ask:
> "For icons and media:
> 1. **Icons**: Shall I map standard UI icons (arrows, checks, stars, user) to **Lucide Icons** and keep unique custom logos as clean React SVG components?
> 2. **3D Models**: [If present] Shall I configure **React Three Fiber** or **Spline** components for interactive WebGL rendering?
> 3. **Image Optimization**: Shall I use framework-native `<Image />` or relative public paths?"

---

### Phase 5: Animation & State Interactivity Protocol

#### Transforming Dead HTML into Reactive Components:
1. **Navigation Drawer**: Add reactive state (`const [isOpen, setIsOpen] = useState(false)`) with animated mobile drawer.
2. **Pricing Switcher**: Replace static pricing numbers with reactive toggle (`const [isAnnual, setIsAnnual] = useState(false)`), dynamically calculating monthly vs annual discounts.
3. **Accordions / FAQs**: Add collapsible expand/collapse state with smooth height animation.
4. **Theme Mode**: Hook up dark/light mode toggle with `next-themes` or `@vueuse/core` syncing with `localStorage`.
5. **Scroll & Hover Animations**: Replace static styles or dead Webflow script attributes (`data-w-id`, `data-aos`) with **Framer Motion**:
   - Scroll-triggered reveal: `<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>`
   - Staggered card grids: `staggerChildren: 0.1`
   - Hover scaling & card glares.

#### Mandatory User Gate 5:
Ask:
> "For animations and interactive state:
> - **Option A (Recommended - Framer Motion)**: Smooth declarative entrance, scroll reveals, hover lifts, and animated accordion heights.
> - **Option B (Zero-Runtime CSS)**: Pure Tailwind arbitrary transition classes (`transition-all duration-300 hover:-translate-y-1`).
> - **Option C (Lightweight)**: CSS keyframes preserved directly in `globals.css`."

---

### Phase 6: Incremental Code Generation & Verification

#### Step-by-Step Code Generation Protocol:
Never generate all files in a single unreadable blast. Proceed in clean, reviewable milestones:

1. **Milestone 6.1: Project Setup & Design Tokens**
   - Create `package.json`, `tsconfig.json`, `tailwind.config.ts`, `globals.css`.
   - Setup CSS variables (`--background`, `--foreground`, `--primary`, `--border`).
   - *Review with user*.
2. **Milestone 6.2: Core UI Primitives & Layout**
   - Generate `Button.tsx`, `ThemeToggle.tsx`, `Navbar.tsx`, `Footer.tsx`.
   - *Review with user*.
3. **Milestone 6.3: Main Content Sections**
   - Generate `Hero.tsx`, `Features.tsx`, `Pricing.tsx`, `Testimonials.tsx`, `Faq.tsx`.
   - Ensure all JSX attributes are camelCased, styles converted to Tailwind, and states reactive.
   - *Review with user*.
4. **Milestone 6.4: Page Assembly & Subpages**
   - Assemble in `app/page.tsx` (or `App.tsx` / `index.astro`).
   - Add metadata (page title, description, favicon).
5. **Milestone 6.5: Live Build & Verification**
   - Run dependency installation (`npm install`).
   - Run linter / TypeScript check (`npm run build` or `npx tsc`).
   - Launch dev server (`npm run dev`) and test responsiveness.

---

## 🛠️ Code Transformation Reference Rules

When converting HTML to JSX/TSX:
| Raw HTML | Clean JSX / React 19 Equivalent |
| :--- | :--- |
| `class="foo bar"` | `className="foo bar"` |
| `for="email"` | `htmlFor="email"` |
| `tabindex="0"` | `tabIndex={0}` |
| `style="background-color: #000; font-size: 16px;"` | `style={{ backgroundColor: '#000', fontSize: '16px' }}` (or replace with Tailwind classes!) |
| `<img src="pic.jpg">` | `<img src="pic.jpg" alt="..." />` (or `<Image src="..." alt="..." width={...} height={...} />`) |
| `<input type="text">` | `<input type="text" />` |
| `<!-- comment -->` | `{/* comment */}` |
| `stroke-width="2"` | `strokeWidth={2}` |
| `fill-rule="evenodd"` | `fillRule="evenodd"` |
| `onclick="doSomething()"` | `onClick={handleAction}` |

---

## 🚀 Activation Triggers

Activate this skill when:
- The user asks to:
  - *"Clone [website URL] and convert it to Next.js / React / Vue / Svelte / Astro"*
  - *"Turn this website into a modern Tailwind component library"*
  - *"Migrate my old static HTML website to Next.js App Router with TypeScript"*
  - *"Extract the sections and animations from this website into clean React code"*
  - *"Deconstruct this site into reusable components with Framer Motion"*
